# Auditoria de Página de Vendas — Magra 7D (foco mobile)

**URL:** https://magra7d-v2-eight.vercel.app/
**Objetivo da página:** venda direta de desafio online de 7 dias, checkout na Hotmart (Observado: todos os CTAs de compra apontam para `pay.hotmart.com`).
**Data:** 2026-10-31 · **Foco:** experiência mobile (390×844), desktop como contexto.

## 1. Resumo Executivo

A página tem promessa específica (“até 4 kg em 7 dias”), preço claro (de R$ 197 por 9x R$ 8,80 ou R$ 67 à vista), CTA verde de alto contraste e uma barra fixa de compra no mobile. É limpa, sem erros de console e sem layout quebrado. O que mais pesa contra: (1) **textos internos de produção vazaram para a página publicada**; (2) a prova social é anônima e fica em prints não verificados; (3) a autoridade da Dra. Mari (TV Globo, CRN) só aparece depois da oferta; (4) no mobile a página tem ~13.600 px (≈16 telas) e o preço só aparece na tela ~12, embora a barra fixa já mostre R$ 67 desde o início. Prioridade 1: remover os textos internos e subir a autoridade para antes da lista de depoimentos.

## 2. Nota Geral

**Nota Geral: 72,8/100** (cobertura: 100%)

| Critério | Peso | Nota | Status |
|---|---:|---:|---|
| Clareza da mensagem | 15 | 82 | Observado |
| Promessa e especificidade | 15 | 70 | Observado |
| Argumentação e consciência | 15 | 68 | Observado |
| Oferta e valor percebido | 15 | 74 | Observado |
| Provas e confiança | 10 | 55 | Observado |
| Estrutura visual desktop | 10 | 78 | Observado |
| Experiência mobile | 10 | 74 | Observado |
| CTAs e fricção | 10 | 80 | Observado |

Justificativas curtas: clareza alta porque H1 + selo de data/acesso resolvem “o quê, quando, quanto tempo” na primeira dobra; promessa específica mas sem mecanismo diferenciado (“Reset Hormonal”, “Ativação Metabólica” são rótulos, a própria página admite que não garante efeito); oferta clara, mas **sem bônus nem garantia na página** (não é defeito automático, apenas oportunidade); provas presentes porém anônimas; mobile bom em legibilidade e CTA, penalizado por comprimento e pelos vazamentos de texto.

> Esta nota não é uma previsão de taxa de conversão. É uma medida de qualidade estrutural, persuasiva e visual relativa à evidência coletada.

## 3. Evidências e Limitações

- `desktop.png`/`mobile.png` (captura padrão) saíram com **grandes áreas pretas** nas seções com animação `scroll-reveal` (classe `scroll-reveal` → `is-revealed` só após rolar). O texto estava no DOM, mas o visual não. Verifiquei que **não é bug do site**: rolando gradualmente, todas as seções revelam (`opacity: 1`). Usei recapturas com rolagem (`desktop-scrolled.png`, `mobile-scrolled.png`) para a análise visual. As capturas originais ficam como estão, só são evidência do comportamento do capturador.
- **Não verificado:** o conteúdo dos 8 “Ver print” (botões não clicados, para manter a captura somente leitura), as respostas do FAQ (recolhidas) e o checkout Hotmart.
- Sem CAPTCHA/anti-bot, sem erros de console, sem formulários na página.

## 4. Diagnóstico Mobile (390×844) — foco principal

### 4.1 Primeira dobra
- **Observado:** topo com faixa rolante “BLACK 2026 • MAGRA 7D • INSCRIÇÕES ABERTAS”, foto da Dra. Mari ao lado do logo, faixa verde “23 DE NOVEMBRO • 100% ONLINE | ACESSO POR 1 ANO”, kicker rosa “Você não falhou nas dietas. As dietas falharam com você.” e H1 “Perca até 4 kg em 7 dias sem dieta maluca, sem academia obrigatória e sem passar fome.”
- **Problema:** o H1 só começa em ~y=380 de 844 (logo, foto e faixa ocupam ~45% da tela). O H1 é longo (4 linhas) e a frase rosa acima compete com ele como “título”. A barra fixa **“GARANTIR MINHA VAGA • R$ 67”** cobre o 5º bullet (“Acesso ao conteúdo por 1 ano”) e fica sobreposta ao botão “QUERO PARTICIPAR” quando a rolagem passa da dobra: dois botões verdes empilhados disputando o mesmo espaço.
- **Sugestão:** comprimir a faixa de marca (logo + foto em ~220 px de altura) para o H1 começar em ~y=300; manter a frase “Você não falhou nas dietas…” como H2 menor ou movê-la para a seção “A verdade”, onde já aparece repetida (ver 4.5); esconder a barra fixa enquanto o botão do hero está visível na tela.

