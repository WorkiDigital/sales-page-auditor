# Re-auditoria — Magra 7D (foco mobile) · 2026-10-31

**URL:** https://magra7d-v2-eight.vercel.app/ · Comparação com `../magra7d-v2-eight-vercel-app/relatorio.md`.
Evidências: `mobile-scrolled.png` (recaptura com rolagem; a captura padrão volta a sair com áreas pretas por causa do `scroll-reveal`), `evidence.json`, DOM inspecionado em 390×844. Nada foi preenchido nem clicado.

## O que mudou desde a 1ª análise (Observado)
| Item | Antes | Agora |
|---|---|---|
| Depoimentos | 8 cartões de texto + botão "Ver print" | **8 prints reais embutidos** (imagens, alt "Print original do depoimento 0X"); seção de 1.249 → 2.026 px |
| Altura mobile | 13.583 px | **14.148 px** (+565 px) |
| Formulário | não percebido | `#lead-form` (Nome, Telefone, E-mail → "CONTINUAR PARA O CHECKOUT →"), **oculto no carregamento (altura 0)**; texto "Os dados serão encaminhados ao checkout…" |
| Links de checkout | URL Hotmart simples | URL Hotmart com parâmetros de rastreio (`userId`, `ts_vid`, `utm_source`) |
| Heading do FAQ | 1 | duplicado no DOM ("Antes de garantir sua vaga" + "…a sua vaga"), um com altura 0 |
| Textos internos vazados | 3 | **continuam os 3** (rodapé "preparada a partir dos materiais fornecidos", "No celular, as etapas…", "adaptados da copy original") + alts "foto da página original" |
| Barra fixa sobrepondo CTA/bullet 5 | sim | **continua** |
| Garantia/bônus | ausentes | continuam ausentes |

## Nota: **73,5/100** (cobertura 100%) — antes 72,8
| Critério | Peso | Antes | Agora | Motivo |
|---|---:|---:|---:|---|
| Clareza | 15 | 82 | 82 | sem mudança |
| Promessa | 15 | 70 | 70 | sem mudança |
| Argumentação | 15 | 68 | 68 | sem mudança |
| Oferta | 15 | 74 | 74 | sem mudança |
| Provas e confiança | 10 | 55 | **66** | prints reais são prova mais crível que texto digitado |
| Visual desktop | 10 | 78 | 78 | não reavaliado em detalhe |
| **Mobile** | 10 | 74 | **72** | +565 px de rolagem, prints pesados (cada um ~1.000 px de largura embutido em base64 no HTML) |
| CTAs e fricção | 10 | 80 | **78** | formulário de captura antes do checkout, se ativado, adiciona 3 campos (Hipótese) |

> Não é previsão de conversão: mede qualidade estrutural/persuasiva/visual da evidência coletada.

## Foco mobile — novos achados
1. **Prints reais melhoram a prova, mas criam incoerência (Observado).** Dois prints citam resultados de **21 dias** ("Emagreci 8kg nesses 21 dias", "Já emagreci 7,4kg desde o começo do desafio e nem foram 21 dias") e as miniaturas respondidas mostram "Desafio 21 dias". A promessa da página é **4 kg em 7 dias**, e o disclaimer abaixo diz que os relatos "não equivalem a resultados garantidos". Resultado: prova forte para a promessa errada, que a visitante pode ler como "8 kg" e o disclaimer contradiz. Sugestão: manter só os prints que falam de acompanhamento/aula/qualidade (01, 02, 04, 05, 08) ou legendar "Desafio anterior de 21 dias" ao lado dos de resultado. Revisão de conformidade recomendada antes de anunciar (Hipótese; não é parecer jurídico).
2. **Peso e leitura.** Prints têm texto pequeno em fundo escuro; em tela de 390 px alguns ficam ilegíveis sem zoom (miniaturas citadas dentro dos prints). Sugestão: carrossel horizontal de 3 prints + toque para ampliar; texto-resumo acima de cada print. Os 8 prints seguidos antecedem a oferta em ~7 telas.
3. **Autoridade continua depois da oferta** (seção "Quem é a Dra. Mari", ~91% da página). Subir uma linha "6 anos no É de Casa • +30 mil pessoas • CRN 3 23786" para logo abaixo do H1.
4. **Textos internos ainda visíveis.** Remover antes de qualquer tráfego pago: "Esta é uma página de campanha preparada a partir dos materiais fornecidos", "No celular, as etapas aparecem na horizontal…", "Os temas foram adaptados da copy original…", e os alts "página original".
5. **Barra fixa sobre o CTA do hero** (Observado, sem mudança): ocultar a barra enquanto o botão do hero estiver visível; subir H1 (começa em ~45% da tela).
6. **Formulário oculto de captura (Não verificado):** não sei o que o abre (provável clique em CTA) nem para onde envia (`action` nulo, método GET). Se for obrigatório antes do checkout, é fricção adicional e coleta de dados pessoais: verificar a política de privacidade (não há link para política de privacidade nem termos na página, Observado) e testar com a equipe, fora desta auditoria somente-leitura.
7. **Hygiene técnica:** heading do FAQ duplicado; alts dos prints não transcrevem o texto (leitor de tela não lê o depoimento); disclaimers a 11 px cinza (#98919A sobre fundo escuro, contraste baixo).

## Recomendações priorizadas (mobile)
| # | Ação | Impacto | Confiança | Esforço |
|---|---|---|---|---|
| 1 | Remover textos internos/alts "página original" | Alto | Observado | Baixo |
| 2 | Resolver incoerência 21 dias × 7 dias nos prints | Alto | Observado | Baixo |
| 3 | Autoridade da Mari logo abaixo do H1 | Alto | Observado | Baixo |
| 4 | Prints em carrossel + ampliar + alt com transcrição | Médio-alto | Observado | Médio |
| 5 | Barra fixa oculta enquanto o CTA do hero está visível; compactar topo | Médio | Observado | Baixo |
| 6 | Disclaimers a 13–14 px com contraste ≥ 4,5:1 | Médio | Observado | Baixo |
| 7 | Política de privacidade/termos, caso o formulário seja usado | Médio | Observado (ausência) | Baixo |
| 8 | Garantia/reembolso e data final da oferta se existirem (`[placeholder]`) | Médio | Observado | Baixo |
| 9 | Consolidar "Quatro pilares" + "Três caminhos" + "Jejum" (~1.667 px só nos pilares no mobile) | Médio | Observado | Médio |
