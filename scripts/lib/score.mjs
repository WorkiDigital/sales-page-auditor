export const CRITERIA = Object.freeze([
  { id: 'clareza', label: 'Clareza da mensagem', weight: 15 },
  { id: 'promessa', label: 'Promessa e especificidade', weight: 15 },
  { id: 'argumentacao', label: 'Argumentação e consciência', weight: 15 },
  { id: 'oferta', label: 'Oferta e valor percebido', weight: 15 },
  { id: 'provas', label: 'Provas e confiança', weight: 10 },
  { id: 'desktop', label: 'Estrutura visual desktop', weight: 10 },
  { id: 'mobile', label: 'Experiência mobile', weight: 10 },
  { id: 'ctas', label: 'CTAs e fricção', weight: 10 }
]);
export function scoreAudit(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Notas inválidas');
  const extra = Object.keys(input).filter(k => !CRITERIA.some(c => c.id === k));
  if (extra.length) throw new Error('Critérios desconhecidos: ' + extra.join(', '));
  let earned = 0;
  let possible = 0;
  const categories = CRITERIA.map(c => {
    const data = input[c.id];
    if (!data || data.status === 'N/A') return { ...c, status: 'N/A', score: null, evidence: data?.evidence || '' };
    if (data.status && data.status !== 'avaliado') throw new Error('Status inválido em ' + c.id);
    const score = data.score;
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > c.weight)
      throw new Error('Nota fora do intervalo: ' + c.id);
    if (typeof data.evidence !== 'string' || data.evidence.trim().length < 8)
      throw new Error('Falta evidência para ' + c.id);
    possible += c.weight;
    earned += score;
    return { ...c, status: 'avaliado', score, evidence: data.evidence };
  });
  return {
    score: possible ? Math.round(earned / possible * 1000) / 10 : null,
    coverage: possible,
    earned, possible, categories,
    warning: possible ? 'Nota diagnóstica, não previsão de conversão.' : 'Sem cobertura verificável: nota indisponível.'
  };
}
