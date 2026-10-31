# Metodologias estratégicas — perguntas-guia

Este arquivo traduz cada metodologia em perguntas de diagnóstico concretas,
para aplicar sobre a evidência real capturada (texto extraído + screenshots).
São lentes conceituais de domínio público sobre copywriting e marketing de
resposta direta — não são skills oficiais instaladas, não citam os autores
como fonte da página analisada, e não substituem a leitura da evidência.

Ao usar este arquivo, sempre volte à pergunta: "isso está comprovadamente na
página, ou estou presumindo?". Se estiver presumindo, classifique como
**Hipótese** no relatório, nunca como **Observado**.

---

## Eugene Schwartz — consciência e sofisticação de mercado

- **Nível de consciência do público**: a página assume que o visitante já
  conhece o problema? Já conhece soluções? Já conhece esta oferta específica?
  A copy casa com esse nível, ou tenta vender "solução" para quem ainda não
  sabe que tem o "problema" (ou vice-versa, reexplica o óbvio para quem já
  decidiu comprar)?
- **Sofisticação do mercado**: o nicho já viu muitas promessas parecidas? A
  página se diferencia de ofertas concorrentes óbvias, ou repete a mesma
  promessa genérica do mercado?
- **Intensidade do desejo**: a copy amplifica um desejo já presente no
  público, ou tenta criar desejo do zero? Isso é coerente com o produto?
- **Coerência promessa-audiência**: a promessa central combina com quem a
  página parece endereçar (linguagem, exemplos, nível de preço sugerido)?

## Gary Halbert — mecânica da persuasão escrita

- **Força da headline**: a primeira headline visível (H1 na primeira dobra)
  faz uma promessa específica e relevante, ou é vaga/genérica? Ela pararia a
  rolagem de alguém do público-alvo?
- **Abertura da copy**: o primeiro parágrafo/bloco após a headline conquista
  atenção (problema nomeado, curiosidade, identificação) ou desperdiça a
  abertura com institucional/sobre-nós?
- **Curiosidade**: existem "loops abertos" (perguntas, promessas parciais) que
  sustentam a leitura até a oferta?
- **Encadeamento persuasivo**: os blocos seguem uma ordem lógica (problema →
  agitação → solução → prova → oferta → ação), ou saltam sem transição?
- **Argumentos e fechamento**: os argumentos antes da oferta sustentam o preço
  pedido? O fechamento tem urgência genuína (não fabricada) e uma CTA clara?

## Alex Hormozi — equação de valor da oferta

- **Valor percebido vs. preço**: a página comunica resultado dos sonhos +
  probabilidade percebida de sucesso, pesados contra tempo e esforço
  percebidos? Ou apenas lista features?
- **Clareza da oferta**: é possível, em poucos segundos, dizer o que se compra,
  por quanto, e o que se recebe?
- **Bônus e garantias**: SE existirem na página, eles reduzem risco/aumentam
  valor percebido de forma concreta? Nunca presuma bônus/garantia que não
  esteja explicitamente na captura.
- **Esforço e tempo percebidos**: a copy reduz a fricção percebida (facilidade,
  rapidez, suporte) ou aumenta a sensação de trabalho/complexidade?
- **Diferenciação da oferta**: há um motivo claro para comprar esta oferta e
  não a de um concorrente (mecanismo único, garantia, formato)?

## Russell Brunson — Hook, Story, Offer

- **Hook**: o que captura atenção na primeira dobra — e ele é coerente com o
  que a oferta de fato entrega (sem bait-and-switch)?
- **Story**: existe uma narrativa (do criador, de um caso, de uma transformação)
  que conecta o problema à solução, ou a página vai direto para argumentos
  racionais sem contexto?
- **Mecanismo único**: a solução tem um "nome"/framework próprio que a torna
  memorável e diferenciada, ou é genérica ("nosso método comprovado")?
- **Sequência até o fechamento**: hook → story → oferta → prova → CTA aparece
  em alguma ordem reconhecível, ou a página mistura tudo sem progressão?

## Donald Miller — StoryBrand

- **Clareza do problema**: o problema do visitante é nomeado explicitamente
  (externo, interno e, se aplicável, filosófico), ou fica implícito?
- **Cliente como protagonista**: a copy fala sobre o cliente e sua
  transformação, ou gasta a maior parte do espaço falando da empresa/produto?
- **Guia e plano**: existe um "guia" (a marca/autor) com um plano claro e
  simples (passos) até a solução, ou o caminho parece confuso/longo?
- **CTA inequívoca**: existe uma única ação primária óbvia, repetida de forma
  consistente, sem competir com várias CTAs de pesos parecidos?

---

## Como aplicar sem inventar

1. Para cada pergunta acima, procure a evidência em `evidence.json` (headings,
   ctaCandidates, blockOrder, bodyTextSample) e nas screenshots.
2. Se a evidência responde claramente → registre como **Observado**, cite o
   trecho/elemento.
3. Se a evidência é parcial/ambígua → registre como **Hipótese**, explique o
   raciocínio e o que confirmaria.
4. Se a página não permite responder (ex.: captura falhou, elemento não
   encontrado) → registre como **Não verificado**.
5. Nunca combine duas ou mais lentes numa alegação sem necessidade — mantenha
   cada apontamento rastreável a uma pergunta-guia específica, para que a
   justificativa no relatório seja verificável.
