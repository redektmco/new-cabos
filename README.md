# New Cabos — Landing Page

Reconstrução da LP de `lp.newcabos.com.br`. Página estática, sem build e sem
dependências: é só subir os arquivos em qualquer host (Vercel, Netlify, S3,
Apache, Nginx).

```
index.html
assets/css/styles.css
assets/js/app.js
assets/img/favicon.svg · og-cover.png
robots.txt · sitemap.xml
```

---

## Identidade visual e conteúdo: tudo vem do original

Com o acesso liberado, baixei direto de `lp.newcabos.com.br` e `newcabos.com.br`:

| O que | De onde veio |
|---|---|
| `assets/img/logo-newcabos.png` · `icone-newcabos.png` · `favicon.png` | logo oficial do site institucional |
| `assets/img/hero-cabo.webp` | imagem de topo da LP (recortada no produto) |
| `assets/img/fabrica.jpg` | foto real da fábrica, da LP |
| `assets/img/rolos.png` | foto dos rolos preto/vermelho/verde |
| WhatsApp `(15) 99755-6534` e `contato@newcabos.com.br` | rodapé da LP |
| 5.000 m², entrega em 24h, conectores MC4, marca própria | textos da LP |

A paleta saiu dos pixels do próprio logo: **laranja `#F5A11E` / `#F08000`** (o raio)
e **azul `#1E7FE0` / `#10233D`** (o cabo em volta). Ficam em `:root`, no topo do
`styles.css`. A base da página é clara, como a LP original.

## Ainda vale conferir

- **Números técnicos** das bitolas (corrente, diâmetro, peso) continuam sendo
  referência de catálogo do setor, não a ficha técnica de vocês. Estão todos no
  objeto `GAUGES`, no topo de `assets/js/app.js`.
- **Depoimentos**: não inventei nenhum. O bloco pronto está comentado no
  `index.html`, acima da seção de orçamento. É colar 3 falas reais e descomentar.

## O que mudou em relação à LP antiga

**Copy.** A página inteira foi reescrita em torno da dor de quem compra cabo
solar — o integrador que volta na obra de graça — em vez de falar de si mesma.
O cabo deixou de ser descrito como produto e passou a ser descrito como risco:
2% do orçamento, 100% do retrabalho.

**Linguagem.** A copy foi reescrita inteira para leitura simples — frases curtas,
palavras do dia a dia, sem jargão. "Queda de tensão" virou "energia perdida no
caminho"; "bitola" virou "grossura do cabo"; "condutor de cobre eletrolítico
estanhado" virou "fio de cobre com banho de estanho". Onde o termo técnico é
inevitável, ele vem explicado na frase seguinte.

**Visual.** Nenhuma "pill" (cápsula arredondada). Rótulos de seção são texto com
filete, status são texto com marcador, e os controles usam canto de 10–12px.

**Elementos interativos** (todos em JS puro, sem biblioteca):

1. **Calculadora de bitola** — potência, distância, nº de strings, tensão e
   corrente entram; saem bitola recomendada, queda de tensão, metragem
   estimada e quanto de geração se perde por ano ao descer uma bitola.
   É o principal gancho de geração de lead da página: o CTA leva os números
   simulados direto para o formulário.
2. **Anatomia do cabo** — corte transversal em SVG com hotspots clicáveis.
   Cada camada explica o que faz e o que acontece quando o fabricante
   economiza nela.
3. **Linha do tempo comparativa** — cabo genérico × New Cabos nos anos 1, 3, 7
   e 15, com barra de "saúde" e custo acumulado. Roda uma vez sozinha ao
   entrar na tela e para assim que o usuário assume o controle.
4. **Seletor de bitola no hero** — muda as proporções do corte do cabo e as
   especificações ao vivo.
5. **Abas de produto** com escala visual das quatro bitolas lado a lado.
6. **Abas por perfil** — integrador, engenharia e distribuidor, cada um com o
   seu argumento.
7. **Formulário em 3 passos** com barra de progresso, validação por etapa e
   máscara de telefone.
8. Processo produtivo que acende conforme o scroll, FAQ acordeão, contadores
   animados, barra de progresso de leitura, WhatsApp fixo e reveal no scroll.

---

## Como o formulário envia

Não há backend. O envio monta uma mensagem formatada e abre o WhatsApp do
comercial já preenchido (com alternativa por e-mail). Isso funciona bem para
B2B no Brasil e não depende de servidor.

Para plugar um CRM, RD Station ou endpoint próprio depois, só é preciso trocar
a função `enviar()` em `assets/js/app.js` — todo o resto do formulário
continua igual.

---

## Detalhes da calculadora

Queda de tensão no lado CC:

```
ΔV = 2 · ρ · L · I / S        ρ = 0,0178 Ω·mm²/m (cobre em temperatura de operação)
ΔV% = ΔV / V_string · 100
```

Recomenda a menor bitola que atende a corrente da string (com fator 1,25) e
mantém a queda **≤ 1%**. Acima de 3% marca como reprovada. A estimativa de
perda anual usa 4,5 h/dia de sol pleno e tarifa de R$ 0,85/kWh — ambos
ajustáveis no objeto `CALC`.

A página deixa explícito, em dois lugares, que é estimativa de pré-venda e que
o dimensionamento final é do projeto elétrico e da ART responsável.

---

## Acessibilidade e performance

- Sem framework, sem jQuery: ~35 KB de CSS + JS somados, não minificados.
- Única requisição externa: Google Fonts (Inter + Sora).
- Navegação por teclado, `aria-*` nas abas e no formulário, skip link,
  `prefers-reduced-motion` respeitado em todas as animações.
- Sem scroll horizontal de 390 px a 1440 px+ (verificado em Chromium).

## Rodar localmente

```bash
python3 -m http.server 8000
# http://localhost:8000
```
