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

## ⚠️ Antes de publicar — 3 ajustes obrigatórios

### 1. Dados de contato (placeholders!)

Abra `assets/js/app.js` e troque o bloco `CONFIG` no topo do arquivo:

```js
const CONFIG = {
  whatsapp: '5515000000000',      // ← só dígitos, com DDI 55
  telefone: '+551530000000',      // ← formato E.164 para o link tel:
  telefoneLabel: '(15) 3000-0000',
  email: 'comercial@newcabos.com.br',
};
```

Esses valores alimentam **todos** os botões de WhatsApp, telefone e e-mail da
página, inclusive o envio do formulário. Não achei os números completos em
fontes públicas, então deixei propositalmente um placeholder óbvio em vez de
chutar um número errado.

### 2. Conferir as afirmações técnicas

O que está na página veio de pesquisa pública sobre a New Cabos (site
institucional, perfis da empresa e catálogos do setor):

| Afirmação na página | Situação |
|---|---|
| Fábrica em Sorocaba-SP, 100% nacional | confirmado em fontes públicas |
| Bitolas 4, 6, 10 e 16 mm² | confirmado |
| Cobre eletrolítico estanhado | confirmado |
| Dupla camada de isolação termofixa | confirmado |
| Livre de halogênio, retardante à chama, baixa fumaça, resistente a UV | confirmado |
| Marcação metro a metro | confirmado |
| "Processos estruturados conforme a ISO 9001" | confirmado — mantive a redação exata da fonte; **se a empresa for certificada**, vale trocar por "certificada ISO 9001" |
| **1500 V CC** | padrão do mercado para cabo solar — **confirmar na ficha técnica de vocês** |
| **Correntes máximas, diâmetros e pesos** (`GAUGES` em `app.js`) | valores de referência de catálogo do setor — **substituir pelos números reais da ficha técnica** |
| **Endereço e CNPJ no rodapé** | vieram de bases públicas de CNPJ — **confirmar** antes de publicar |

Os números de ampacidade/diâmetro/peso ficam todos no objeto `GAUGES` no topo
de `assets/js/app.js`. Um único lugar alimenta o hero, as abas de produto e a
calculadora.

### 3. Depoimentos

Não inventei depoimentos de clientes. O bloco pronto está **comentado** no
`index.html`, logo acima da seção de orçamento — é só colar 3 falas reais (com
nome, empresa, cidade e autorização) e descomentar.

---

## O que mudou em relação à LP antiga

**Copy.** A página inteira foi reescrita em torno da dor de quem compra cabo
solar — o integrador que volta na obra de graça — em vez de falar de si mesma.
O cabo deixou de ser descrito como produto e passou a ser descrito como risco:
2% do orçamento, 100% do retrabalho.

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
