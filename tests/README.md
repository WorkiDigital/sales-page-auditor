# Cobertura dos testes

- security.test.mjs: bloqueios de URL, IP, DNS, porta e caminho de saída.
- score.test.mjs: soma de pesos, nota proporcional, cobertura e erros de notas.
- report.test.mjs: seções, N/A, validação de achados e arquivo Markdown.
- capture.test.mjs: URL local bloqueada, erros registrados e evidências no disco.
- GitHub Actions: instala dependências e Chromium e executa captura em https://example.com, confirmando PNGs e metadados.

Testes automatizados não equivalem a uma revisão humana de copy e screenshots. O smoke depende de navegador e internet e pode falhar por indisponibilidade do destino. A descoberta efetiva do comando /sales-page-auditor deve ser validada dentro de uma sessão Claude Code no projeto.
