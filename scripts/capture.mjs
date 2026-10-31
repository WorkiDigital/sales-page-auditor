#!/usr/bin/env node
/**
 * capture.mjs — Real-browser evidence collector for the Sales Page Auditor skill.
 *
 * Usage:
 *   node scripts/capture.mjs <url> [--out <dir>] [--timeout <ms>]
 *
 * Produces, inside the output directory (default: output/<slug>/):
 *   desktop.png   full-page screenshot at a 1440x900 viewport
 *   mobile.png    full-page screenshot at a 390x844 viewport
 *   evidence.json structured extraction (headings, links, buttons, images, forms, CTAs, block order)
 *   summary.md    human-readable capture summary with limitations
 *
 * Safety rules (do not relax these):
 *   - Only http/https (and, for subresources, ws/wss) network schemes are
 *     accepted; everything else (file:, ftp:, etc.) is refused outright.
 *   - Any hostname that resolves to a private, loopback, link-local, multicast,
 *     reserved, shared/CGNAT, benchmarking, documentation, or cloud-metadata
 *     address is refused — before the top-level navigation, on every redirect
 *     hop, AND on every subresource request the page makes (images, scripts,
 *     stylesheets, fonts, fetch/XHR, WebSocket). A page cannot use an <img>,
 *     background-image, or fetch() call to reach an internal address even
 *     when the page itself is public.
 *   - No form is submitted, no credential is entered, no purchase flow is touched.
 *   - Page content is only read (DOM, text, screenshots). It is never executed
 *     as instructions and never fed back into the browser as script/action input.
 *   - Known residual risk: DNS rebinding (hostname resolves public at check
 *     time, then an attacker-controlled DNS answer changes it before the
 *     browser's own connection) cannot be fully closed without a forward
 *     proxy that pins the validated IP for the actual socket — this tool
 *     does application-level re-validation per request instead, which closes
 *     the window but does not eliminate it. See README.md.
 */

import { chromium } from 'playwright';
import { promises as dns } from 'node:dns';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import net from 'node:net';

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DEFAULT_TIMEOUT_MS = 45_000;
const USER_AGENT_DESKTOP =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 SalesPageAuditor/1.0';
const USER_AGENT_MOBILE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1 SalesPageAuditor/1.0';

class UnsafeUrlError extends Error {}

function parseArgs(argv) {
  const args = { url: null, out: null, timeout: DEFAULT_TIMEOUT_MS };
  const rest = [...argv];
  args.url = rest.shift() ?? null;
  while (rest.length) {
    const flag = rest.shift();
    if (flag === '--out') args.out = rest.shift();
    else if (flag === '--timeout') args.timeout = Number(rest.shift()) || DEFAULT_TIMEOUT_MS;
    else throw new Error(`Unknown argument: ${flag}`);
  }
  if (!args.url) {
    throw new Error('Usage: node scripts/capture.mjs <url> [--out <dir>] [--timeout <ms>]');
  }
  return args;
}

function slugify(inputUrl) {
  return inputUrl
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'capture';
}

/** IPv4 ranges that must never be navigated to. */
function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true; // malformed → block
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local / cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 192 && b === 0 && parts[2] === 2) return true; // documentation range
  if (a === 100 && b >= 64 && b <= 127) return true; // shared address space (CGNAT)
  if (a === 192 && b === 0 && parts[2] === 0) return true; // 192.0.0.0/24 IETF protocol assignments
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15 benchmarking
  if (a === 198 && b === 51 && parts[2] === 100) return true; // TEST-NET-2
  if (a === 203 && b === 0 && parts[2] === 113) return true; // TEST-NET-3
  if (a >= 224) return true; // multicast (224-239) + reserved (240-255)
  return false;
}

function isPrivateIPv6(ip) {
  const lower = ip.toLowerCase();
  if (lower === '::1') return true; // loopback
  if (lower === '::') return true;
  if (lower.startsWith('fe80:')) return true; // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local fc00::/7
  if (lower.startsWith('::ffff:')) {
    // IPv4-mapped IPv6 — check the embedded IPv4
    const mapped = lower.split(':').pop();
    if (mapped && mapped.includes('.')) return isPrivateIPv4(mapped);
  }
  return false;
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return true; // unrecognized → block
}

