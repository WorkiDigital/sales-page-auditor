# Integrações opcionais com skills externas

Este documento registra a avaliação e a estratégia de integração com três
repositórios de skills externas, conforme pedido na especificação do
projeto. **Nenhum conteúdo desses repositórios foi copiado/vendorizado para
dentro deste projeto.** A integração é em tempo de execução (runtime
detection), opcional, e a auditoria principal nunca depende dela.

## Avaliação feita

| Repositório | Conteúdo relevante | Licença | Compatível para integração? |
|---|---|---|---|
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 53 skills de marketing; relevantes aqui: `copywriting`, `copy-editing`, `cro`, `marketing-psychology`, `offers`, `pricing`, `ab-testing` | MIT ("free and MIT-licensed", "use these however you want") | Sim — MIT permite uso/adaptação livremente. Ainda assim optamos por **não vendorizar**, para evitar duplicar frameworks que já cobrimos em `FRAMEWORKS.md`/`RUBRIC.md` e para não acoplar este projeto à manutenção de um repositório de terceiros. |
| [robpalmer99/claude-code-copywriting-skills](https://github.com/robpalmer99/claude-code-copywriting-skills) | `direct-response-copy`, `landing-page-copy`, `copychief`, `compliance-checker`, `ad-copy` | **CC-BY-4.0** (exige atribuição/link de volta ao post original ao redistribuir/adaptar) | Parcialmente — a licença é compatível com *uso*, mas exige atribuição clara em qualquer redistribuição. Para evitar gerenciar texto de atribuição dentro de relatórios de clientes gerados por esta ferramenta, tratamos como **dependência opcional e externa**, nunca copiada. |
| [anthropics/skills — frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Direção visual, tipografia, evitar UI "templada" | Apache-2.0 (maioria das skills do repositório, exceto as de office — docx/pdf/pptx/xlsx, que são source-available) | Sim — Apache-2.0 é permissivo e compatível. Mesmo assim, não vendorizamos: o conteúdo é específico para *construção* de UI nova, enquanto esta skill faz *auditoria* de UI existente — o encaixe é como inspiração de direção visual no redesign (Seção 14), não como parte do motor de pontuação. |

## Por que "detecção em runtime", não cópia de arquivos

1. **Evita duplicação e conflito.** `FRAMEWORKS.md` já incorpora, como lentes
   conceituais, os princípios centrais de copywriting de resposta direta
   (Schwartz, Halbert) e CRO/oferta (Hormozi, Brunson, Miller) exigidos pela
   especificação original. Copiar as skills de copywriting criaria duas
   fontes de verdade para a mesma coisa.
2. **Evita risco de licença em artefatos gerados.** A licença CC-BY-4.0 do
   repositório do Rob Palmer exige atribuição ao redistribuir/adaptar o
   conteúdo. Se copiássemos os prompts para dentro deste repo (ou para
   dentro de relatórios de clientes), precisaríamos propagar essa atribuição
   em cada entrega — frágil e fácil de esquecer. Usar a skill apenas em
   tempo de execução (se o usuário já a tiver instalada) evita esse risco:
   nada do texto da skill é copiado para este projeto nem para a saída.
3. **Mantém a ferramenta funcional sem as dependências.** Como exigido pela
   especificação: a auditoria, a rubrica e o relatório funcionam 100% sem
   nenhuma dessas três skills presentes.
4. **Evita atualização desincronizada.** Um fork/cópia congelaria a versão
   no momento da cópia; a detecção em runtime sempre usa a versão que o
   usuário tiver instalada.

## Como a detecção funciona na prática

A skill `sales-page-auditor` (`SKILL.md`, seção "Skills complementares")
instrui o agente a, **apenas nos pontos listados abaixo**, verificar se uma
skill complementar está disponível na sessão atual (via a listagem de
skills disponíveis que o Claude Code expõe) antes de produzir aquele trecho
específico do relatório:

| Ponto do relatório | Skill externa preferencial, se disponível | Fallback (sempre funciona) |
|---|---|---|
| Seção 10 — Sugestões de copy prontas para uso | `direct-response-copy` ou `landing-page-copy` (Rob Palmer) | O próprio `sales-page-auditor` escreve a sugestão aplicando `FRAMEWORKS.md` diretamente |
| Revisão/linha-a-linha das sugestões de copy antes de entregar | `copychief` (Rob Palmer) | O próprio `sales-page-auditor` revisa a própria sugestão contra a Seção "Padrões de qualidade do diagnóstico" do `SKILL.md` |
| Seção 8 — checagem de conformidade de urgência/escassez/alegações, se o usuário pedir explicitamente uma checagem de compliance de anúncio | `compliance-checker` (Rob Palmer) | O `sales-page-auditor` sinaliza apenas como observação geral ("alegação sem suporte visível na página"), sem aplicar regras de política de nenhuma plataforma específica |
| Diagnóstico de oferta/CRO (Seção 4 da rubrica), enriquecimento opcional | `cro`, `offers`, `pricing`, `marketing-psychology` (Corey Haines) | `RUBRIC.md` + `FRAMEWORKS.md` (Hormozi) já cobrem o essencial |
| Seção 14 — direção visual do redesign | `frontend-design` (Anthropic) | O próprio `sales-page-auditor` aplica os princípios de hierarquia/tipografia já descritos na Seção "Auditoria completa da estrutura visual" do `SKILL.md` original |

Regra importante: **a pontuação da rubrica (100 pontos) e a captura de
evidências nunca são delegadas** a nenhuma skill externa — isso garante que
a nota seja sempre calculada da mesma forma (`scripts/rubric.mjs`),
independentemente de quais skills opcionais estejam instaladas na sessão.

## Atribuição

Caso uma sugestão de copy tenha sido produzida com ajuda de
`direct-response-copy`, `landing-page-copy`, `copychief` ou
`compliance-checker` (Rob Palmer, CC-BY-4.0), inclua uma nota de rodapé no
relatório, por exemplo:

> Sugestões de copy nesta seção foram refinadas com apoio da skill
> `claude-code-copywriting-skills` (Rob Palmer, CC-BY-4.0,
> https://github.com/robpalmer99/claude-code-copywriting-skills).

Isso satisfaz a exigência de atribuição da CC-BY-4.0 sem exigir cópia do
conteúdo da skill. Para MIT (Corey Haines) e Apache-2.0 (Anthropic), a
atribuição não é obrigatória, mas é boa prática citar a fonte de inspiração
quando usada de forma substancial — uma frase como "direção visual
inspirada na skill `frontend-design` da Anthropic" é suficiente.

## Não-objetivos

- Não instalamos, fixamos versão, nem adicionamos esses repositórios como
  dependência do `package.json` — eles não são pacotes npm.
- Não criamos um instalador automático para essas skills. Se o usuário
  quiser usá-las, ele mesmo as adiciona ao diretório `.claude/skills/` da
  sua própria conta/projeto Claude Code, fora deste repositório.
- Não reimplementamos o conteúdo dessas skills aqui "com outras palavras"
  para contornar a licença — onde a metodologia é equivalente, usamos nossa
  própria formulação em `FRAMEWORKS.md`, que antecede esta integração e foi
  escrita a partir de conceitos de domínio público (Schwartz, Halbert,
  Hormozi, Brunson, Miller), não a partir do texto dessas skills.
