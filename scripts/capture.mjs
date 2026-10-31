#!/usr/bin/env node
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validatePublicUrl } from './lib/security.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'output');
const LIMIT = 60000;
const cut = (value, n = 500) => String(value || '').trim().slice(0, n);
export function resolveOutputDir(userValue, input) {
  const hostname = (() => { try { return new URL(input).hostname.replace(/[^a-z0-9.-]/gi, '-'); } catch { return 'invalid-url'; } })();
  const folder = userValue || path.join('output', hostname + '-' + new Date().toISOString().replace(/[:.]/g, '-'));
  const destination = path.resolve(ROOT, folder);
  const relative = path.relative(OUTPUT, destination);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Saída deve ser uma subpasta de output/');
  }
  return destination;
}
function parse(argv) {
  const url = argv[0];
  const opts = {};
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '--out' && argv[i + 1]) opts.out = argv[++i];
    else if (argv[i] === '--timeout' && argv[i + 1]) {
      opts.timeout = Number(argv[++i]);
      if (!Number.isFinite(opts.timeout) || opts.timeout < 1000 || opts.timeout > 60000) throw new Error('Timeout fora do intervalo 1000-60000ms');
    } else throw new Error('Argumento não reconhecido: ' + argv[i]);
  }
  if (!url) throw new Error('Uso: npm run capture -- https://site.com [--out output/nome]');
  return { url, ...opts };
}
function summary(e) {
  const lines = [
    '# Resumo da captura',
    '', '- Solicitada: ' + (e.requestedUrl || 'N/A'),
    '- Final: ' + (e.finalUrl || 'Não verificada'),
    '- Data: ' + e.timestamp,
    '- Resultado: ' + e.status,
    '- Redirecionamentos: ' + (e.redirects.length ? e.redirects.join(' -> ') : 'Nenhum registrado'),
    '', '## Evidências',
    ''
  ];
  for (const [device, v] of Object.entries(e.devices)) {
    lines.push('- ' + device + ': ' + (v.screenshot || 'Não disponível') +
      ' | título: ' + (v.title || 'N/A') +
      ' | headings: ' + (v.headings?.length || 0) + ' | CTAs: ' + (v.ctas?.length || 0));
  }
  lines.push('', '## Limitações / erros', '');
  lines.push(...(e.errors.length ? e.errors.map(x => '- ' + x) : ['- Nenhum erro detectado; conferir visualmente os screenshots.']));
  lines.push('', 'Este resumo não é uma auditoria nem uma previsão de conversão.');
  return lines.join('\n') + '\n';
}
async function save(out, evidence) {
  await mkdir(out, { recursive: true });
  await writeFile(path.join(out, 'evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  await writeFile(path.join(out, 'summary.md'), summary(evidence));
}
async function inspect(page) {
  return page.evaluate(limit => {
    const text = el => (el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim();
    const visible = el => {
      const b = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return b.width > 0 && b.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const box = el => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y + scrollY), width: Math.round(r.width), height: Math.round(r.height) };
    };
    const nodes = (selector, max = 100) => [...document.querySelectorAll(selector)].slice(0, max);
    const headings = nodes('h1,h2,h3,h4', 120).filter(visible).map(el => ({
      tag: el.tagName.toLowerCase(), text: text(el).slice(0, 400), bounds: box(el)
    }));
    const links = nodes('a[href]', 250).filter(visible).map(el => ({
      text: text(el).slice(0, 240), href: el.href, bounds: box(el)
    }));
    const buttons = nodes('button,input[type="submit"],[role="button"]', 150).filter(visible).map(el => ({
      text: text(el) || el.value || el.getAttribute('aria-label') || '',
      type: el.getAttribute('type') || 'button', bounds: box(el)
    }));
    const cta = /compr|quero|começar|inscrev|reserv|agend|garant|cadast|checkout|saiba mais|falar|whatsapp|acessar|particip/i;
    const ctas = [...links.map(x => ({ ...x, kind: 'link' })), ...buttons.map(x => ({ ...x, kind: 'button' }))]
      .filter(x => cta.test(x.text) || /checkout|pay\.|wa\.me|whatsapp/i.test(x.href || '')).slice(0, 100);
    const images = nodes('img', 120).filter(visible).map(el => ({
      alt: el.alt || '', src: el.currentSrc || el.src || '', loading: el.loading || '', bounds: box(el)
    }));
    const forms = nodes('form', 50).map(el => ({
      action: el.action, method: el.method, numberOfFields: el.querySelectorAll('input,select,textarea').length,
      labels: [...el.querySelectorAll('label')].map(x => text(x).slice(0, 100)).slice(0, 15),
      bounds: box(el)
    }));
    const sections = nodes('main,section,article,header,footer,[role="region"]', 130)
      .filter(visible).map(el => ({ tag: el.tagName.toLowerCase(), id: el.id || null,
        heading: text(el.querySelector('h1,h2,h3')).slice(0, 150),
        textPreview: text(el).slice(0, 300), bounds: box(el) }))
      .sort((a,b) => a.bounds.y - b.bounds.y).slice(0, 100);
    return {
      title: document.title || '', description: document.querySelector('meta[name="description"]')?.content || '',
      language: document.documentElement.lang || '', text: (document.body?.innerText || '').slice(0, limit),
      headings, links, buttons, ctas, images, forms, sections,
      documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2
    };
  }, LIMIT);
}
async function runDevice(browser, initialUrl, name, viewport, out, evidence, timeout) {
  const mobile = name === 'mobile';
  const context = await browser.newContext({
    viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile,
    locale: 'pt-BR', serviceWorkers: 'block', acceptDownloads: false
  });
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(timeout);
  const redirects = [];
  await page.route('**/*', async route => {
    const target = route.request().url();
    try {
      await validatePublicUrl(target);
      await route.continue();
    } catch (err) {
      if (route.request().isNavigationRequest()) {
        evidence.errors.push(name + ': navegação bloqueada: ' + cut(target, 250) + ' (' + err.message + ')');
      }
      await route.abort('blockedbyclient').catch(() => {});
    }
  });
  page.on('request', req => {
    if (req.isNavigationRequest() && req.frame() === page.mainFrame()) {
      if (!redirects.includes(req.url())) redirects.push(req.url());
    }
  });
  try {
    const response = await page.goto(initialUrl, { waitUntil: 'domcontentloaded', timeout });
    await page.waitForTimeout(800);
    const final = await validatePublicUrl(page.url());
    const data = await inspect(page);
    const image = name + '.png';
    await page.screenshot({ path: path.join(out, image), fullPage: true, animations: 'disabled', timeout });
    evidence.devices[name] = {
      viewport, url: final.href, httpStatus: response?.status() ?? null,
      screenshot: image, ...data
    };
    if (data.horizontalOverflow) evidence.errors.push(name + ': possível overflow horizontal');
    if (!evidence.finalUrl) evidence.finalUrl = final.href;
    for (const u of redirects) if (!evidence.redirects.includes(u)) evidence.redirects.push(u);
  } catch (err) {
    evidence.errors.push(name + ': ' + cut(err.message, 600));
    evidence.devices[name] = { viewport, screenshot: null, status: 'Não verificado', redirects };
  } finally {
    await context.close();
  }
}
export async function capture(args) {
  const out = resolveOutputDir(args.out, args.url);
  const evidence = {
    schemaVersion: 1, requestedUrl: args.url, finalUrl: null,
    timestamp: new Date().toISOString(), status: 'failed', redirects: [], devices: {}, errors: []
  };
  await mkdir(out, { recursive: true });
  let browser;
  try {
    const url = await validatePublicUrl(args.url);
    let playwright;
    try { playwright = await import('playwright'); }
    catch { throw new Error('Playwright ausente: execute npm ci'); }
    try { browser = await playwright.chromium.launch({ headless: true }); }
    catch { throw new Error('Chromium ausente: execute npx playwright install chromium'); }
    const timeout = args.timeout || 20000;
    await runDevice(browser, url.href, 'desktop', { width: 1440, height: 900 }, out, evidence, timeout);
    await runDevice(browser, url.href, 'mobile', { width: 390, height: 844 }, out, evidence, timeout);
    evidence.status = evidence.devices.desktop?.screenshot && evidence.devices.mobile?.screenshot ? 'complete' : 'partial';
  } catch (err) {
    evidence.errors.push(cut(err.message, 600));
  } finally {
    if (browser) await browser.close().catch(() => {});
    await save(out, evidence);
  }
  return { out, evidence };
}
const self = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (self) {
  try {
    const args = parse(process.argv.slice(2));
    const result = await capture(args);
    console.log('Evidências: ' + result.out);
    console.log('Status: ' + result.evidence.status);
    if (result.evidence.status !== 'complete') {
      console.error(result.evidence.errors.join('\n'));
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(err.message);
    process.exitCode = 2;
  }
}
