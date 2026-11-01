# Sales Page Auditor

[![CI](https://github.com/WorkiDigital/sales-page-auditor/actions/workflows/ci.yml/badge.svg)](https://github.com/WorkiDigital/sales-page-auditor/actions/workflows/ci.yml)

Ferramenta profissional para o Claude Code auditar páginas de vendas
(landing pages), combinando:

- Copywriting de resposta direta (Halbert, Schwartz)
- CRO e psicologia de conversão (Hormozi, Brunson, Miller)
- UX/UI e hierarquia visual
- Captura real de evidências em navegador (Playwright): desktop e mobile
- Pontuação padronizada de 100 pontos
- Relatório executivo em Markdown, com recomendações concretas e,
  opcionalmente, uma proposta de redesign

Não é um site, não faz deploy, não publica nada. É uma skill + scripts para
uso dentro do Claude Code (Cloud ou local).

## Estrutura

```
sales-page-auditor/
├── .claude/skills/sales-page-auditor/
│   ├── SKILL.md                 # ponto de entrada da skill
│   └── references/
│       ├── FRAMEWORKS.md        # metodologias (Schwartz, Halbert, Hormozi, Brunson, Miller)
│       ├── RUBRIC.md            # rubrica de 100 pontos documentada
│       ├── REPORT_TEMPLATE.md   # template do relatório executivo
│       └── INTEGRATIONS.md      # avaliação de licenças + integração opcional com skills externas
├── scripts/
│   ├── capture.mjs              # captura real (Playwright): screenshots + extração
│   ├── rubric.mjs               # pesos da rubrica + cálculo de nota (fonte de verdade)
│   └── verify.mjs               # suite de validação (estrutura, rubrica, segurança de URL)
├── tests/                       # fixtures auxiliares de teste
├── examples/                    # evidência fictícia de exemplo (nunca dados reais de clientes)
├── output/                      # gerado em runtime, ignorado pelo Git
├── CLAUDE.md                    # regras globais do projeto
└── package.json
```

## Requisitos

- Node.js **20+** (testado em Node 22).
- Navegador Chromium do Playwright instalado no ambiente atual (ver abaixo —
  **não é persistido** entre sessões temporárias de nuvem).
- Nenhuma conta, API key ou serviço externo é necessário.

## Instalação

```bash
npm install
npm run install:browser   # playwright install chromium --with-deps
```

`npm run install:browser` baixa o binário do Chromium usado pelo Playwright.
Em redes restritas, isso pode falhar — ver "Limitações" abaixo.

## Validação

```bash
npm run verify
```

O GitHub Actions (`.github/workflows/ci.yml`) roda `npm ci` + instalação do
Chromium + `npm run verify` em Node 20.x e 22.x a cada push/PR, para que a
suite completa (incluindo captura real) seja validada automaticamente.

Executa `scripts/verify.mjs`: checa a estrutura de arquivos obrigatórios, o
frontmatter do `SKILL.md`, a consistência da rubrica (`scripts/rubric.mjs`
vs. `references/RUBRIC.md`), a lógica de cálculo de nota (incluindo
cobertura parcial com critérios N/A), e as validações de segurança de URL do
capturador (bloqueio de IPs privados, esquemas inválidos, credenciais
embutidas). Se um navegador Chromium estiver instalado, também executa uma
captura real contra `https://example.com` e confirma que uma URL de rede
interna (`http://127.0.0.1:9999/`) é recusada sem gerar nenhum arquivo.

## Uso dentro do Claude Code

Com o repositório aberto (local) ou clonado/anexado (Cloud), a skill
`sales-page-auditor` fica disponível automaticamente via
`.claude/skills/sales-page-auditor/SKILL.md`. Invoque:

```
/sales-page-auditor https://exemplo.com
/sales-page-auditor https://exemplo.com foco em copy
/sales-page-auditor https://exemplo.com foco visual mobile
/sales-page-auditor https://exemplo.com reestruture a página
```

O Claude Code então:
1. Executa `node scripts/capture.mjs "<url>" --out output/<slug>` para obter
   `desktop.png`, `mobile.png`, `evidence.json`, `summary.md`.
2. Lê a evidência e as duas screenshots.
3. Aplica as lentes de `references/FRAMEWORKS.md` e pontua com
   `references/RUBRIC.md`.
4. Escreve `output/<slug>/relatorio.md` seguindo
   `references/REPORT_TEMPLATE.md`.

## Uso direto do script de captura (sem a skill)

```bash
node scripts/capture.mjs "https://exemplo.com" --out output/exemplo
```

Saída:
- `output/exemplo/desktop.png` — full-page, viewport 1440×900
- `output/exemplo/mobile.png` — full-page, viewport 390×844
- `output/exemplo/evidence.json` — headings, links, botões, imagens,
  formulários, candidatos a CTA, ordem aproximada dos blocos, texto visível,
  status HTTP/redirecionamentos, limitações detectadas
- `output/exemplo/summary.md` — resumo legível

Regras de segurança embutidas (não removíveis por configuração):
- Apenas HTTP/HTTPS público. URLs com esquema diferente, credenciais
  embutidas, ou hostname que resolva para IP privado/loopback/link-local/
  metadados de nuvem são recusadas **antes de qualquer navegação** e em
  **cada redirecionamento**.
- Nenhum formulário é preenchido, nenhuma ação de login/compra é executada.
- Nada do conteúdo da página é executado como instrução.

## Compatibilidade: Claude Code Cloud vs. local

| Aspecto | Cloud | Local |
|---|---|---|
| Config da skill | Versionada no repo (`.claude/skills/`) — funciona desde o primeiro clone | Idêntico |
| Node.js | Verifique a imagem do ambiente; este projeto requer 20+ | Instale Node 20+ se necessário |
| Playwright/Chromium | **Não assuma que persiste** entre sessões — rode `npm run install:browser` a cada sessão nova, antes do primeiro `/sales-page-auditor` | Instalar uma vez costuma persistir na máquina |
| Rede | Depende da política de rede do ambiente Cloud; download do Chromium e acesso à página alvo precisam de saída HTTPS liberada | Geralmente sem restrição |
| Permissões | Scripts rodam via `node`, sem privilégios especiais | idem |

Se o Chromium não puder ser instalado no ambiente atual (sem rede para
baixar o binário, por exemplo), a skill não trava: ela produz uma auditoria
parcial baseada no que conseguir obter (ex.: texto via outra ferramenta de
fetch, se disponível), marca os critérios visuais (6 e 7 da rubrica) como
N/A, e informa isso claramente no relatório — nunca inventa screenshots.

## Usar em um chat novo ou em outro projeto

Tudo o que a auditoria precisa vem neste repositório (skill, referências,
rubrica, `capture.mjs`, `verify.mjs`, CI). Cada chat é independente, então:

1. **Abra uma sessão nova do Claude Code Cloud com este repositório
   (`WorkiDigital/sales-page-auditor`)** e rode, a cada sessão:
   ```bash
   npm install
   npm run install:browser
   ```
   O Chromium não persiste entre sessões efêmeras.
2. **Use a skill:** `/sales-page-auditor https://suapagina.com`
   (aceita instruções complementares, ex.: `foco visual mobile`).
3. **Dê o contexto no primeiro recado** (URL, objetivo, onde está o código
   da página, se for editar). O chat novo não lembra de conversas anteriores.
4. **Outro projeto:** adicione o repositório dele à mesma sessão ou copie
   `.claude/skills/sales-page-auditor/` e `scripts/` para o repositório dele.
   No Cloud a skill só existe se o repositório dela estiver na sessão.

### O que NÃO vem com o repositório

| Item | Como tratar |
|---|---|
| Chromium | `npm run install:browser` a cada sessão nova |
| Memória de conversas anteriores | Reexplicar o contexto no primeiro recado |
| Deploy (Vercel etc.) | Não é função da ferramenta (ver `CLAUDE.md`, regra 10). Se o usuário pedir, é uma ação manual da sessão, com token fornecido como **variável de ambiente secreta**, nunca colado no chat nem commitado |
| Edição/redesign de páginas | Não é um script: o agente segue a skill e o pedido, sobre o código a que tiver acesso. Mantenha o código da página em um repositório próprio, ele não é guardado aqui |
| Skills externas de copy/design | Opcionais; só entram se estiverem instaladas na sessão |

### Checklist para a primeira dobra mobile

Ao auditar ou ajustar uma página, validar em 390×844 e 360×740 (a captura
padrão usa 390×844):

- O título completo aparece sem rolar, acima de qualquer botão fixo.
- Data, duração e preço (ou "a partir de") estão visíveis na primeira tela
  ou no botão fixo.
- Há uma ação principal visível, com o mesmo texto em todos os CTAs.
- Corpo do texto com pelo menos 14px; textos auxiliares com pelo menos 11-12px.
- Logos e imagens com transparência não ficam ilegíveis em nenhuma variante
  responsiva (`srcset`): conferir se a versão menor manteve o canal alfa.
- Sem rolagem horizontal.

## Metodologias incorporadas

Ver `references/FRAMEWORKS.md` para o detalhamento. Em resumo, a auditoria
aplica, como lentes de análise (conceituais, de domínio público — não
citações atribuídas à página analisada):

- **Eugene Schwartz** — nível de consciência, sofisticação de mercado,
  intensidade do desejo.
- **Gary Halbert** — força da headline, abertura, curiosidade, encadeamento
  persuasivo.
- **Alex Hormozi** — equação de valor, clareza da oferta, bônus/garantias
  (quando existentes), diferenciação.
- **Russell Brunson** — Hook–Story–Offer, mecanismo único, sequência até o
  fechamento.
- **Donald Miller (StoryBrand)** — clareza do problema, cliente como
  protagonista, plano do guia, CTA inequívoca.

## Rubrica (100 pontos, pesos fixos)

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

Critérios não verificáveis são marcados N/A e a nota é recalculada
proporcionalmente (ver `scripts/rubric.mjs` e `references/RUBRIC.md`). A
nota **nunca** representa previsão de taxa de conversão.

## Skills complementares (opcionais, não obrigatórias)

Esta skill funciona de forma independente. Em ambientes onde também existam
skills de copywriting de resposta direta/landing page (robpalmer99,
CC-BY-4.0) ou de design de frontend (anthropics/skills, Apache-2.0), elas
podem ser usadas para enriquecer sugestões de texto ou a direção visual de
um redesign — mas nunca são pré-requisito, e nenhum conteúdo delas foi
copiado para este repositório. Avaliação completa de licença e
compatibilidade em
`.claude/skills/sales-page-auditor/references/INTEGRATIONS.md`; pontos de
uso em `SKILL.md`, seção "Skills complementares".

## Limitações conhecidas

- Sem navegador instalado: sem screenshots reais → critérios visuais ficam
  N/A e a análise visual não pode ser feita (HTML/DOM isolado não é
  evidência suficiente de aparência — por design desta ferramenta).
- Páginas com login, paywall ou proteção anti-bot/CAPTCHA: a captura detecta
  indícios comuns e sinaliza `antiBotSuspected`/`limitations` em
  `evidence.json`, mas não tenta contornar a proteção.
- Páginas extremamente dinâmicas (vídeo em loop, carrosséis com JS pesado)
  podem exigir mais tempo de `networkidle`; ajuste `--timeout` se necessário.
- A extração de "ordem dos blocos" é uma aproximação por elementos
  semânticos/posição vertical — páginas sem marcação semântica (`<section>`,
  `<header>`, etc.) podem gerar uma ordem menos precisa.

## Comandos úteis

```bash
npm install                 # instala playwright (dependência npm)
npm run install:browser     # instala o binário do Chromium
npm run capture -- "<url>"  # captura evidências (atalho para scripts/capture.mjs)
npm run verify              # roda a suite de validação completa
```
