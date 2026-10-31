# Tests

A suite de validação principal deste projeto é `scripts/verify.mjs`
(executada com `npm run verify` ou `npm test`). Ela cobre:

- Existência dos arquivos obrigatórios do projeto e da skill.
- Validade do frontmatter e do conteúdo do `SKILL.md` (comando
  `/sales-page-auditor` e variações documentadas).
- Consistência entre os pesos da rubrica em `scripts/rubric.mjs` e em
  `references/RUBRIC.md`.
- Corretude do cálculo de pontuação, incluindo cobertura parcial
  (critérios N/A renormalizados) e rejeição de valores inválidos.
- Validação de segurança de URLs do capturador (`scripts/capture.mjs`):
  esquemas inválidos, URLs malformadas, IPs/hosts privados/loopback/
  link-local/metadados de nuvem, credenciais embutidas.
- Quando um Chromium está disponível no ambiente: uma captura real contra
  `https://example.com` (gera `evidence.json`/`summary.md` válidos) e a
  recusa de uma URL de rede interna sem criar nenhum arquivo.
- Presença das 13 seções obrigatórias em `REPORT_TEMPLATE.md`.

Este diretório existe para fixtures adicionais específicas de teste (ex.:
páginas HTML estáticas para validar a lógica de extração isoladamente), caso
sejam necessárias no futuro. Nenhuma fixture aqui deve conter dados de
clientes reais — ver `examples/` para o exemplo de formato de evidência.
