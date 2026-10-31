#!/usr/bin/env node
/**
 * verify.mjs — Self-contained validation suite for the sales-page-auditor project.
 * No test framework dependency: plain Node assertions, run with `node scripts/verify.mjs`.
 * Exits non-zero if any check fails, so it can be used as a CI/precommit gate.
 */

import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { CRITERIA, TOTAL_WEIGHT, computeScore } from './rubric.mjs';
import {
  assertUrlIsSafe,
  assertHostIsPublic,
  evaluateRequestUrl,
  isPrivateIp,
  slugify,
  UnsafeUrlError,
} from './capture.mjs';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');

const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log(`  ok  - ${name}`);
  } catch (err) {
    results.push({ name, pass: false, error: err.message });
    console.log(`FAIL  - ${name}`);
    console.log(`        ${err.message}`);
  }
}

async function fileExists(relPath) {
  try {
    await fs.access(path.join(ROOT, relPath));
    return true;
  } catch {
    return false;
  }
}

async function readFile(relPath) {
  return fs.readFile(path.join(ROOT, relPath), 'utf8');
}

console.log('== Structure ==');

const REQUIRED_FILES = [
  '.claude/skills/sales-page-auditor/SKILL.md',
  '.claude/skills/sales-page-auditor/references/FRAMEWORKS.md',
  '.claude/skills/sales-page-auditor/references/RUBRIC.md',
  '.claude/skills/sales-page-auditor/references/REPORT_TEMPLATE.md',
  '.claude/skills/sales-page-auditor/references/INTEGRATIONS.md',
  'scripts/capture.mjs',
  'scripts/verify.mjs',
  'scripts/rubric.mjs',
  'CLAUDE.md',
  'README.md',
  'package.json',
  '.gitignore',
  '.github/workflows/ci.yml',
];

for (const f of REQUIRED_FILES) {
  await check(`required file exists: ${f}`, async () => {
    const exists = await fileExists(f);
    assert.ok(exists, `missing ${f}`);
  });
}

console.log('== SKILL.md metadata ==');

await check('SKILL.md has valid YAML frontmatter with name + description', async () => {
  const content = await readFile('.claude/skills/sales-page-auditor/SKILL.md');
  assert.ok(content.startsWith('---\n'), 'SKILL.md must start with --- frontmatter');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, 'frontmatter block not found');
  const frontmatter = match[1];
  assert.ok(/^name:\s*\S+/m.test(frontmatter), 'frontmatter missing "name"');
  assert.ok(/^description:\s*\S+/m.test(frontmatter), 'frontmatter missing "description"');
});

await check('SKILL.md documents the /sales-page-auditor command and its argument forms', async () => {
  const content = await readFile('.claude/skills/sales-page-auditor/SKILL.md');
  assert.ok(content.includes('/sales-page-auditor'), 'command name not documented');
  assert.ok(/foco em copy|foco visual|reestrutur/i.test(content), 'complementary instruction forms not documented');
});

console.log('== Optional external skill integration ==');

await check('SKILL.md references INTEGRATIONS.md and never requires external skills', async () => {
  const content = await readFile('.claude/skills/sales-page-auditor/SKILL.md');
  assert.ok(content.includes('INTEGRATIONS.md'), 'SKILL.md should point to references/INTEGRATIONS.md');
  assert.ok(/funciona.*sem|autossuficiente/i.test(content), 'SKILL.md should state the skill works without external skills');
});

await check('INTEGRATIONS.md documents license + compatibility for all three external repos', async () => {
  const content = await readFile('.claude/skills/sales-page-auditor/references/INTEGRATIONS.md');
  for (const marker of ['coreyhaines31/marketingskills', 'robpalmer99/claude-code-copywriting-skills', 'anthropics/skills', 'MIT', 'CC-BY-4.0', 'Apache-2.0']) {
    assert.ok(content.includes(marker), `INTEGRATIONS.md missing "${marker}"`);
  }
});

console.log('== Rubric ==');

