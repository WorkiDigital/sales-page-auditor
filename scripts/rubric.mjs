/**
 * Canonical 100-point rubric used by the sales-page-auditor skill.
 * This is the single source of truth for weights — references/RUBRIC.md documents
 * the sub-criteria in prose, but the numbers here are what verify.mjs checks and
 * what any scoring helper must use.
 */

export const CRITERIA = [
  { id: 'message_clarity', label: 'Clareza da mensagem', weight: 15 },
  { id: 'promise_specificity', label: 'Promessa e especificidade', weight: 15 },
  { id: 'argument_awareness', label: 'Argumentação e consciência', weight: 15 },
  { id: 'offer_value', label: 'Oferta e valor percebido', weight: 15 },
  { id: 'proof_trust', label: 'Provas e confiança', weight: 10 },
  { id: 'visual_desktop', label: 'Estrutura visual desktop', weight: 10 },
  { id: 'mobile_experience', label: 'Experiência mobile', weight: 10 },
  { id: 'cta_friction', label: 'CTAs e fricção', weight: 10 },
];

export const TOTAL_WEIGHT = CRITERIA.reduce((sum, c) => sum + c.weight, 0);

/**
 * Computes a 0-100 score from per-criterion scores (0-100 each, or null/undefined
 * for N/A — not verifiable from available evidence). N/A criteria are excluded and
 * the remaining weights are renormalized, with the evaluated coverage reported so
 * the score is never silently treated as if everything were checked.
 *
 * @param {Record<string, number|null>} scores - criterion id -> 0-100 score, or null for N/A
 * @returns {{ total: number, coveragePct: number, breakdown: Array }}
 */
export function computeScore(scores) {
  let evaluatedWeight = 0;
  let weightedSum = 0;
  const breakdown = [];

  for (const criterion of CRITERIA) {
    const raw = scores[criterion.id];
    const isNA = raw === null || raw === undefined;
    if (!isNA) {
      if (typeof raw !== 'number' || raw < 0 || raw > 100) {
        throw new Error(`Invalid score for ${criterion.id}: ${raw} (must be 0-100 or null)`);
      }
      evaluatedWeight += criterion.weight;
      weightedSum += (raw / 100) * criterion.weight;
    }
    breakdown.push({ ...criterion, score: isNA ? null : raw, status: isNA ? 'N/A' : 'evaluated' });
  }

  if (evaluatedWeight === 0) {
    return { total: null, coveragePct: 0, breakdown };
  }

  // Renormalize to the evaluated weight, then scale back into the 0-100 total.
  const total = Math.round((weightedSum / evaluatedWeight) * 100 * 10) / 10;
  const coveragePct = Math.round((evaluatedWeight / TOTAL_WEIGHT) * 100);
  return { total, coveragePct, breakdown };
}