const BLOCKED_HOSTNAME_SUFFIXES = [
  'localhost',
  '.local',
  '.internal',
  '.lan',
  '.home.arpa',
  '.test',
];

async function assertHostIsPublic(hostname) {
  const lower = hostname.toLowerCase();
  if (BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => lower === suffix.replace(/^\./, '') || lower.endsWith(suffix))) {
    throw new UnsafeUrlError(`Refusing to access internal/reserved host: ${hostname}`);
  }
  if (net.isIP(lower)) {
    if (isPrivateIp(lower)) {
      throw new UnsafeUrlError(`Refusing to access private/reserved IP: ${hostname}`);
    }
    return;
  }
  let records;
  try {
    records = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch (err) {
    throw new UnsafeUrlError(`DNS resolution failed for ${hostname}: ${err.message}`);
  }
  if (records.length === 0) {
    throw new UnsafeUrlError(`No DNS records for ${hostname}`);
  }
  for (const { address } of records) {
    if (isPrivateIp(address)) {
      throw new UnsafeUrlError(
        `Refusing to access ${hostname}: resolves to private/reserved address ${address}`
      );
    }
  }
}

async function assertUrlIsSafe(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError(`Not a valid URL: ${rawUrl}`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new UnsafeUrlError(`Only http/https URLs are allowed, got: ${parsed.protocol}`);
  }
  if (parsed.username || parsed.password) {
    throw new UnsafeUrlError('URLs with embedded credentials are not allowed.');
  }
  await assertHostIsPublic(parsed.hostname);
  return parsed;
}

/**
 * Schemes that never touch the network and are therefore safe regardless of
 * "hostname" (inline data, blobs created by the page itself from already-
 * fetched/validated bytes, Playwright's internal blank page).
 */
const SAFE_NON_NETWORK_SCHEMES = new Set(['data:', 'blob:', 'about:', 'chrome-error:', 'filesystem:']);

/** Network schemes we validate like http/https. Anything else (file:, ftp:, etc.) is refused outright. */
const VALIDATED_NETWORK_SCHEMES = new Set(['http:', 'https:', 'ws:', 'wss:']);

/**
 * Gatekeeper applied to EVERY request a page makes — not just the top-level
 * document — so an <img>, <script>, stylesheet, font, XHR/fetch, WebSocket,
 * or redirect hop cannot be used to reach a private/internal address even
 * when the top-level navigation target was public. This closes the gap a
 * document-only check would leave open (SSRF via subresources).
 *
 * `cache` is a per-capture Map<hostname, {allow, reason}> so repeated
 * subresources from the same host (e.g. a CDN serving dozens of images)
 * don't trigger a fresh DNS lookup each time. Residual risk: this is still
 * an application-level check, not a pinned connection — see the
 * "DNS rebinding" note in README.md for why a perfect guarantee would
 * require a forward proxy that controls the actual socket, which this tool
 * does not implement.
 */
async function evaluateRequestUrl(rawUrl, cache) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { allow: false, reason: `Malformed request URL: ${rawUrl}` };
  }
  if (SAFE_NON_NETWORK_SCHEMES.has(parsed.protocol)) {
    return { allow: true };
  }
  if (!VALIDATED_NETWORK_SCHEMES.has(parsed.protocol)) {
    return { allow: false, reason: `Blocked non-http(s) request scheme "${parsed.protocol}" for ${rawUrl}` };
  }
  const hostKey = parsed.hostname.toLowerCase();
  if (cache?.has(hostKey)) {
    return cache.get(hostKey);
  }
  let result;
  try {
    await assertHostIsPublic(parsed.hostname);
    result = { allow: true };
  } catch (err) {
    result = { allow: false, reason: err.message };
  }
  cache?.set(hostKey, result);
  return result;
}

