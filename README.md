# Sales Page Auditor V1.0

Auditoria profissional de páginas de vendas pelo Claude Code, com **copywriting + CRO + UX/UI** e evidências reais de desktop/mobile. Repositório independente, reproduzível e sem necessidade de site público.

## O que faz

1. Recebe uma URL HTTP/HTTPS pública.
2. Usa Playwright + Chromium em 1440×900 (desktop) e 390×844 (mobile).
3. Registra screenshots completos, textos, headings, links, CTAs, botões, imagens, formulários (apenas estrutura, sem valores) e sequência aproximada de seções.
4. O agente **inspeciona visualmente os PNGs e a copy** e avalia promessa, objeções, oferta, provas, hierarquia, legibilidade, fricção e experiência mobile.
5. Organiza um relatório Markdown e notas numa rubrica de **100 pontos**, com cobertura declarada e N/A para partes não verificáveis.
6. Opcionalmente propõe nova copy, wireframe e HTML responsivo (sem publicar).

**Importante:** Playwright coleta dados, mas não julga qualidade persuasiva automaticamente. A avaliação é feita pelo Claude a partir das evidências. Nenhuma nota é previsão de taxa de conversão.

## Instalação — Claude Code local

É necessário Node.js 20+, npm e ambiente que permita instalar Chromium.

~~~bash
git clone https://github.com/WorkiDigital/sales-page-auditor.git
cd sales-page-auditor
npm ci
npx playwright install chromium
npm run verify
claude
~~~

Se o Chromium requerer bibliotecas do sistema num Linux próprio, consultar o [guia Playwright](https://playwright.dev/docs/browsers) e executar, quando autorizado:

~~~bash
npx playwright install --with-deps chromium
~~~

No Claude Code aberto **dentro da pasta do repositório**, inicie:

~~~text
/sales-page-auditor https://exemplo.com
/sales-page-auditor https://exemplo.com foco em copy
/sales-page-auditor https://exemplo.com foco visual mobile
/sales-page-auditor https://exemplo.com reestruture a página
~~~

A descoberta depende de .claude/skills/sales-page-auditor/SKILL.md no projeto atual. Se não aparecer, abra uma nova sessão na raiz, confirme que a pasta .claude/ está presente e procure /sales-page-auditor na lista de skills. Não é necessário arquivo global.

## Claude Code Cloud (web)

1. Conecte o repositório **WorkiDigital/sales-page-auditor** como projeto da sessão Cloud e abra o workspace nessa raiz.
2. Confira node --version (mínimo v20).
3. Execute npm ci e npx playwright install chromium **em cada ambiente novo que não tenha cache**.
4. Verifique se o Cloud permite downloads do registry npm, do Chromium e saída de rede HTTP/HTTPS para a URL auditada; bloqueios administrativos podem impedir screenshot.
5. Execute npm run verify e use o comando /sales-page-auditor URL na sessão.
6. Se o comando não for descoberto no Cloud, abra uma sessão nova no diretório correto; como fallback, peça ao Claude: "Leia .claude/skills/sales-page-auditor/SKILL.md e execute com a URL ..." (não é equivalente a validar a descoberta do comando).

A pasta .claude e toda a lógica estão versionadas no GitHub. Instalações e caches temporários **não** são garantidos entre sessões Cloud.

## Comandos CLI

~~~bash
npm run capture -- https://example.com --out output/auditoria-001
npm run report -- --input output/auditoria-001/audit.json --out output/auditoria-001/report.md
npm run verify
npm test
npm run smoke
~~~

O comando capture cria:

~~~text
output/auditoria-001/
  desktop.png         # se o navegador abriu e capturou
  mobile.png          # idem
  evidence.json       # URLs finais, status, DOM, CTAs, erros
  summary.md          # inventário técnico da coleta
  audit.json          # preenchido pelo Claude, NÃO automaticamente
  report.md           # gerado pelo script report.mjs depois de audit.json
  redesign.html       # opcional, quando solicitado
~~~

A pasta output/ é ignorada por Git, inclusive capturas e auditorias de clientes. Não transfira essas evidências para commits ou issues públicos. A primeira execução pode criar a pasta automaticamente.

## Critérios (100 pontos)

| Critério | Peso |
|---|---:|
| Clareza da mensagem | 15 |
| Promessa e especificidade | 15 |
| Argumentação e consciência | 15 |
| Oferta e valor percebido | 15 |
| Provas e confiança | 10 |
| Estrutura visual desktop | 10 |
| Experiência mobile | 10 |
| CTAs e fricção | 10 |
| **Total** | **100** |

Cada nota exige evidência. Se um aspecto não puder ser verificado, marca-se **N/A**. Nota publicada = 100 × (pontos obtidos / pesos verificáveis); cobertura = porcentagem dos pesos verificados. Sem evidências: nota N/A e cobertura 0%. **Uma nota com 25% de cobertura não representa uma auditoria completa.**

Documentação: [rubrica](.claude/skills/sales-page-auditor/references/RUBRIC.md), [frameworks](.claude/skills/sales-page-auditor/references/FRAMEWORKS.md), [contrato do relatório](.claude/skills/sales-page-auditor/references/REPORT_TEMPLATE.md).

## Segurança e limites

- URL, DNS e cada requisição interceptada são checados para bloquear HTTP não público, localhost, redes privadas, endereços especiais, portas não padrão e redirecionamentos internos. Em sistemas com requisitos SSRF rígidos, a filtragem de aplicação **não substitui firewall de saída e isolamento de rede**: DNS rebinding / TOCTOU é possível porque o endereço DNS validado não é fixado na conexão do Chromium.
- Nunca faça login, clique em ofertas, preencha formulários, registre dados de compradores ou realize compras. Requisições de recursos da própria página podem existir durante renderização.
- Páginas dinâmicas, geobloqueio, antibot, autenticação, banners de consentimento, scroll lazy-load e falhas de rede podem tornar a captura parcial. Screenshot estático não comprova usabilidade em todas as interações.
- Em caso de bloqueio, evidence.json e summary.md preservam o motivo, e categorias não comprovadas ficam N/A.
- Inspeção visual requer efetivamente ler os arquivos PNG. DOM/HTML isolados não comprovam aparência.
- O relatório só aceita classificações Observado, Hipótese e Não verificado. Não inventar resultados, depoimentos, garantias, escassez ou taxas de conversão.
- Nenhuma modificação automática do site. **Sem deploy para Vercel.**

## Testes

~~~bash
npm run verify
npm test
npm run smoke
~~~

- Verifica estrutura, frontmatter, sintaxe JavaScript, pontuação, relatório e validações de URL.
- O smoke exige Chromium instalado e **acesso público à rede**, utilizando https://example.com; não deve ser considerado aprovado quando não foi executado.
- O GitHub Actions CI usa Node 20, npm ci, testes e captura smoke. Verifique o resultado no Actions antes de considerar a captura validada naquele ambiente.

## Créditos

Os métodos de Corey Haines (MIT), Rob Palmer (CC BY 4.0) e diretrizes de design da Anthropic foram **referenciados e sintetizados**, sem redistribuir ou executar código externo. Veja [THIRD_PARTY.md](THIRD_PARTY.md).

Playwright (Apache 2.0) é a única dependência de execução instalada via npm.
