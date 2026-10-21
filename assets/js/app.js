/* =========================================================
   NEW CABOS — Landing Page
   Vanilla JS, sem dependências.
   ---------------------------------------------------------
   ⚠️  AJUSTE AQUI: URL do webhook (n8n) que recebe os leads.
   Enquanto `webhook` estiver vazio, o formulário NÃO envia nada:
   o visitante vê uma mensagem de erro com telefone e e-mail.
   ========================================================= */
const CONFIG = {
  // Cole aqui a URL de produção do webhook do n8n (nó Webhook, método POST)
  webhook: '',
  // Dados reais, extraídos da LP oficial (lp.newcabos.com.br)
  telefone: '+5515997556534',
  telefoneLabel: '(15) 99755-6534',
  email: 'contato@newcabos.com.br',
  empresa: 'New Cabos',
};

/* ---------- helpers ---------- */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const nf = (n, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Regras comerciais fornecidas pela engenharia. Ausência de padrão exige análise.
function packagingFor(gauge, meters, requested = '') {
  let standard = '';
  if ([4, 6].includes(Number(gauge))) {
    if ([10, 15, 20].includes(meters)) standard = 'Retalho';
    else if ([25, 50, 100, 200].includes(meters)) standard = 'Rolo';
    else if (meters > 300 && meters <= 1000) standard = 'Carretel';
    else if (meters > 1000) standard = 'Bobina';
  } else if (Number(gauge) === 10 && meters >= 500) standard = 'Bobina';
  return { padrao: standard, solicitado: requested, analise: !standard || Boolean(requested && requested !== standard) };
}
const packagingText = p => `${p.padrao ? 'Padrão da fábrica: ' + p.padrao : 'Sem padrão definido'}${p.solicitado ? ' · Solicitado: ' + p.solicitado : ''}${p.analise ? ' · Sujeito à análise comercial e produtiva, sem garantia de disponibilidade.' : ' · Sujeito à confirmação da NEW CABOS.'}`;

/* =========================================================
   1. HEADER, MENU, PROGRESSO, REVEAL
   ========================================================= */
(function chrome() {
  const header = $('#header');
  const bar    = $('#scrollBar');

  const onScroll = () => {
    const y   = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-stuck', y > 12);
    if (bar) bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // menu mobile
  const burger = $('#burger'), nav = $('#nav');
  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));

  // reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
    io.observe(el);
  });

  // link ativo na nav
  const secs = $$('main section[id]');
  const navIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      $$('#nav a').forEach(a =>
        a.classList.toggle('is-current', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { threshold: 0.3, rootMargin: '-84px 0px -55%' });
  secs.forEach(s => navIo.observe(s));

  $('#year').textContent = new Date().getFullYear();
})();

/* =========================================================
   2. CONTADORES
   ========================================================= */
(function counters() {
  const els = $$('[data-count]');
  if (!els.length) return;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    if (reduceMotion) { el.textContent = prefix + nf(target) + suffix; return; }

    const dur = 1500, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + nf(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.6 });
  els.forEach(el => io.observe(el));
})();

/* =========================================================
   3. LINKS DE CONTATO (tel / e-mail)
   ========================================================= */
(function contatos() {
  $$('[data-tel]').forEach(a => { a.href = `tel:${CONFIG.telefone}`; a.textContent = a.textContent.trim() === 'Telefone comercial' || a.textContent.trim() === 'Telefone' ? CONFIG.telefoneLabel : a.textContent; });
  $$('[data-mail]').forEach(a => { a.href = `mailto:${CONFIG.email}`; if (/E-mail/i.test(a.textContent)) a.textContent = CONFIG.email; });
})();

/* =========================================================
   4. CABO DO HERO — troca de bitola
   ========================================================= */
