# Contrato de relatório

O arquivo de entrada audit.json é preenchido pelo agente depois da inspeção. O script report.mjs formata o Markdown e verifica notas e classificações. Ele NÃO audita nem estima conversão sozinho.

Exemplo de esquema mínimo: examples/sample-audit.json.

Campos textuais: url, goal, date, executiveSummary, copyDiagnosis, desktopDiagnosis, mobileDiagnosis, proposedStructure, copySuggestions, ctaPlan, abTests, limitations.

Listas de strings: blocks (na ordem original), strengths, screenshots (caminhos reais para evidências).

scores: objeto indexado pelos IDs da RUBRIC.md; cada valor com score numérico e evidence não vazia, ou status = N/A e motivo.

findings: lista de objetos com title, status [Observado, Hipótese, Não verificado], description, evidence, reason, recommendation, impact, confidence, effort. Indique de onde veio a evidência e sugira texto pronto, não apenas pedido genérico de melhoria.

## Seções do Markdown gerado

1. URL e objetivo comercial.
2. Resumo executivo.
3. Nota geral, cobertura e notas por dimensão.
4. Diagnóstico da copy.
5. Diagnóstico desktop e mobile separadamente.
6. Inventário da estrutura atual.
7. Pontos fortes e problemas (com classificação).
8. Recomendações priorizadas por impacto/confiança/esforço.
9. Nova estrutura persuasiva.
10. Copy alternativa de headline, subtítulo, seções e fechamento.
11. Posicionamento dos CTAs.
12. Hipóteses de A/B com medição proposta.
13. Evidências, URLs finais, capturas reais e limitações.

## Critério de qualidade editorial

Não afirmar causa de conversão sem testes. Não inventar oferta, preço, provas, bônus, resultados, escassez ou garantia. Substituir ausências por [PENDENTE: comprovação]. Evitar apresentar páginas parcialmente inacessíveis como auditadas integralmente. O agente deve reler o relatório e conferir a origem de cada recomendação antes de entregar.
