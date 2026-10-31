import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { scoreAudit } from './lib/score.mjs';

const clean = x => String(x ?? 'Não informado').replace(/\r/g, '').replace(/\0/g, '').trim();
const list = (arr, fallback) => Array.isArray(arr) && arr.length
  ? arr.map(x => '- ' + clean(x)).join('\n') : '- ' + fallback;
export function renderReport(audit) {
  if (!audit || typeof audit !== 'object' || !audit.url) throw new Error('Auditoria precisa de URL');
  const result = scoreAudit(audit.scores || {});
  const items = Array.isArray(audit.findings) ? audit.findings : [];
  for (const f of items) {
    if (!['Observado', 'Hipótese', 'Não verificado'].includes(f.status)) throw new Error('Classificação inválida de apontamento');
    if (!f.description || !f.reason || !f.recommendation) throw new Error('Apontamento incompleto: descrição, motivo e recomendação são necessários');
  }
  const section = (name, contents) => '## ' + name + '\n\n' + clean(contents || 'Não verificado') + '\n';
  const lines = [
    '# Auditoria de página de vendas',
    '',
    '**URL:** ' + clean(audit.url),
    '**Objetivo comercial:** ' + clean(audit.goal),
    '**Data:** ' + clean(audit.date || new Date().toISOString()),
    '**Nota:** ' + (result.score === null ? 'N/A' : result.score + '/100') + ' | **Cobertura:** ' + result.coverage + '%',
    '**Aviso:** ' + result.warning,
    '',
    section('Resumo executivo', audit.executiveSummary),
    '## Pontuação detalhada\n',
    '| Critério | Pontos | Peso | Evidência |\n|---|---:|---:|---|',
    ...result.categories.map(c => '| ' + c.label + ' | ' + (c.score === null ? 'N/A' : c.score) + ' | ' + c.weight + ' | ' + c.evidence.replace(/\|/g, '/') + ' |'),
    '',
    section('Diagnóstico de copy', audit.copyDiagnosis),
    section('Diagnóstico visual desktop', audit.desktopDiagnosis),
    section('Diagnóstico visual mobile', audit.mobileDiagnosis),
    '## Inventário dos blocos\n\n' + list(audit.blocks, 'Blocos não verificados') + '\n',
    '## Pontos fortes\n\n' + list(audit.strengths, 'Nenhum ponto forte verificado') + '\n',
    '## Problemas e recomendações\n',
    ...items.map((f, i) => [
      '### ' + (i + 1) + '. ' + clean(f.title || 'Oportunidade'),
      '**Classificação:** ' + f.status + ' | **Impacto:** ' + clean(f.impact) +
      ' | **Confiança:** ' + clean(f.confidence) + ' | **Esforço:** ' + clean(f.effort),
      '**Problema:** ' + clean(f.description),
      '**Evidência:** ' + clean(f.evidence),
      '**Por quê:** ' + clean(f.reason),
      '**Mudança proposta:** ' + clean(f.recommendation),
      ''
    ].join('\n')),
    section('Estrutura persuasiva recomendada', audit.proposedStructure),
    section('Nova copy por bloco', audit.copySuggestions),
    section('Posicionamento dos CTAs', audit.ctaPlan),
    section('Hipóteses de testes A/B', audit.abTests),
    section('Evidências e limitações', audit.limitations),
    '**Capturas:** ' + list(audit.screenshots, 'Capturas não disponíveis')
  ];
  return lines.join('\n') + '\n';
}
export async function runReport(inputPath, outputPath) {
  const input = JSON.parse(await readFile(inputPath, 'utf8'));
  const text = renderReport(input);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, text, 'utf8');
  return outputPath;
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const args = process.argv.slice(2);
  const input = args[args.indexOf('--input') + 1];
  const output = args[args.indexOf('--out') + 1];
  if (!input || !output || input.startsWith('--') || output.startsWith('--')) {
    console.error('Uso: node scripts/report.mjs --input output/<id>/audit.json --out output/<id>/report.md');
    process.exitCode = 2;
  } else {
    runReport(input, output).then(file => console.log('Relatório: ' + file)).catch(e => { console.error(e.message); process.exitCode = 1; });
  }
}