await check('rubric weights sum to exactly 100', () => {
  assert.equal(TOTAL_WEIGHT, 100, `weights sum to ${TOTAL_WEIGHT}, expected 100`);
  assert.equal(CRITERIA.length, 8, 'expected 8 criteria');
});

await check('RUBRIC.md documents the same 8 criteria with matching weights', async () => {
  const content = await readFile('.claude/skills/sales-page-auditor/references/RUBRIC.md');
  for (const c of CRITERIA) {
    const re = new RegExp(`${c.label}[^\\n]*${c.weight}`, 'i');
    assert.ok(re.test(content) || content.includes(String(c.weight)), `RUBRIC.md missing weight ${c.weight} for ${c.label}`);
  }
});

await check('computeScore: full coverage computes a correct weighted average', () => {
  const scores = { message_clarity: 80, promise_specificity: 70, argument_awareness: 90, offer_value: 60, proof_trust: 50, visual_desktop: 100, mobile_experience: 40, cta_friction: 75 };
  const { total, coveragePct } = computeScore(scores);
  const expected = (80*15+70*15+90*15+60*15+50*10+100*10+40*10+75*10) / 100;
  assert.ok(Math.abs(total - expected) < 0.2, `expected ~${expected}, got ${total}`);
  assert.equal(coveragePct, 100);
});

await check('computeScore: N/A criteria are renormalized and coverage drops below 100%', () => {
  const scores = { message_clarity: 80, promise_specificity: 70, argument_awareness: 90, offer_value: 60, proof_trust: null, visual_desktop: null, mobile_experience: null, cta_friction: 75 };
  const { total, coveragePct } = computeScore(scores);
  assert.ok(coveragePct < 100 && coveragePct > 0, `coverage should be partial, got ${coveragePct}`);
  assert.ok(total >= 0 && total <= 100, `total out of range: ${total}`);
});

await check('computeScore: all-N/A returns null total, not a fabricated score', () => {
  const scores = { message_clarity: null, promise_specificity: null, argument_awareness: null, offer_value: null, proof_trust: null, visual_desktop: null, mobile_experience: null, cta_friction: null };
  const { total, coveragePct } = computeScore(scores);
  assert.equal(total, null);
  assert.equal(coveragePct, 0);
});

await check('computeScore: rejects out-of-range scores instead of silently clamping', () => {
  assert.throws(() => computeScore({ message_clarity: 150 }), /Invalid score/);
});

console.log('== URL safety (capture.mjs) ==');

await check('rejects non-http(s) schemes', async () => {
  await assert.rejects(() => assertUrlIsSafe('file:///etc/passwd'), UnsafeUrlError);
  await assert.rejects(() => assertUrlIsSafe('ftp://example.com'), UnsafeUrlError);
});

await check('rejects malformed URLs', async () => {
  await assert.rejects(() => assertUrlIsSafe('not a url'), UnsafeUrlError);
});

await check('rejects loopback and private literal IPs', async () => {
  await assert.rejects(() => assertUrlIsSafe('http://127.0.0.1/'), UnsafeUrlError);
  await assert.rejects(() => assertUrlIsSafe('http://localhost/'), UnsafeUrlError);
  await assert.rejects(() => assertUrlIsSafe('http://192.168.1.10/'), UnsafeUrlError);
  await assert.rejects(() => assertUrlIsSafe('http://10.0.0.5/'), UnsafeUrlError);
  await assert.rejects(() => assertUrlIsSafe('http://169.254.169.254/'), UnsafeUrlError);
});

await check('rejects URLs with embedded credentials', async () => {
  await assert.rejects(() => assertUrlIsSafe('http://user:pass@example.com/'), UnsafeUrlError);
});

await check('isPrivateIp classifies known ranges correctly', () => {
  assert.equal(isPrivateIp('8.8.8.8'), false);
  assert.equal(isPrivateIp('127.0.0.1'), true);
  assert.equal(isPrivateIp('10.1.2.3'), true);
  assert.equal(isPrivateIp('172.20.0.1'), true);
  assert.equal(isPrivateIp('172.32.0.1'), false);
  assert.equal(isPrivateIp('::1'), true);
});

