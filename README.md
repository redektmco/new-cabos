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
(lista com `bitola_mm2`, `metragem_m`, `cor`), `nome`, `tipo_pessoa`, `cnpj`,
`razao_social`, `cidade`, `telefone`, `email`, `mensagem`, `resumo` (texto
pronto) e, se vierem na URL, `utm_*`, `gclid` e `fbclid`.

O destino solicitado para os leads é **contato@newcabos.com.br**, por e-mail. O site estático não envia e-mails diretamente: é necessário configurar o fluxo n8n para receber o JSON e enviar o conteúdo de `resumo`, incluindo os dados do cliente e dos produtos, para esse endereço fixo. O endereço do cliente (`email`) deve ser usado como Reply-To. Não é necessário gravar os leads em planilha.

O nó Webhook deve aceitar POST e responder com sucesso somente após o envio de e-mail ser aceito pelo provedor. Configure as credenciais de e-mail exclusivamente no n8n, nunca no JavaScript público. Em caso de erro, o visitante deve receber a mensagem de falha. **O webhook permanece vazio no repositório; a entrega real por e-mail ainda depende dessa configuração externa.**

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
