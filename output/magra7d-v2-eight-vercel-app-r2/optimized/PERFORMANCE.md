# Otimização de carregamento (versão local, não publicada)

## Causa (Observado)
O HTML pesava **1.303 KB**, dos quais **~1.196 KB eram 16 imagens em base64 dentro do HTML**:
8 prints de depoimento (24–180 KB cada, só usados ao abrir o lightbox), 4 ícones 480×480 (44–104 KB cada, exibidos pequenos), 1 foto, e 3 `data-fallback` que **duplicam** os arquivos `assets/mari-*.webp` que já existem.
O navegador precisa baixar e analisar tudo isso antes de pintar. Em 4G lento, isso explica FCP = LCP = 5,6 s e a queda "Use ciclos de vida eficientes de cache" (base64 no HTML não é cacheável separado; `cache-control: max-age=0` no HTML).

## O que foi feito
| Mudança | Efeito |
|---|---|
| Removidos 3 `data-fallback` duplicados | −~400 KB no HTML |
| Prints (`data-src` do lightbox) viraram arquivos `assets/print-XX.webp` (720 px, q70) | carregam só quando necessários, cacheáveis |
| Ícones 480→128 px, foto redimensionada | −~200 KB |
| `width`/`height` em todas as imagens | resolve "elementos de imagem sem width e height" |
| `fetchpriority="high"` + `<link rel="preload">` na foto do topo (LCP) | LCP mais cedo |
| `loading="lazy"` nas imagens abaixo da dobra | menos bytes na primeira dobra |

**HTML: 1.303 KB → 78 KB (−94%).** Assets: 505 KB em arquivos separados e cacheáveis.
Primeira carga medida localmente: 2.161 KB → 1.094 KB transferidos.

## Limite desta medição
O limitador de rede do teste local não foi efetivo (tempos de ~0,5 s), então **não há medida confiável de FCP/LCP aqui**; só os tamanhos em bytes são confiáveis. Rode Lighthouse no deploy real para confirmar o ganho.

## Para aplicar em produção (fora deste projeto)
1. Copiar `index.html` e `assets/` para o projeto da Vercel (o código-fonte da página não está neste repositório).
2. Configurar cache longo para `/assets/*`: `Cache-Control: public, max-age=31536000, immutable` (renomeie com hash ao trocar imagens).
3. Pendente (diagnóstico do Lighthouse, requer o código-fonte): JS legado (−27 KiB, ajustar target do build), JS não usado (−42 KiB), 1 animação não composta (usar `transform`/`opacity`) e 2 tarefas longas (dividir o script inline de ~4 KB e adiar o que não for da primeira dobra).