const commercialOrder = [];
(function heroCable() {
  const pills = $$('.cable-card__switch .pill');
  let gauge = '6';
  const meters = $('#orderMeters'), quantity = $('#orderQuantity'), color = $('#orderColor'), packaging = $('#orderPackaging');
  const update = () => {
    $('#heroSpecLabel').textContent = `${gauge} mm²`;
    $('#cablePrint').textContent = `NEW CABOS · ${gauge}mm² · 1800V · 0001 m`;
    const shrink = {4:38,6:32,10:25,16:18}[gauge];
    $('.cable-3d__core').style.inset = `${shrink}px 0`;
    $('.cable-3d__insul').style.inset = `${Math.max(shrink - 15, 8)}px 0`;
    $('.cable-3d__jacket').style.background = {Preto:'#171b22',Vermelho:'#b82c32',Verde:'#167547'}[color.value];
    $('#orderPackage').textContent = packagingText(packagingFor(gauge, Number(meters.value), packaging.value));
    pills.forEach(p => p.setAttribute('aria-pressed', String(p.dataset.gauge === gauge)));
  };
  pills.forEach(p => p.addEventListener('click', () => {
    gauge = p.dataset.gauge;
    pills.forEach(x => x.classList.toggle('is-active', x === p));
    update();
  }));
  [meters, color, packaging].forEach(el => el.addEventListener('input', update));
  const render = () => {
    const summary = $('#orderSummary'); summary.replaceChildren();
    commercialOrder.forEach((item, index) => {
      const row = document.createElement('p');
      row.textContent = `${item.bitola} mm² · ${item.cor} · ${item.quantidade} × ${nf(Number(item.metros))} m = ${nf(item.quantidade * Number(item.metros))} m. ${packagingText(packagingFor(item.bitola, Number(item.metros), item.embalagem))} `;
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remover';
      remove.setAttribute('aria-label', `Remover produto ${index + 1}`);
      remove.addEventListener('click', () => { commercialOrder.splice(index, 1); render(); });
      row.append(remove); summary.append(row);
    });
    if (commercialOrder.length) {
      const total = document.createElement('strong'); total.textContent = `Total do pedido: ${nf(commercialOrder.reduce((sum, i) => sum + Number(i.metros) * i.quantidade, 0))} m`; summary.append(total);
    }
  };
  $('#orderBuilder').addEventListener('submit', e => {
    e.preventDefault();
    if (!e.target.reportValidity()) return;
    commercialOrder.push({bitola:gauge, cor:color.value, metros:meters.value, quantidade:Number(quantity.value), embalagem:packaging.value}); render();
  });
  update(); render();
})();

/* =========================================================
   5. LINHA DO TEMPO · NEW CABOS x GENÉRICO
   ---------------------------------------------------------
   Comparativo ilustrativo. Cada passo muda o visual dos
   dois cabos; o genérico ganha classes de desgaste.
   ========================================================= */