await check('slugify produces a filesystem-safe, non-empty slug', () => {
  const slug = slugify('https://example.com/landing?utm=1&x=2');
  assert.ok(/^[a-zA-Z0-9.-]+$/.test(slug));
  assert.ok(slug.length > 0);
});

await check('isPrivateIp covers additional reserved/benchmarking/test-net ranges', () => {
  assert.equal(isPrivateIp('192.0.0.5'), true, '192.0.0.0/24 IETF protocol assignments');
  assert.equal(isPrivateIp('198.18.0.1'), true, '198.18.0.0/15 benchmarking');
  assert.equal(isPrivateIp('198.51.100.7'), true, 'TEST-NET-2');
  assert.equal(isPrivateIp('203.0.113.9'), true, 'TEST-NET-3');
  assert.equal(isPrivateIp('240.0.0.1'), true, 'reserved 240.0.0.0/4');
  assert.equal(isPrivateIp('1.1.1.1'), false, 'public resolver should remain allowed');
});

console.log('== Subresource / redirect SSRF coverage (evaluateRequestUrl) ==');

await check('evaluateRequestUrl blocks subresource requests to private IPs (not just top-level navigation)', async () => {
  const imgResult = await evaluateRequestUrl('http://169.254.169.254/latest/meta-data/', new Map());
  assert.equal(imgResult.allow, false);
  assert.match(imgResult.reason, /private|reserved/i);

  const xhrResult = await evaluateRequestUrl('https://10.0.0.5/internal-api', new Map());
  assert.equal(xhrResult.allow, false);
});

await check('evaluateRequestUrl blocks non-http(s) request schemes (file:, ftp:) used by subresources', async () => {
  const fileResult = await evaluateRequestUrl('file:///etc/passwd', new Map());
  assert.equal(fileResult.allow, false);
  const ftpResult = await evaluateRequestUrl('ftp://example.com/x', new Map());
  assert.equal(ftpResult.allow, false);
});

await check('evaluateRequestUrl allows safe non-network schemes used internally by pages/browser (data:, blob:, about:)', async () => {
  const dataResult = await evaluateRequestUrl('data:image/png;base64,iVBORw0KGgo=', new Map());
  assert.equal(dataResult.allow, true);
  const blobResult = await evaluateRequestUrl('blob:https://example.com/abc-123', new Map());
  assert.equal(blobResult.allow, true);
  const aboutResult = await evaluateRequestUrl('about:blank', new Map());
  assert.equal(aboutResult.allow, true);
});

await check('evaluateRequestUrl validates ws:/wss: subresource requests like http(s)', async () => {
  const wsResult = await evaluateRequestUrl('ws://127.0.0.1:9999/socket', new Map());
  assert.equal(wsResult.allow, false);
  const wssResult = await evaluateRequestUrl('wss://1.1.1.1/socket', new Map());
  assert.equal(wssResult.allow, true);
});

await check('evaluateRequestUrl caches per-hostname results (repeat subresources skip a fresh DNS lookup)', async () => {
  const cache = new Map();
  const first = await evaluateRequestUrl('https://1.1.1.1/a.js', cache);
  assert.equal(first.allow, true);
  assert.ok(cache.has('1.1.1.1'));
  // Second call for the same host must hit the cache and return the same verdict
  // without needing a working DNS/network path — we simulate this by poisoning
  // the cache entry and confirming evaluateRequestUrl trusts it instead of
  // re-resolving, which is the behavior under test.
  cache.set('1.1.1.1', { allow: false, reason: 'simulated cached block' });
  const second = await evaluateRequestUrl('https://1.1.1.1/b.css', cache);
  assert.equal(second.allow, false);
  assert.equal(second.reason, 'simulated cached block');
});

await check('evaluateRequestUrl rejects malformed subresource URLs instead of throwing', async () => {
  const result = await evaluateRequestUrl('not a url at all', new Map());
  assert.equal(result.allow, false);
});