/** Runs inside the page; must not depend on anything outside the DOM/window it's given. */
function extractPageData() {
  function visibleText(el) {
    if (!el) return '';
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return '';
    return (el.innerText || el.textContent || '').trim();
  }

  function isCtaLike(text, role) {
    if (!text) return false;
    const t = text.toLowerCase();
    const ctaWords = [
      'buy', 'comprar', 'subscribe', 'assinar', 'start', 'começar', 'comece',
      'get', 'obter', 'join', 'inscre', 'order', 'pedido', 'sign up', 'signup',
      'cadastr', 'try', 'teste', 'download', 'baixar', 'enroll', 'matricul',
      'quero', 'acessar', 'garantir', 'learn more', 'saiba mais', 'add to cart',
      'checkout', 'register', 'book', 'agendar', 'call', 'demo', 'request',
    ];
    return role === 'button' || ctaWords.some((w) => t.includes(w));
  }

  const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((el, i) => ({
    index: i,
    tag: el.tagName.toLowerCase(),
    text: visibleText(el).slice(0, 300),
  })).filter((h) => h.text.length > 0);

  const links = Array.from(document.querySelectorAll('a[href]')).map((el) => ({
    text: visibleText(el).slice(0, 200),
    href: el.getAttribute('href'),
  })).filter((l) => l.text || l.href);

  const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"]')).map((el) => ({
    text: (visibleText(el) || el.getAttribute('value') || el.getAttribute('aria-label') || '').slice(0, 200),
    tag: el.tagName.toLowerCase(),
  })).filter((b) => b.text);

  const images = Array.from(document.querySelectorAll('img')).map((el) => ({
    src: el.getAttribute('src') || el.getAttribute('data-src') || null,
    alt: el.getAttribute('alt') || '',
    width: el.naturalWidth || null,
    height: el.naturalHeight || null,
  })).slice(0, 500);

  const forms = Array.from(document.querySelectorAll('form')).map((form) => ({
    action: form.getAttribute('action') || null,
    method: (form.getAttribute('method') || 'get').toLowerCase(),
    fieldCount: form.querySelectorAll('input, textarea, select').length,
    fieldTypes: Array.from(form.querySelectorAll('input')).map((i) => i.type).slice(0, 30),
    submitLabel: (() => {
      const btn = form.querySelector('button, input[type="submit"]');
      return btn ? (visibleText(btn) || btn.getAttribute('value') || '').slice(0, 120) : null;
    })(),
  }));

  const ctaCandidates = [...buttons, ...links.map((l) => ({ text: l.text, tag: 'a', href: l.href }))]
    .filter((el) => isCtaLike(el.text, el.tag === 'button' ? 'button' : 'link'))
    .slice(0, 60);

  // Approximate block/section order by walking top-level semantic containers in DOM order.
  const blockSelector = 'section, header, footer, main, article, [data-section], .section';
  let blocks = Array.from(document.querySelectorAll(blockSelector));
  if (blocks.length === 0) {
    // Fallback: direct children of body as a rough proxy for visual blocks.
    blocks = Array.from(document.body.children);
  }
  const blockOrder = blocks.slice(0, 80).map((el, i) => {
    const rect = el.getBoundingClientRect();
    const heading = el.querySelector('h1,h2,h3');
    return {
      index: i,
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      approxTopPx: Math.round(rect.top + window.scrollY),
      headingText: heading ? visibleText(heading).slice(0, 150) : null,
      textPreview: visibleText(el).slice(0, 180),
    };
  }).sort((a, b) => a.approxTopPx - b.approxTopPx);

  const bodyText = visibleText(document.body).slice(0, 50_000);

  return {
    title: document.title || null,
    metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || null,
    lang: document.documentElement.lang || null,
    headings,
    links,
    buttons,
    images,
    forms,
    ctaCandidates,
    blockOrder,
    bodyTextSample: bodyText,
    counts: {
      headings: headings.length,
      links: links.length,
      buttons: buttons.length,
      images: images.length,
      forms: forms.length,
    },
  };
}