### 4.2 Barra fixa de CTA (ponto forte, com ajuste)
- **Observado:** CTA fixa com preço (R$ 67) desde o primeiro scroll — resolve o problema de o preço só aparecer no fim.
- **Sugestão:** texto alternativo “QUERO ENTRAR POR R$ 67 →” ou manter, mas adicionar “à vista” (o preço parcelado 9x R$ 8,80 totaliza ~R$ 79, e a barra mostra só o à vista). Não é erro, mas evita surpresa no checkout.

### 4.3 Legibilidade e toque
- **Observado:** corpo ~16 px, títulos grandes e contrastados, botões de largura quase total (≥ 44 px de altura), cartões de depoimento com “Ver print” bem dimensionado.
- **Problema (Observado):** textos legais/disclaimers em ~11–12 px cinza sobre fundo escuro no hero (“A campanha apresenta possibilidade de perder até 4 kg…”) e no rodapé: legibilidade baixa. Como são justamente os avisos de saúde, convém que sejam legíveis.
- **Sugestão:** subir os disclaimers para 13–14 px e aumentar o contraste (≥ 4,5:1).

### 4.4 Comprimento e ordem no mobile
- **Observado:** ~13.583 px de altura (≈16 telas). Ordem real: hero → 8 depoimentos (≈1.250 px só nessa seção, listados um embaixo do outro) → “A verdade” → 4 pilares empilhados → faixa “Emagreça até 4kg” → “O que é” → “Como o corpo funciona” → 3 caminhos → “Jejum” → “O que você vai receber” → **oferta (≈72% da página)** → 4 etapas em carrossel → “Quem é a Dra. Mari” → FAQ → rodapé.
- **Problemas (Observado):**
  1. Os 8 depoimentos ocupam o espaço mais nobre logo após o hero, antes de a visitante entender a proposta e a autoridade.
  2. A autoridade (TV Globo, CRN, +30 mil pessoas) só vem depois da oferta.
  3. Quatro pilares e três caminhos empilhados repetem a mesma ideia (protocolo, detox, jejum), e a seção “Jejum” repete o terceiro caminho.
- **Sugestão (ordem proposta mobile):** hero → mini-autoridade (1 linha com “6 anos no É de Casa • +30 mil pessoas • CRN 3 23786”) → “O que é + o que você recebe” → oferta → 3 depoimentos em carrossel → mecanismo/etapas → Mari → FAQ → CTA final. Recolher os 8 relatos em carrossel horizontal (3 visíveis + “ver mais”) reduz ~900 px.

### 4.5 Repetições (Observado)
- “Você não falhou nas dietas. As dietas falharam com você.” aparece no hero, no H2 de “A verdade” e é só o mesmo gancho duas vezes na mesma leitura mobile.
- “Emagreça até 4kg em apenas 7 dias!” repete o H1 na faixa intermediária; funciona como reforço de CTA, mas em mobile é uma terceira “promessa” antes da oferta.

### 4.6 Carrossel de etapas
- **Observado:** setas, indicadores e “01 / 04”. Bom controle.
- **Problema (Observado):** o texto **“No celular, as etapas aparecem na horizontal: deslize para ver a etapa 1, 2, 3 e 4.”** é uma instrução de desenvolvimento/UX escrita para a visitante, visível e desnecessária.
- **Sugestão:** remover o texto; as setas e os pontos já comunicam a navegação.

### 4.7 Vazamentos de texto interno (Observado, prioridade alta)
| Onde | Texto visível |
|---|---|
| Rodapé (mobile e desktop) | “Esta é uma página de campanha preparada a partir dos materiais fornecidos.” |
| Seção “Três caminhos” (desktop) | “Os temas foram adaptados da copy original para evitar promessas universais.” |
| Alt/legendas | “foto da página original do Magra 7D”, “foto de apresentação da página original” (invisível, mas aparece em leitores de tela e SEO) |
| Etapas (mobile) | “No celular, as etapas aparecem na horizontal…” |

