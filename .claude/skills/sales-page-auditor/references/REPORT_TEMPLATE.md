# Template do Relatório Executivo

Copie esta estrutura para `output/<slug>/relatorio.md` e preencha cada seção
com base na evidência real (`evidence.json`, `desktop.png`, `mobile.png`).
Remova instruções em `[itálico entre colchetes]` ao preencher. Classifique
cada apontamento como **Observado**, **Hipótese** ou **Não verificado**.

---

```markdown
# Auditoria de Página de Vendas — [nome do produto/página]

**URL analisada:** [url]
**Objetivo comercial da página:** [venda direta / captura de lead / agendamento / etc. — Observado ou Hipótese]
**Data da auditoria:** [data]

## 1. Resumo Executivo

[3-6 frases: o que a página faz bem, o que está travando conversão, e a
prioridade número 1. Sem jargão, direto ao ponto executivo.]

## 2. Nota Geral e Notas por Critério

**Nota Geral: [x]/100** (cobertura: [y]% — [nota sobre critérios N/A, se houver])

| Critério | Peso | Nota (0-100) | Status |
|---|---:|---:|---|
| Clareza da mensagem | 15 | [n] | [Observado/N/A] |
| Promessa e especificidade | 15 | [n] | |
| Argumentação e consciência | 15 | [n] | |
| Oferta e valor percebido | 15 | [n] | |
| Provas e confiança | 10 | [n] | |
| Estrutura visual desktop | 10 | [n] | |
| Experiência mobile | 10 | [n] | |
| CTAs e fricção | 10 | [n] | |

[Para cada nota, uma frase justificando com base em evidência.]

> Esta nota não é uma previsão de taxa de conversão. É uma medida de
> qualidade estrutural, persuasiva e visual relativa à evidência coletada.

## 3. Diagnóstico da Copy

[Para cada elemento abaixo presente na página: headline, subheadline,
promessa central, mecanismo único, storytelling, benefícios, autoridade,
provas sociais, oferta, preço/bônus/garantias, urgência/escassez, CTAs —
aplique o formato: Evidência → Justificativa → Sugestão concreta.]

### 3.1 Headline e subheadline
- **Evidência:** [citação exata extraída]
- **Classificação:** [Observado/Hipótese/Não verificado]
- **Diagnóstico:** [...]
- **Sugestão (texto alternativo pronto para uso):** "[novo texto]"

### 3.2 Promessa central e especificidade
[...]

### 3.3 Consciência da audiência e sofisticação do mercado
[ver FRAMEWORKS.md — Schwartz]

### 3.4 Mecanismo único / narrativa (Hook-Story-Offer)
[ver FRAMEWORKS.md — Brunson]

### 3.5 Benefícios e transformação prometida
[...]

### 3.6 Autoridade, credibilidade e provas sociais
[Nunca valide a veracidade de um depoimento — apenas presença, especificidade e posicionamento.]

### 3.7 Apresentação da oferta, preço, bônus e garantias
[ver FRAMEWORKS.md — Hormozi. Só descreva bônus/garantias confirmados na página.]

### 3.8 Urgência e escassez
[Se existirem na página. Avalie se parecem genuínas ou fabricadas — e diga por quê.]

### 3.9 CTAs e fechamento

## 4. Diagnóstico Visual — Desktop (1440×900)

[Baseado em `desktop.png`. Para cada ponto: elemento/região da imagem →
função persuasiva esperada → problema → sugestão.]

- Primeira dobra: [...]
- Hierarquia de títulos: [...]
- Tipografia, contraste e espaçamento: [...]
- Ordem dos blocos (ver `evidence.json.blockOrder`): [...]
- Posicionamento dos CTAs: [...]

## 5. Diagnóstico Visual — Mobile (390×844)

[Baseado em `mobile.png`. Dê atenção especial a quebras de responsividade,
texto cortado, botões sobrepostos, CTA fora da primeira dobra.]

## 6. Inventário de Blocos da Página Atual

[Liste a ordem real dos blocos/seções detectada em `evidence.json.blockOrder`,
numerada, com uma descrição de 1 linha cada.]

1. [bloco 1 — ex. Header/Hero]
2. [bloco 2]
...

## 7. Pontos Fortes e Problemas Identificados

### Pontos fortes
- [...]

### Problemas identificados (por severidade)
| # | Problema | Classificação | Impacto potencial |
|---|---|---|---|
| 1 | [...] | Observado | Alto/Médio/Baixo |

## 8. Recomendações Priorizadas

[Ordene por impacto potencial × confiança na evidência × esforço de implementação.
Formato: Ação concreta → Por quê → Esforço estimado.]

| Prioridade | Recomendação | Impacto | Confiança | Esforço |
|---|---|---|---|---|
| 1 | [...] | Alto | Observado | Baixo |

## 9. Nova Estrutura Persuasiva Recomendada

[Lista ordenada dos blocos recomendados, com a função persuasiva de cada um
(ex.: Hook → Problema → Mecanismo único → Prova → Oferta → Garantia → CTA).]

## 10. Sugestões de Copy para os Blocos Principais

[Texto alternativo pronto para uso para headline, subheadline, bloco de
oferta e CTA principal. Use `[placeholder: ...]` para qualquer dado real que
não pôde ser confirmado — nunca invente números, prazos ou garantias.]

## 11. Proposta de Posicionamento dos CTAs

[Onde posicionar a CTA primária e secundárias, e por quê, amarrado a redução
de fricção ou reforço da mensagem.]

## 12. Hipóteses de Testes A/B

[3-5 hipóteses de Teste A/B, cada uma como: Hipótese → Mudança proposta →
Métrica a observar. Deixe claro que são hipóteses, não resultados garantidos.]

| # | Hipótese | Mudança proposta | Métrica |
|---|---|---|---|
| 1 | [...] | [...] | [...] |

## 13. Evidências e Limitações Técnicas

- Captura realizada em: [data/hora]
- URL final após redirecionamentos: [...]
- Status HTTP: desktop [...], mobile [...]
- Limitações registradas pela captura: [listar `limitations` de `evidence.json`]
- Critérios marcados N/A e motivo: [...]
- Qualquer suspeita de bloqueio anti-bot/CAPTCHA: [...]
```

---

## Seção opcional — Redesign/Wireframe (sob demanda)

Só inclua esta seção quando o usuário pedir reestruturação/redesign/wireframe.

```markdown
## 14. Wireframe e Redesign Proposto

### Estrutura reorganizada das seções
[lista ordenada com função persuasiva de cada seção]

### Nova copy estratégica
[textos completos para cada bloco da nova estrutura]

### Wireframe responsivo (descrição ou HTML/CSS/JS)
[descrição seção a seção para desktop e mobile; opcionalmente, código HTML/CSS/JS
básico em `output/<slug>/redesign/`]

### Justificativa das melhorias de hierarquia visual
[por que a nova ordem/hierarquia reduz fricção ou fortalece a mensagem]

> Fidelidade à oferta real: todo dado de preço, bônus, garantia ou prova usado
> aqui vem da página original ou está marcado como `[placeholder: ...]`.
> Este redesign não é publicado nem substitui a página em produção.
```