async function captureViewport(browser, { url, viewport, userAgent, label, timeout }) {
  const context = await browser.newContext({
    viewport,
    userAgent,
    deviceScaleFactor: label === 'mobile' ? 2 : 1,
    isMobile: label === 'mobile',
    hasTouch: label === 'mobile',
    ignoreHTTPSErrors: false,
  });

  const redirectChain = [];
  const consoleErrors = [];
  const limitations = [];

  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300));
  });
  page.on('response', (response) => {
    const status = response.status();
    if (status >= 300 && status < 400) {
      redirectChain.push({ from: response.url(), status });
    }
  });

  // Validate EVERY request the page makes — top-level navigation (including
  // each redirect hop, since Chromium re-issues a request per hop and each
  // one passes back through this handler), and every subresource (images,
  // scripts, stylesheets, fonts, fetch/XHR, WebSocket, media). This closes
  // the SSRF gap a document-only check leaves open: a page could otherwise
  // reference an internal URL in an <img>, background-image, fetch() call,
  // or WebSocket connection even when the top-level page itself is public.
  const hostValidationCache = new Map();
  const blockedHostsSeen = new Set();
  await context.route('**/*', async (route, request) => {
    const { allow, reason } = await evaluateRequestUrl(request.url(), hostValidationCache);
    if (!allow) {
      const key = `${request.resourceType()}:${reason}`;
      if (!blockedHostsSeen.has(key)) {
        blockedHostsSeen.add(key);
        limitations.push(`Blocked ${request.resourceType()} request: ${reason}`);
      }
      await route.abort('blockedbyclient');
      return;
    }
    await route.continue();
  });

  let navigationError = null;
  let response = null;
  try {
    response = await page.goto(url, { waitUntil: 'load', timeout });
  } catch (err) {
    navigationError = err.message;
  }

  if (!navigationError) {
    try {
      await page.waitForLoadState('networkidle', { timeout: 8_000 });
    } catch {
      limitations.push('Network did not reach idle state within 8s; page may use continuous background activity (ads, trackers, chat widgets).');
    }
    // Let lazy-loaded sections/images settle without interacting with the page.
    await page.waitForTimeout(800);
  }

  const finalUrl = page.url();

  let extracted = null;
  let antiBotSuspected = false;
  if (!navigationError) {
    try {
      extracted = await page.evaluate(extractPageData);
    } catch (err) {
      limitations.push(`DOM extraction failed: ${err.message}`);
    }
    const bodyLower = (extracted?.bodyTextSample || '').toLowerCase();
    if (
      /captcha|are you a human|verify you are human|access denied|checking your browser|cloudflare/.test(bodyLower) &&
      (extracted?.counts.headings ?? 0) < 2
    ) {
      antiBotSuspected = true;
      limitations.push('Page content suggests a bot/CAPTCHA challenge or access block; extraction may be unreliable.');
    }
  }

  let screenshotPath = null;
  const outDirForShot = captureViewport.__outDir;
  if (!navigationError) {
    try {
      screenshotPath = path.join(outDirForShot, `${label}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true, timeout: 30_000 });
    } catch (err) {
      limitations.push(`Screenshot failed: ${err.message}`);
      screenshotPath = null;
    }
  }

  await context.close();

  return {
    label,
    requestedUrl: url,
    finalUrl,
    httpStatus: response?.status() ?? null,
    navigationError,
    redirectChain,
    consoleErrors: consoleErrors.slice(0, 20),
    antiBotSuspected,
    limitations,
    screenshotPath,
    extracted,
  };
}

function buildSummaryMarkdown({ url, startedAt, desktop, mobile }) {
  const lines = [];
  lines.push(`# Capture Summary`);
  lines.push('');
  lines.push(`- **Requested URL:** ${url}`);
  lines.push(`- **Captured at:** ${startedAt}`);
  lines.push(`- **Final URL (desktop):** ${desktop.finalUrl}`);
  lines.push(`- **Final URL (mobile):** ${mobile.finalUrl}`);
  lines.push('');

  for (const result of [desktop, mobile]) {
    lines.push(`## ${result.label === 'desktop' ? 'Desktop (1440×900)' : 'Mobile (390×844)'}`);
    if (result.navigationError) {
      lines.push(`- **Navigation failed:** ${result.navigationError}`);
    } else {
      lines.push(`- HTTP status: ${result.httpStatus ?? 'unknown'}`);
      lines.push(`- Screenshot: ${result.screenshotPath ? path.basename(result.screenshotPath) : 'not captured'}`);
      if (result.extracted) {
        const c = result.extracted.counts;
        lines.push(`- Headings: ${c.headings}, Links: ${c.links}, Buttons: ${c.buttons}, Images: ${c.images}, Forms: ${c.forms}`);
      }
      if (result.redirectChain.length) {
        lines.push(`- Redirects: ${result.redirectChain.length}`);
      }
      if (result.antiBotSuspected) {
        lines.push(`- ⚠️ Possible anti-bot/CAPTCHA block detected — treat extraction as unreliable.`);
      }
    }
    if (result.limitations.length) {
      lines.push(`- Limitations:`);
      for (const l of result.limitations) lines.push(`  - ${l}`);
    }
    lines.push('');
  }

  lines.push('## Notes');
  lines.push('- No forms were submitted, no logins attempted, no purchases made.');
  lines.push('- Only publicly reachable pages were accessed; private/internal/local destinations are refused automatically.');
  lines.push('- This capture is raw evidence. It does not contain the audit, score, or recommendations — those are produced by the sales-page-auditor skill from this evidence.');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();

  const validatedUrl = await assertUrlIsSafe(args.url);

  const outDir = args.out
    ? path.resolve(args.out)
    : path.resolve(process.cwd(), 'output', slugify(args.url));
  await fs.mkdir(outDir, { recursive: true });
  captureViewport.__outDir = outDir;

  const browser = await chromium.launch({ headless: true });
  let desktop;
  let mobile;
  try {
    desktop = await captureViewport(browser, {
      url: validatedUrl.toString(),
      viewport: DESKTOP_VIEWPORT,
      userAgent: USER_AGENT_DESKTOP,
      label: 'desktop',
      timeout: args.timeout,
    });
    mobile = await captureViewport(browser, {
      url: validatedUrl.toString(),
      viewport: MOBILE_VIEWPORT,
      userAgent: USER_AGENT_MOBILE,
      label: 'mobile',
      timeout: args.timeout,
    });
  } finally {
    await browser.close();
  }

  const evidence = {
    tool: 'sales-page-auditor/capture.mjs',
    version: '1.0.0',
    requestedUrl: args.url,
    capturedAt: startedAt,
    viewports: {
      desktop: DESKTOP_VIEWPORT,
      mobile: MOBILE_VIEWPORT,
    },
    desktop,
    mobile,
  };

  await fs.writeFile(path.join(outDir, 'evidence.json'), JSON.stringify(evidence, null, 2), 'utf8');
  const summary = buildSummaryMarkdown({ url: args.url, startedAt, desktop, mobile });
  await fs.writeFile(path.join(outDir, 'summary.md'), summary, 'utf8');

  console.log(`Capture complete: ${outDir}`);
  console.log(`  desktop: ${desktop.navigationError ? 'FAILED - ' + desktop.navigationError : 'ok'}`);
  console.log(`  mobile:  ${mobile.navigationError ? 'FAILED - ' + mobile.navigationError : 'ok'}`);
  console.log(`  evidence.json, summary.md written.`);

  if (desktop.navigationError && mobile.navigationError) {
    process.exitCode = 2;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    if (err instanceof UnsafeUrlError) {
      console.error(`Refused: ${err.message}`);
      process.exitCode = 3;
    } else {
      console.error(`Capture failed: ${err.stack || err.message}`);
      process.exitCode = 1;
    }
  });
}

export {
  assertUrlIsSafe,
  assertHostIsPublic,
  evaluateRequestUrl,
  isPrivateIp,
  isPrivateIPv4,
  isPrivateIPv6,
  slugify,
  UnsafeUrlError,
};