Esses textos revelam que a página foi adaptada de outra, enfraquecem a confiança e podem confundir a leitora. **Sugestão:** removê-los; o rodapé pode virar “Conteúdo educativo. Resultados variam de pessoa para pessoa. Confira condições da oferta no checkout.”

### 4.8 Estabilidade
- **Observado:** sem rolagem horizontal (`scrollWidth` = 390), sem texto cortado, sem sobreposição fora da barra fixa, sem erros de console. Fotos nítidas e recortadas com bom enquadramento do rosto.

## 5. Diagnóstico da Copy

### 5.1 Headline e promessa
- **Evidência:** H1 “Perca até 4 kg em 7 dias sem dieta maluca, sem academia obrigatória e sem passar fome.”
- **Classificação:** Observado. Específica, com prazo e número, três objeções neutralizadas.
- **Risco (Hipótese, não é parecer jurídico):** promessa de perda de peso com número e prazo, “detox”, “reset hormonal” e jejum são alvos comuns de revisão de plataformas de anúncio e de conselhos profissionais. A página já se protege com disclaimers, mas o H1 e o disclaimer se contradizem em tom: promete 4 kg e logo abaixo diz “não são garantidos”. Vale revisar com o jurídico/CRN antes de escalar tráfego pago.
- **Sugestão de headline alternativa (mesma promessa, menos atrito):** “7 dias de orientação ao vivo com a nutricionista Mari Ferri para organizar sua alimentação e buscar até 4 kg a menos, sem dieta maluca e sem passar fome.”

### 5.2 Consciência e sofisticação (Schwartz)
- **Hipótese:** o público está consciente do problema (já tentou dietas) e da solução genérica (desafio/jejum), mas não do produto; a página acerta ao abrir pela frustração (“Você não falhou”). O mercado de desafios de emagrecimento é saturado; falta um **mecanismo próprio nomeado e explicado** além das etiquetas (“Ativação Metabólica”, “Reset Hormonal”), que a própria página relativiza.

### 5.3 Oferta (Hormozi)
- **Observado:** “De R$ 197,00 por apenas 9x de R$ 8,80, ou R$ 67,00 à vista”; 7 lives, material 5 dias antes, acesso 1 ano; início 23/11/2026 (urgência real por data, não contador artificial).
- **Não existe na página:** bônus, garantia de reembolso, número de vagas. **Não inventar.** Sugestão: `[placeholder: garantia/política de reembolso da Hotmart, se aplicável]` exibida junto ao botão da oferta. O prazo da oferta Black (“até quando?”) também não está claro: `[placeholder: data final da oferta]`.

### 5.4 Provas e autoridade
- **Observado:** 8 relatos curtos de “Participante • relato 0X”, com “Ver print”; avisos de que são de desafios anteriores e não equivalem a resultado; autoridade (CRN 3 23786, 6 anos no É de Casa, +30 mil pessoas) só na seção “Quem é a Dra. Mari”.
- **Problema:** os relatos são elogios à experiência, nenhum cita resultado, perfil ou antes/depois (mesmo que isso fosse desejável, está bem alinhado com o disclaimer); isso é seguro, mas pouco específico. A veracidade não foi avaliada.
- **Sugestão:** manter 3 relatos com a legenda de contexto (“Participante do Magra 7D anterior”) e subir a autoridade da Mari para a primeira dobra ou logo após.

### 5.5 CTAs
- **Observado:** 6 links de compra/âncora; textos “QUERO PARTICIPAR”, “CONHECER A OFERTA”, “CONHEÇA O DESAFIO”, “GARANTIR MINHA VAGA”, “GARANTIR MINHA VAGA • R$ 67”. Dois destinos (checkout Hotmart e âncora `#oferta`); sem formulários. Mistura de verbos (“quero”, “conhecer”, “garantir”) é aceitável; o ideal é o botão do hero já mencionar preço/data.

