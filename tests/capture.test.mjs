import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, rm } from 'node:fs/promises';
import { capture } from '../scripts/capture.mjs';

test('blocked destinations preserve errors and never create screenshots', async () => {
  const out = 'output/test-local-destination-blocked';
  try {
    const { evidence } = await capture({ url: 'http://127.0.0.1/', out });
    assert.equal(evidence.status, 'failed');
    assert.equal(evidence.devices.desktop, undefined);
    assert.match(evidence.errors.join(' '), /IP não público/);
    const stored = JSON.parse(await readFile(new URL('../' + out + '/evidence.json', import.meta.url), 'utf8'));
    assert.equal(stored.status, 'failed');
    const summary = await readFile(new URL('../' + out + '/summary.md', import.meta.url), 'utf8');
    assert.match(summary, /Limitações/);
  } finally {
    await rm(new URL('../' + out + '/', import.meta.url), { recursive: true, force: true });
  }
});