(function linhaDoTempo() {
  const tl = $('#tl');
  if (!tl) return;

  const PASSOS = [
    { label: 'Dia 1',   dias: 0,    trocas: '0',
      nc:  { st: 'Novo',           cls: 'is-ok',  bar: 100, txt: 'Metragem marcada de metro em metro e documentação.' },
      gen: { st: 'Novo',           cls: 'is-ok',  bar: 100, txt: 'Parece igual. Mas sem marcação e sem documentação.', jk: '#1D2128' } },
    { label: '1 ano',   dias: 365,  trocas: '0',
      nc:  { st: 'Como novo',      cls: 'is-ok',  bar: 98,  txt: 'Capa dupla firme, com resistência UV.' },
      gen: { st: 'Ressecando',     cls: 'is-mid', bar: 75,  txt: 'Sem resistência UV, o sol resseca a capa.', jk: '#3A3530' } },
    { label: '3 anos',  dias: 1095, trocas: '0',
      nc:  { st: 'Sem rachaduras', cls: 'is-ok',  bar: 96,  txt: 'Conector limpo, sem oxidação.' },
      gen: { st: 'Rachando',       cls: 'is-bad', bar: 40,  txt: 'A capa racha. Risco de falha e de parada do sistema.', jk: '#5E5347' } },
    { label: '10 anos', dias: 3650, trocas: '1',
      nc:  { st: 'Funcionando',    cls: 'is-ok',  bar: 92,  txt: 'Capa e cobre estanhado em boas condições.' },
      gen: { st: 'Hora de trocar', cls: 'is-bad', bar: 12,  txt: 'Cobre exposto. Equipe de volta ao telhado.', jk: '#7D6E5D' } },
    { label: '25 anos', dias: 9125, trocas: '2+',
      nc:  { st: 'Funcionando',    cls: 'is-ok',  bar: 88,  txt: 'Projetado para a vida útil do sistema.' },
      gen: { st: 'Trocado de novo', cls: 'is-bad', bar: 20, txt: 'Já foi trocado uma ou mais vezes.', jk: '#8A7965' } },
  ];
  const ULTIMO = PASSOS.length - 1;

  const nc = $('.tl__card--nc', tl), gen = $('.tl__card--gen', tl);
  const stops = $$('.tl__stop', tl);
  const yearEl = $('#tlYear'), daysEl = $('#tlDays'), tripsEl = $('#tlTrips');
  const fill = $('#tlFill'), track = $('#tlTrack'), stage = $('#tlStage'), playBtn = $('#tlPlay');

  let atual = -1, diasMostrados = 0, timer = null, rafDias = null;

  const pinta = (card, d) => {
    const st = $('[data-status]', card);
    st.textContent = d.st;
    st.className = `tl__status ${d.cls}`;
    $('[data-bar]', card).style.width = `${d.bar}%`;
    $('[data-bar]', card).className = d.cls;
    $('[data-txt]', card).textContent = d.txt;
  };

  const contaDias = (alvo) => {
    cancelAnimationFrame(rafDias);
    if (reduceMotion) { diasMostrados = alvo; daysEl.textContent = nf(alvo); return; }
    const de = diasMostrados, t0 = performance.now(), dur = 650;
    const passo = (t) => {
      const k = Math.min((t - t0) / dur, 1);
      diasMostrados = Math.round(de + (alvo - de) * (1 - Math.pow(1 - k, 3)));
      daysEl.textContent = nf(diasMostrados);
      if (k < 1) rafDias = requestAnimationFrame(passo);
    };
    rafDias = requestAnimationFrame(passo);
  };

  const vaiPara = (i) => {
    i = Math.max(0, Math.min(ULTIMO, i));
    if (i === atual) return;
    atual = i;
    const p = PASSOS[i];

    tl.dataset.step = i;
    yearEl.textContent = p.label;
    yearEl.classList.remove('is-tick'); void yearEl.offsetWidth; yearEl.classList.add('is-tick');
    contaDias(p.dias);

    pinta(nc, p.nc);
    pinta(gen, p.gen);
    gen.style.setProperty('--jk', p.gen.jk);
    gen.classList.toggle('is-dry',     i >= 1);
    gen.classList.toggle('is-crack',   i >= 2);
    gen.classList.toggle('is-worn',    i >= 3);
    gen.classList.toggle('is-swapped', i >= 4);

    if (tripsEl.textContent !== p.trocas) {
      tripsEl.textContent = p.trocas;
      tripsEl.classList.remove('is-bump'); void tripsEl.offsetWidth; tripsEl.classList.add('is-bump');
    }

    fill.style.width = `${(i / ULTIMO) * 100}%`;
    stops.forEach((b, k) => {
      b.setAttribute('aria-selected', k === i);
      b.tabIndex = k === i ? 0 : -1;
      b.classList.toggle('is-past', k <= i);
    });
  };

  /* play / pause */
  const para = () => { clearInterval(timer); timer = null; tl.classList.remove('is-playing'); };
  const toca = () => {
    if (atual >= ULTIMO) vaiPara(0);
    tl.classList.add('is-playing');
    timer = setInterval(() => { atual >= ULTIMO ? para() : vaiPara(atual + 1); }, 1700);
  };
  playBtn.addEventListener('click', () => (timer ? para() : toca()));

  /* toque nos anos + teclado */
  stops.forEach(b => b.addEventListener('click', () => { para(); vaiPara(+b.dataset.step); }));
  track.addEventListener('keydown', (e) => {
    const mov = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key];
    if (mov === undefined) return;
    e.preventDefault(); para();
    vaiPara(atual + mov);
    stops[atual].focus();
  });

  /* arrastar na régua */
  const passoDoPonto = (x) => {
    const r = track.getBoundingClientRect();
    return Math.round(Math.max(0, Math.min(1, (x - r.left) / r.width)) * ULTIMO);
  };
  track.addEventListener('pointerdown', (e) => {
    para();
    track.setPointerCapture(e.pointerId);
    vaiPara(passoDoPonto(e.clientX));
    const move = (ev) => vaiPara(passoDoPonto(ev.clientX));
    const solta = () => { track.removeEventListener('pointermove', move); track.removeEventListener('pointerup', solta); track.removeEventListener('pointercancel', solta); };
    track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', solta);
    track.addEventListener('pointercancel', solta);
  });

  /* deslizar os cabos pro lado (swipe) */
  let x0 = null, y0 = null;
  stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    para();
    vaiPara(atual + (dx < 0 ? 1 : -1));
  });

  vaiPara(0);

  /* toca sozinho uma vez quando a seção aparece */
  if (!reduceMotion) {
    const io = new IntersectionObserver((ents) => {
      if (!ents[0].isIntersecting) return;
      io.disconnect();
      setTimeout(() => { if (atual === 0 && !timer) toca(); }, 600);
    }, { threshold: 0.55 });
    io.observe(stage);
  }
})();