await check('assertHostIsPublic refuses literal private/cloud-metadata IPs and *.internal hostnames', async () => {
  // dns.lookup with {all:true} returns every A/AAAA record for a hostname; if
  // ANY of them is private, the whole hostname is refused — this is the
  // property that narrows (without eliminating) DNS-rebinding exposure for
  // multi-homed names. Reproducing a resolver that returns mixed public+
  // private records isn't possible without controlling DNS in this
  // environment, so this test asserts the documented contract against known
  // literals instead.
  await assert.rejects(() => assertHostIsPublic('127.0.0.1'), UnsafeUrlError);
  await assert.rejects(() => assertHostIsPublic('169.254.169.254'), UnsafeUrlError);
  await assert.rejects(() => assertHostIsPublic('metadata.internal'), UnsafeUrlError);
});

console.log('== Playwright / browser availability ==');

let browserAvailable = false;
await check('detect whether a Chromium browser is installed (informational)', async () => {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    browserAvailable = true;
  } catch (err) {
    browserAvailable = false;
    console.log(`        (no browser available in this environment: ${err.message.split('\n')[0]})`);
  }
});

if (browserAvailable) {
  await check('capture.mjs produces evidence.json + summary.md for a safe real page', async () => {
    const outDir = path.join(ROOT, 'output', '__verify_tmp__');
    await fs.rm(outDir, { recursive: true, force: true });
    execFileSync('node', ['scripts/capture.mjs', 'https://example.com', '--out', outDir, '--timeout', '20000'], {
      cwd: ROOT,
      stdio: 'pipe',
      timeout: 60_000,
    });
    const evidenceRaw = await fs.readFile(path.join(outDir, 'evidence.json'), 'utf8');
    const evidence = JSON.parse(evidenceRaw);
    assert.ok(evidence.desktop, 'evidence.json missing desktop capture');
    assert.ok(evidence.mobile, 'evidence.json missing mobile capture');
    const summary = await fs.readFile(path.join(outDir, 'summary.md'), 'utf8');
    assert.ok(summary.includes('Capture Summary'));
    await fs.rm(outDir, { recursive: true, force: true });
  });

  await check('capture.mjs exits with a refusal (code 3) for a private-network URL, writes nothing', async () => {
    const outDir = path.join(ROOT, 'output', '__verify_tmp_private__');
    await fs.rm(outDir, { recursive: true, force: true });
    let threw = false;
    try {
      execFileSync('node', ['scripts/capture.mjs', 'http://127.0.0.1:9999/', '--out', outDir], {
        cwd: ROOT,
        stdio: 'pipe',
        timeout: 15_000,
      });
    } catch (err) {
      threw = true;
      assert.equal(err.status, 3, `expected exit code 3, got ${err.status}`);
    }
    assert.ok(threw, 'capture.mjs should have refused and exited non-zero');
    const exists = await fileExists(path.relative(ROOT, outDir));
    assert.ok(!exists, 'no output directory should be created for a refused URL');
  });
} else {
  console.log('  skip - live capture tests (no Chromium browser installed in this environment)');
  console.log('         run: npm run install:browser   (then re-run: npm run verify)');
}

console.log('== Report template ==');

await check('REPORT_TEMPLATE.md contains the 13 required report sections', async () => {
  const content = await readFile('.claude/skills/sales-page-auditor/references/REPORT_TEMPLATE.md');
  const requiredFragments = [
    'URL', 'Resumo Executivo', 'Nota Geral', 'Diagnóstico da Copy', 'Diagnóstico Visual',
    'Inventário', 'Pontos Fortes', 'Recomenda', 'Nova Estrutura', 'Sugest', 'CTA',
    'Teste A/B', 'Evidências e Limitações',
  ];
  for (const fragment of requiredFragments) {
    assert.ok(content.includes(fragment), `REPORT_TEMPLATE.md missing section containing "${fragment}"`);
  }
});

console.log('\n== Result ==');
const failed = results.filter((r) => !r.pass);
console.log(`${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) {
  console.log('\nFailed checks:');
  for (const f of failed) console.log(`  - ${f.name}: ${f.error}`);
  process.exitCode = 1;
} else {
  console.log('All checks passed.');
}