## 6. Diagnóstico Desktop (contexto)
- **Observado (recaptura com rolagem):** hero escuro com gradiente magenta, logo + foto à direita, faixa verde-limão com data e acesso, H1 centralizado em 4 linhas, 5 bullets e botão amplo; seções alternando fundos claro/escuro, cartões com sombra deslocada verde, hierarquia tipográfica forte e consistente, FAQ em cartões. Primeira dobra comunica o essencial. Ponto fraco: grande vazio visual entre H1 e bullets no hero em telas largas e repetição da imagem da Mari em três seções.

## 7. Inventário de Blocos (ordem real, via `evidence.json` e DOM)
1. Faixa rolante + hero (`#inicio`) · 2. Depoimentos (`#depoimentos`) · 3. A verdade (`#verdade`) · 4. Quatro pilares (`#beneficios`) · 5. Faixa “Emagreça até 4kg” (`#resultados`) · 6. O que é (`#o-que-e`) · 7. Como o corpo funciona (`#como-funciona`) · 8. Três caminhos (`#estrategias`) · 9. Jejum (`#jejum`) · 10. O que você vai receber (`#receber`) · 11. Oferta (`#oferta`) · 12. Etapas · 13. Quem é a Dra. Mari (`#sobre-mari`) · 14. FAQ (`#duvidas`) · 15. Rodapé.

## 8. Pontos Fortes e Problemas

**Pontos fortes:** promessa específica; preço e parcelamento claros; barra fixa com preço no mobile; contraste e tipografia fortes; disclaimers de saúde presentes; sem fricção de formulário; sem erros técnicos.

| # | Problema | Classificação | Impacto |
|---|---|---|---|
| 1 | Textos internos/de produção visíveis (rodapé, “No celular…”, “adaptados da copy original”) | Observado | Alto (confiança) |
| 2 | Autoridade da Mari só depois da oferta; depoimentos anônimos antes | Observado | Alto |
| 3 | Página mobile com ~16 telas; oferta em ~72% | Observado | Médio-alto |
| 4 | Barra fixa sobrepondo o CTA e o 5º bullet do hero | Observado | Médio |
| 5 | H1 começa em ~45% da tela mobile; kicker concorre com o H1 | Observado | Médio |
| 6 | Disclaimers de saúde em fonte pequena e baixo contraste | Observado | Médio |
| 7 | Sem garantia/bônus/fim da oferta Black | Observado (ausência) | Médio |
| 8 | Mecanismo próprio pouco diferenciado em mercado saturado | Hipótese | Médio |
| 9 | Risco regulatório/de plataforma de ads na promessa numérica | Hipótese | A verificar |

## 9. Recomendações Priorizadas

| # | Recomendação | Impacto | Confiança | Esforço |
|---|---|---|---|---|
| 1 | Remover textos internos (rodapé, “No celular…”, “adaptados da copy original”, alts “página original”) | Alto | Observado | Baixo |
| 2 | Linha de autoridade (“6 anos no É de Casa • +30 mil pessoas • CRN 3 23786”) logo abaixo do H1 | Alto | Observado | Baixo |
| 3 | Depoimentos em carrossel (3 visíveis) após a oferta ou após “O que é” | Alto | Observado | Médio |
| 4 | Compactar o topo mobile para o H1 começar em ~y=300; ocultar a barra fixa enquanto o botão do hero está visível | Médio | Observado | Baixo |
| 5 | Fundir “Quatro pilares” + “Três caminhos” + “Jejum” em um bloco (reduz ~2.500 px) | Médio | Observado | Médio |
| 6 | Disclaimers a 13–14 px com contraste ≥ 4,5:1 | Médio | Observado | Baixo |
| 7 | Exibir garantia/reembolso e data final da oferta, se existirem (`[placeholder]`) | Médio | Observado | Baixo |
| 8 | Testar variantes do H1 e do botão do hero com preço/data (teste A/B, não promessa de ganho) | Médio | Hipótese | Médio |
| 9 | Revisão de conformidade das alegações de saúde antes de escalar anúncios | A verificar | Hipótese | Baixo |

## 10. Arquivos
`desktop.png`, `mobile.png` (captura padrão, com seções não reveladas), `desktop-scrolled.png`, `mobile-scrolled.png` (recaptura com rolagem), `evidence.json`, `summary.md`.