/* =========================================================
   6. FORMULÁRIO EM 3 PASSOS
   ---------------------------------------------------------
   O envio manda os dados em JSON (POST) para CONFIG.webhook
   (n8n). Para trocar de destino, mexa só em `enviar()`.
   ========================================================= */
(function wizard() {
  const form = $('#wizForm');
  if (!form) return;

  const panes = $$('.wiz__pane', form);
  const dots  = $$('[data-wizdot]');
  const label = $('#wizLabel');
  const btnBack = $('#wizBack'), btnNext = $('#wizNext'), btnSend = $('#wizSend');
  const sendErr = $('#wizSendErr'), done = $('#wizDone');

  const titles = ['Quem é você', 'Produtos', 'Seus dados'];
  const BITOLAS = ['4', '6', '10', '16'];
  const CORES   = ['Preto', 'Vermelho', 'Verde'];
  const data = { perfil: '', pessoa: '' };
  const cnpj = { razao: '', local: '' };   // preenchido pela consulta, se der certo
  let step = 1;

  /* --- seleção de cards e chips --- */
  $$('[data-choice]').forEach(group => {
    const key = group.dataset.choice;
    $$('button', group).forEach(b => b.addEventListener('click', () => {
      $$('button', group).forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      data[key] = b.dataset.value;
      hideErr(key);
      if (key === 'pessoa') mostraCnpj();
    }));
  });

  const showErr = (k) => { const e = $(`[data-err="${k}"]`); if (e) e.hidden = false; };
  const hideErr = (k) => { const e = $(`[data-err="${k}"]`); if (e) e.hidden = true; };

  /* --- passo 2: lista de produtos (bitola · metragem · cor) --- */
  const itemsEl = $('#items');
  const opts = (arr, fmt) => arr.map(v => `<option value="${v}">${fmt(v)}</option>`).join('');

  const novoItem = (item = null) => {
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `
      <div class="item__head"><b>Produto <span data-n></span></b>
        <button type="button" class="item__rm" aria-label="Remover este produto">Remover</button></div>
      <div class="item__grid">
        <label class="wiz__field">Bitola
          <select data-f="bitola"><option value="">Selecione</option>${opts(BITOLAS, v => v + ' mm²')}</select>
        </label>
        <label class="wiz__field">Metragem por unidade (m)
          <input type="text" data-f="metros" inputmode="numeric" placeholder="Ex.: 100 m">
        </label>
        <label class="wiz__field">Cor
          <select data-f="cor"><option value="">Selecione</option>${opts(CORES, v => v)}</select>
        </label>
        <label class="wiz__field">Quantidade de unidades<input type="number" data-f="quantidade" min="1" max="99999" step="1" value="1" required></label>
        <label class="wiz__field">Acondicionamento desejado<select data-f="embalagem"><option value="">Padrão da fábrica</option><option>Retalho</option><option>Rolo</option><option>Carretel</option><option>Bobina</option></select></label>
      </div><p class="wiz__hint" data-package role="status"></p>`;
    $('[data-f=metros]', row).addEventListener('input', (e) => {
      const v = e.target.value.replace(/\D/g, '').slice(0, 7);
      e.target.value = v ? nf(+v) : '';
      hideErr('itens');
    });
    $$('select', row).forEach(sel => sel.addEventListener('change', () => hideErr('itens')));
    $('.item__rm', row).addEventListener('click', () => { row.remove(); numeraItens(); });
    if (item) Object.entries(item).forEach(([key, value]) => { const field = $(`[data-f="${key}"]`, row); if (field) field.value = key === 'metros' ? nf(Number(value)) : value; });
    const refreshPackage = () => {
      $('[data-package]', row).textContent = packagingText(packagingFor($('[data-f=bitola]', row).value, Number($('[data-f=metros]', row).value.replace(/\D/g, '')), $('[data-f=embalagem]', row).value));
    };
    row.addEventListener('input', refreshPackage); row.addEventListener('change', refreshPackage); refreshPackage();
    itemsEl.appendChild(row);
    numeraItens();
  };

  const numeraItens = () => {
    const rows = $$('.item', itemsEl);
    rows.forEach((r, i) => {
      $('[data-n]', r).textContent = i + 1;
      $('.item__rm', r).hidden = rows.length === 1;
    });
  };

  const lerItens = () => $$('.item', itemsEl).map(r => ({
    bitola: $('[data-f=bitola]', r).value,
    metros: $('[data-f=metros]', r).value.trim(),
    cor:    $('[data-f=cor]', r).value,
    quantidade: Number($('[data-f=quantidade]', r).value),
    embalagem: $('[data-f=embalagem]', r).value,
  }));

  $('#itemAdd').addEventListener('click', () => {
    novoItem();
    const rows = $$('.item', itemsEl);
    $('select', rows[rows.length - 1]).focus();
  });
  novoItem();
  $('#orderQuote').addEventListener('click', () => {
    if (!commercialOrder.length) return;
    itemsEl.replaceChildren(); commercialOrder.forEach(item => novoItem(item));
    go(1, false);
  });

  /* --- passo 3: PF/PJ e CNPJ --- */
  const cnpjBox = $('#cnpjBox'), cnpjIn = $('#wCnpj'), cnpjInfo = $('#cnpjInfo');

  const mostraCnpj = () => { cnpjBox.hidden = data.pessoa !== 'PJ'; };

  // aceita o CNPJ alfanumérico (a partir de jul/2026): 12 caracteres + 2 dígitos
  const limpaCnpj = (v) => v.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 14);
  const mascaraCnpj = (c) => [c.slice(0, 2), c.slice(2, 5), c.slice(5, 8)].filter(Boolean).join('.')
    + (c.length > 8 ? '/' + c.slice(8, 12) : '') + (c.length > 12 ? '-' + c.slice(12) : '');
  const cnpjConfere = (c) => {
    if (c.length !== 14 || !/^\d{2}$/.test(c.slice(12))) return false;
    const dv = (base) => {
      const pesos = base.length === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
      const soma = [...base].reduce((t, ch, i) => t + (ch.charCodeAt(0) - 48) * pesos[i], 0);
      const r = soma % 11;
      return r < 2 ? 0 : 11 - r;
    };
    const d1 = dv(c.slice(0, 12));
    return d1 === +c[12] && dv(c.slice(0, 12) + d1) === +c[13];
  };

  let consultaId = 0;
  const consultaCnpj = async (c) => {
    const id = ++consultaId;
    cnpj.razao = ''; cnpj.local = '';
    cnpjInfo.hidden = false; cnpjInfo.className = 'wiz__hint';
    cnpjInfo.textContent = 'Buscando o nome da empresa…';
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 6000);
      const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${c}`, { signal: ctl.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      if (id !== consultaId) return;
      cnpj.razao = (j.razao_social || '').trim();
      cnpj.local = [j.municipio, j.uf].filter(Boolean).join('/');
      cnpjInfo.className = 'wiz__hint is-ok';
      cnpjInfo.textContent = cnpj.razao ? `✓ ${cnpj.razao}${cnpj.local ? ' · ' + cnpj.local : ''}` : '✓ CNPJ encontrado';
    } catch (_) {
      if (id !== consultaId) return;
      cnpjInfo.className = 'wiz__hint';
      cnpjInfo.textContent = 'Não consegui buscar o nome da empresa agora. Sem problema, pode continuar.';
    }
  };

  cnpjIn.addEventListener('input', () => {
    const c = limpaCnpj(cnpjIn.value);
    cnpjIn.value = mascaraCnpj(c);
    hideErr('cnpj');
    consultaId++;
    cnpj.razao = ''; cnpj.local = '';
    if (c.length === 14 && cnpjConfere(c)) consultaCnpj(c);
    else if (c.length === 14) { cnpjInfo.hidden = false; cnpjInfo.className = 'wiz__hint'; cnpjInfo.textContent = 'Esse CNPJ parece estar incorreto. Confira os números.'; }
    else cnpjInfo.hidden = true;
  });

  const valida = (s) => {
    if (s === 1) {
      if (!data.perfil) { showErr('perfil'); return false; }
    }
    if (s === 2) {
      const ok = lerItens().every(i => i.bitola && i.cor && +i.metros.replace(/\D/g, '') > 0 && Number.isInteger(i.quantidade) && i.quantidade > 0 && i.quantidade <= 99999);
      if (!ok) { showErr('itens'); return false; }
    }
    if (s === 3) {
      let ok = true;
      const nome = $('#wNome').value.trim(), fone = $('#wFone').value.trim();
      if (!nome || fone.replace(/\D/g, '').length < 10) { showErr('contato'); ok = false; } else hideErr('contato');
      if (!data.pessoa) { showErr('pessoa'); ok = false; }
      if (data.pessoa === 'PJ' && !cnpjConfere(limpaCnpj(cnpjIn.value))) { showErr('cnpj'); ok = false; }
      if (!ok) return false;
    }
    return true;
  };

  const go = (s, scroll = true) => {
    step = s;
    panes.forEach(p => p.classList.toggle('is-active', +p.dataset.pane === s));
    dots.forEach(d => {
      const n = +d.dataset.wizdot;
      d.classList.toggle('is-active', n === s);
      d.classList.toggle('is-done', n < s);
      if (n < s) d.textContent = '✓'; else d.textContent = String(n);
    });
    $('#wizProgress').style.width  = s > 1 ? '100%' : '0';
    $('#wizProgress2').style.width = s > 2 ? '100%' : '0';
    label.textContent = `Passo ${s} de 3 · ${titles[s - 1]}`;
    btnBack.hidden = s === 1;
    btnNext.hidden = s === 3;
    btnSend.hidden = s !== 3;
    sendErr.hidden = true;
    if (scroll) form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  };

  btnNext.addEventListener('click', () => { if (valida(step)) go(step + 1); });
  btnBack.addEventListener('click', () => go(Math.max(step - 1, 1)));

  /* --- máscara simples de telefone --- */
  $('#wFone').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6)      v = `(${v.slice(0, 2)}) ${v.slice(2, v.length - 4)}-${v.slice(-4)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    e.target.value = v;
  });

  /* --- monta a mensagem --- */
  const montaMensagem = () => {
    const g = (id) => $(id).value.trim();
    const itens = lerItens().map(i => `• ${i.bitola} mm² · ${i.cor} · ${i.quantidade} × ${i.metros} m · Total: ${nf(Number(i.metros.replace(/\D/g, '')) * i.quantidade)} m · ${packagingText(packagingFor(i.bitola, Number(i.metros.replace(/\D/g, '')), i.embalagem))}`);
    const pj = data.pessoa === 'PJ';
    const linhas = [
      `*Pedido de cotação — site ${CONFIG.empresa}*`,
      '',
      `*Perfil:* ${data.perfil}`,
      '*Produtos (bitola · cor · metragem):*',
      ...itens,
      '',
      `*Nome:* ${g('#wNome')}`,
      `*Tipo:* ${pj ? 'Pessoa jurídica' : 'Pessoa física'}`,
      pj ? `*CNPJ:* ${g('#wCnpj')}${cnpj.razao ? ' — ' + cnpj.razao : ''}` : null,
      pj && cnpj.local ? `*Cidade:* ${cnpj.local}` : null,
      `*Telefone:* ${g('#wFone')}`,
      g('#wEmail') ? `*E-mail:* ${g('#wEmail')}` : null,
      g('#wMsg')   ? `\n*Sobre a obra/pedido:*\n${g('#wMsg')}` : null,
    ].filter(Boolean);
    return linhas.join('\n');
  };

  /* --- dados do lead, no formato que chega no n8n --- */
  const montaLead = () => {
    const g = (id) => $(id).value.trim();
    const pj = data.pessoa === 'PJ';
    const qs = new URLSearchParams(location.search);
    const utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']
      .forEach(k => { if (qs.get(k)) utm[k] = qs.get(k); });
    return {
      origem: `LP ${CONFIG.empresa}`,
      enviado_em: new Date().toISOString(),
      pagina: location.href,
      perfil: data.perfil,
      produtos: lerItens().map(i => ({ bitola_mm2: i.bitola, metragem_m: i.metros, metragem_por_unidade_m: Number(i.metros.replace(/\D/g, '')), quantidade: i.quantidade, metragem_total_m: Number(i.metros.replace(/\D/g, '')) * i.quantidade, cor: i.cor, acondicionamento: packagingFor(i.bitola, Number(i.metros.replace(/\D/g, '')), i.embalagem) })),
      nome: g('#wNome'),
      tipo_pessoa: pj ? 'PJ' : 'PF',
      cnpj: pj ? g('#wCnpj') : '',
      razao_social: pj ? cnpj.razao : '',
      cidade: pj ? cnpj.local : '',
      telefone: g('#wFone'),
      email: g('#wEmail'),
      mensagem: g('#wMsg'),
      resumo: montaMensagem().replace(/\*/g, ''),
      ...utm,
    };
  };

  const enviar = async () => {
    sendErr.hidden = true;
    btnSend.disabled = true;
    btnSend.textContent = 'Enviando…';
    try {
      if (!CONFIG.webhook) throw new Error('CONFIG.webhook vazio: lead não enviado');
      const r = await fetch(CONFIG.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(montaLead()),
      });
      if (!r.ok) throw new Error(`webhook respondeu ${r.status}`);
      form.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    } catch (err) {
      console.error('[formulário]', err);
      sendErr.hidden = false;
    } finally {
      btnSend.disabled = false;
      btnSend.textContent = 'Enviar pedido de cotação';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (btnSend.disabled) return;
    for (const s of [1, 2, 3]) { if (!valida(s)) { go(s); return; } }
    enviar();
  });

  go(1, false); // estado inicial não deve rolar a página
})();
