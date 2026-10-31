import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreAudit, CRITERIA } from '../scripts/lib/score.mjs';
test('fixed rubric sums to 100', () => {
  assert.equal(CRITERIA.reduce((acc, item) => acc + item.weight, 0), 100);
});
test('correct proportional score and measured coverage', () => {
  const actual = scoreAudit({
    clareza: { score: 9, evidence: 'Headline compreensível e direta.' },
    mobile: { score: 5, evidence: 'Captura mobile com hierarquia.' }
  });
  assert.equal(actual.score, 56);
  assert.equal(actual.coverage, 25);
  assert.equal(actual.categories.filter(x => x.status === 'N/A').length, 6);
});
test('empty evidence leads to N/A, not fabricated 0', () => {
  const s = scoreAudit({});
  assert.equal(s.score, null);
  assert.equal(s.coverage, 0);
});
test('refuses bad weights, evidence and statuses', () => {
  assert.throws(() => scoreAudit({ clareza: { score: 16, evidence: 'Observação sólida' } }));
  assert.throws(() => scoreAudit({ clareza: { score: 12, evidence: '' } }));
  assert.throws(() => scoreAudit({ desconhecido: { score: 2 } }));
  assert.throws(() => scoreAudit({ clareza: { status: 'sim', score: 10, evidence: 'Observação sólida' } }));
});
