# Rubrica de pontuação — 100 pontos

Pesos fixos. A fonte de verdade executável destes pesos é
`scripts/rubric.mjs` (`CRITERIA`), validada por `scripts/verify.mjs`. Se este
documento e o código divergirem, o código está certo e este documento deve
ser corrigido.

| # | Critério | Peso |
|---|---|---:|
| 1 | Clareza da mensagem | 15 |
| 2 | Promessa e especificidade | 15 |
| 3 | Argumentação e consciência | 15 |
| 4 | Oferta e valor percebido | 15 |
| 5 | Provas e confiança | 10 |
| 6 | Estrutura visual desktop | 10 |
| 7 | Experiência mobile | 10 |
| 8 | CTAs e fricção | 10 |
| | **Total** | **100** |

A nota geral **nunca** deve ser apresentada como previsão de taxa de
conversão. É uma pontuação de qualidade estrutural/persuasiva/visual,
relativa à evidência coletada.

---

## 1. Clareza da mensagem (15 pts)

- A proposta de valor é compreensível em menos de 5 segundos de leitura?
- A linguagem é direta, sem jargão desnecessário?
- O visitante entende, sem rolar, o que a página oferece e para quem?

Sub-notas sugeridas (distribua os 15 pontos): compreensão imediata (6),
ausência de ambiguidade/jargão (5), alinhamento headline-subheadline (4).

## 2. Promessa e especificidade (15 pts)

- A promessa central é específica (número, prazo, resultado nomeado) ou vaga?
- Há diferenciação clara frente a alternativas óbvias do nicho?
- A promessa é coerente com o que a oferta realmente parece entregar
  (sem indícios de exagero não sustentado na própria página)?

Sub-notas: especificidade mensurável (7), diferenciação (5), coerência
interna promessa-entrega (3).

## 3. Argumentação e consciência (15 pts)

- A sequência de argumentos respeita o nível de consciência/sofisticação do
  público (ver `FRAMEWORKS.md`, Schwartz/Halbert)?
- Os argumentos têm encadeamento lógico até a oferta?
- Objeções previsíveis são endereçadas, mesmo que implicitamente?

Sub-notas: adequação ao nível de consciência (6), encadeamento lógico (5),
tratamento de objeções (4).

## 4. Oferta e valor percebido (15 pts)

- A oferta é clara (o que se recebe, por quanto) rapidamente?
- Valor percebido vs. esforço/tempo percebido (equação de valor, Hormozi)?
- Bônus/garantias, quando presentes, reduzem risco de forma concreta?

Sub-notas: clareza da oferta (6), equação de valor (5), uso de
bônus/garantias quando existentes (4 — se não existirem, redistribuir
proporcionalmente e marcar N/A parcial no relatório, nunca penalizar por
ausência de algo que pode ser estratégia válida sem mencionar como defeito
automático).

## 5. Provas e confiança (10 pts)

- Existem depoimentos, números, logos, autoridade visível na captura?
- As provas são específicas (nome, resultado, contexto) ou genéricas?
- A credibilidade (autor, empresa, mídia) é visível antes da oferta?

Sub-notas: presença e especificidade de provas (6), autoridade/credibilidade
(4). **Nunca** valide uma prova como verdadeira ou falsa — apenas avalie se
ela está presente, específica e bem posicionada.

## 6. Estrutura visual desktop (10 pts) — requer `desktop.png`

- Primeira dobra comunica o essencial sem rolagem?
- Hierarquia de títulos é visualmente clara (tamanho, peso, espaçamento)?
- Contraste, legibilidade e espaçamento adequados?
- Ordem dos blocos segue uma lógica persuasiva (ver `evidence.json.blockOrder`)?

## 7. Experiência mobile (10 pts) — requer `mobile.png`

- A primeira dobra mobile preserva a promessa central?
- Não há quebras de layout, texto cortado, botões sobrepostos?
- CTA é alcançável e visível sem rolagem excessiva?
- Tipografia é legível em tela pequena?

## 8. CTAs e fricção (10 pts)

- A CTA primária é única e consistente, ou compete com várias CTAs de peso
  parecido (`evidence.json.ctaCandidates`)?
- O texto do botão é específico ("Começar agora", "Ver planos") ou genérico
  ("Enviar", "Clique aqui")?
- A quantidade de campos de formulário é proporcional ao estágio de decisão?
- Há fricção desnecessária entre a decisão de compra e a ação (passos extras,
  informação que falta)?

---

## Critérios não verificáveis (N/A)

Quando um critério não puder ser avaliado (ex.: captura de screenshot falhou
→ critérios 6 e 7 ficam N/A; página sem seção de provas → critério 5 pode
ficar parcialmente N/A se nem a ausência puder ser confirmada por erro de
captura), marque explicitamente **N/A** no relatório e use
`scripts/rubric.mjs#computeScore` para recalcular a nota total
proporcionalmente apenas sobre os critérios avaliáveis. Sempre informe o
**percentual de cobertura** (`coveragePct`) junto da nota, por exemplo:
"Nota: 68/100 (cobertura: 75% — Experiência mobile não verificável nesta
captura)".

Nunca atribua 0 a um critério N/A nem o exclua silenciosamente sem informar.
