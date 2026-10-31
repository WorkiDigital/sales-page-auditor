import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { renderReport, runReport } from '../scripts/report.mjs';
const fixture = JSON.parse(await readFile(new URL('../examples/sample-audit.json', import.meta.url), 'utf8'));
test('report includes 13 required sections and explicit N/A', () => {
  const text = renderReport(fixture);
  for (const term of ['Resumo executivo', 'Pontuação detalhada', 'Diagnóstico de copy',
    'Diagnóstico visual desktop', 'Diagnóstico visual mobile',
    'Inventário dos blocos', 'Pontos fortes', 'Problemas e recomendações',
    'Estrutura persuasiva recomendada', 'Nova copy por bloco',
    'Posicionamento dos CTAs', 'Hipóteses de testes A/B', 'Evidências e limitações']) {
    assert.ok(text.includes(term), term);
  }
  assert.ok(text.includes('Cobertura:** 0%'));
  assert.ok(text.includes('**Nota:** N/A'));
});
test('rejects unclassified findings', () => {
  assert.throws(() => renderReport({ ...fixture, findings: [{ status: 'talvez' }] }));
});
test('can write a Markdown report to a folder', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'spa-'));
  try {
    const dest = path.join(dir, 'report.md');
    const input = path.join(dir, 'input.json');
    const { writeFile } = await import('node:fs/promises');
    await writeFile(input, JSON.stringify(fixture));
    await runReport(input, dest);
    const actual = await readFile(dest, 'utf8');
    assert.ok(actual.includes('AUDITORIA') || actual.includes('Auditoria'));
  } finally { await rm(dir, { recursive: true, force: true }); }
});
