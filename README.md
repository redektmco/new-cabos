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
n8n/fluxo-leads-lp.json · cabecalho-planilha.csv   (automação dos leads; fora do site, ver .vercelignore)
```

---

## Identidade visual e conteúdo: tudo vem do original

Com o acesso liberado, baixei direto de `lp.newcabos.com.br` e `newcabos.com.br`:

| O que | De onde veio |
|---|---|
| `assets/img/logo-newcabos.png` · `icone-newcabos.png` · `favicon.png` | logo oficial do site institucional |
| `assets/img/fabrica.jpg` | foto real da fábrica, da LP |
| `assets/img/rolos.png` | foto dos rolos preto/vermelho/verde (fora do hero por enquanto) |
| WhatsApp `(15) 99755-6534` e `contato@newcabos.com.br` | rodapé da LP |
| 5.000 m², entrega em 24h, conectores MC4, marca própria | textos da LP |

A paleta saiu dos pixels do próprio logo: **laranja `#F5A11E` / `#F08000`** (o raio)
e **azul `#1E7FE0` / `#10233D`** (o cabo em volta). Ficam em `:root`, no topo do
`styles.css`. A base da página é clara, como a LP original.

## Monte seu Pedido

O módulo visual do cabo é um configurador exclusivamente comercial, sem recomendações de corrente admissível ou dimensionamento elétrico. Permite escolher bitola (4, 6, 10 ou 16 mm²), cor, metragem por unidade, quantidade e acondicionamento desejado, adicionar e remover produtos e transferir a lista ao formulário de orçamento.

Regras de acondicionamento fornecidas pela engenharia:

| Bitola | Metragem por unidade | Padrão |
| --- | --- | --- |
| 4 e 6 mm² | 10, 15 ou 20 m | Retalho |
| 4 e 6 mm² | 25, 50, 100 ou 200 m | Rolo |
| 4 e 6 mm² | Acima de 300 até 1.000 m | Carretel |
| 4 e 6 mm² | Acima de 1.000 m | Bobina |
| 10 mm² | A partir de 500 m | Bobina |

Demais metragens, todos os pedidos de 16 mm² e sugestões de embalagem diferentes do padrão exigem análise comercial e produtiva, sem promessa de disponibilidade. Todo fornecimento está sujeito à confirmação da NEW CABOS. A escolha da bitola e metragem deve observar o projeto de profissional legalmente habilitado.

O formulário exige nome, telefone e e-mail válido, além de CNPJ para pessoa jurídica. A mensagem admite até 1.000 caracteres e mostra um contador. Os perfis comerciais são Consumidor final, Integrador, Revenda e Outros. Cores e acondicionamentos (Retalho, Rolo, Carretel e Bobina) são opções visíveis nos dois configuradores, sem depender de menus nativos ou hover. Cada produto enviado inclui quantidade, metragem por unidade, metragem total e acondicionamento (padrão, solicitado e indicador de análise). O campo legado `metragem_m` continua representando a metragem por unidade em formato brasileiro.

## Como o formulário envia

O formulário envia os dados em JSON (POST) para um webhook do n8n. A URL
fica em `CONFIG.webhook`, no topo de `assets/js/app.js`.

**Enquanto `CONFIG.webhook` estiver vazio, nenhum lead é enviado**: o
visitante vê uma mensagem de erro com o telefone e o e-mail da New Cabos.

Campos enviados: `origem`, `enviado_em`, `pagina`, `perfil`, `produtos`
(lista com `bitola_mm2`, `metragem_m`, `metragem_por_unidade_m`, `quantidade`,
`metragem_total_m`, `cor` e `acondicionamento`), `nome`, `tipo_pessoa`, `cnpj`,
`razao_social`, `cidade`, `telefone`, `email`, `mensagem`, `resumo` (texto
pronto) e, se vierem na URL, `utm_*`, `gclid` e `fbclid`.

### Fluxo do n8n (pasta `n8n/`)

`n8n/fluxo-leads-lp.json` é o fluxo pronto para importar no n8n (no editor:
menu **⋯ → Import from File**). A cada pedido de cotação ele:

1. recebe o POST em `/webhook/lp-newcabos-cotacao`;
2. valida nome, telefone, e-mail, CNPJ (se PJ) e produtos. Dados inválidos
   voltam com erro 400;
3. envia o pedido por e-mail para **contato@newcabos.com.br**, com o e-mail do
   cliente como Reply-To. O site só mostra "enviado" depois que o e-mail é
   aceito pelo provedor. Se o envio falhar, o n8n responde 500 e o visitante
   vê a mensagem de erro com telefone e e-mail;
4. grava uma linha numa planilha do Google Sheets. Os cabeçalhos da linha 1
   estão em `n8n/cabecalho-planilha.csv`. Se a planilha falhar, o lead não se
   perde: o e-mail já saiu;
5. passa por um nó **CRM (a definir)**, desligado, com os dados do lead já
   formatados. Basta trocá-lo pelo nó do CRM quando ele for escolhido.

Para ativar no n8n:

1. no nó **Envia e-mail**, criar a credencial SMTP da conta que vai enviar e
   trocar o **From Email** para o endereço dessa conta;
2. no nó **Grava na planilha**, conectar a conta Google e escolher planilha e
   aba (com os cabeçalhos do CSV na linha 1);
3. salvar e ativar o fluxo;
4. copiar a **Production URL** do nó **Webhook** e colar em `CONFIG.webhook`.

As credenciais (SMTP, Google, CRM) ficam só no n8n, nunca no JavaScript
público.

---

## Acessibilidade e performance

- Sem framework, sem jQuery: ~55 KB de CSS + JS somados, não minificados.
- Única requisição externa: Google Fonts (Inter + Sora).
- Navegação por teclado, `aria-*` nas abas e no formulário, skip link,
  `prefers-reduced-motion` respeitado em todas as animações.
- Sem scroll horizontal de 390 px a 1440 px+ (verificado em Chromium).

## Rodar localmente

```bash
python3 -m http.server 8000
# http://localhost:8000
```
