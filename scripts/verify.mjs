#!/usr/bin/env node
import { access, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'CLAUDE.md', 'README.md', '.gitignore', 'package.json', 'package-lock.json',
  '.claude/skills/sales-page-auditor/SKILL.md',
  '.claude/skills/sales-page-auditor/references/FRAMEWORKS.md',
  '.claude/skills/sales-page-auditor/references/RUBRIC.md',
  '.claude/skills/sales-page-auditor/references/REPORT_TEMPLATE.md',
  'scripts/capture.mjs', 'scripts/report.mjs', 'scripts/verify.mjs',
  'scripts/lib/security.mjs', 'scripts/lib/score.mjs',
  'tests/security.test.mjs', 'tests/score.test.mjs', 'tests/report.test.mjs', 'tests/capture.test.mjs',
  'examples/sample-audit.json'
];
let errors = [];
for (const item of required) {
  try { await access(path.join(root, item)); }
  catch { errors.push('Arquivo ausente: ' + item); }
}
try {
  const s = await readFile(path.join(root, '.claude/skills/sales-page-auditor/SKILL.md'), 'utf8');
  if (!/^---\r?\n[\s\S]*?\r?\n---\r?\n/.test(s)) errors.push('Frontmatter YAML ausente');
  for (const field of ['name: sales-page-auditor', 'description:', 'argument-hint:', '$ARGUMENTS']) {
    if (!s.includes(field)) errors.push('SKILL.md sem: ' + field);
  }
  const rubric = await readFile(path.join(root, '.claude/skills/sales-page-auditor/references/RUBRIC.md'), 'utf8');
  if (!rubric.includes('100 pontos') || !rubric.includes('N/A')) errors.push('Rubrica incompleta');
  const gi = await readFile(path.join(root, '.gitignore'), 'utf8');
  if (!/^output\/$/m.test(gi)) errors.push('output/ não está ignorado');
} catch (e) { errors.push('Erro ao validar documentação: ' + e.message); }
for (const item of required.filter(f => f.endsWith('.mjs'))) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, item)], { encoding: 'utf8' });
  if (result.status !== 0) errors.push('Sintaxe: ' + item + '\n' + result.stderr);
}
const tests = spawnSync(process.execPath, ['--test', 'tests/security.test.mjs','tests/score.test.mjs','tests/report.test.mjs','tests/capture.test.mjs'], { cwd: root, stdio: 'inherit' });
if (tests.status !== 0) errors.push('Testes unitários falharam');
if (errors.length) {
  console.error('FALHA DE VERIFICAÇÃO:\n- ' + errors.join('\n- '));
  process.exitCode = 1;
} else {
  console.log('PASS: arquivos, skill metadata, sintaxe, rubrica, testes unitários');
}
