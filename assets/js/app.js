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

const PACKAGING_ICONS = {
  Retalho: '<path d="M4 15c0-5 5-8 8-5s8 0 8-4M4 15c0 5 5 6 8 2s8-1 8 4"/>',
  Rolo: '<ellipse cx="12" cy="8" rx="8" ry="4"/><path d="M4 8v7c0 5 16 5 16 0V8M4 12c0 5 16 5 16 0"/><ellipse cx="12" cy="8" rx="3" ry="1.5"/>',
  Carretel: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M6 7v10m12-10v10M4 18c0 5 16 5 16 0M6 10h12M6 13h12M6 16h12"/>',
  Bobina: '<ellipse cx="6" cy="12" rx="4" ry="9"/><ellipse cx="6" cy="12" rx="1" ry="2"/><path d="M6 3h12c5 0 5 18 0 18H6m4-15h8m-8 3h10m-10 6h10m-10 3h8"/>',
};
const packagingChoices = name => `
  <label class="packaging-choice packaging-choice--auto"><input class="item__radio" type="radio" name="${name}" data-f="embalagem" value="" checked><span>Indicar automaticamente <small>Conforme a bitola e a metragem</small></span></label>
  ${Object.entries(PACKAGING_ICONS).map(([label, icon]) => `<label class="packaging-choice"><input class="item__radio" type="radio" name="${name}" data-f="embalagem" value="${label}"><span><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icon}</svg><b>${label}</b></span></label>`).join('')}`;

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
  $('#heroPackagingOptions').innerHTML = packagingChoices('hero-packaging');
  const meters = $('#orderMeters'), quantity = $('#orderQuantity'), color = $('#orderColor'), packaging = $('#orderPackaging');
  const selectedColor = () => $('input:checked', color).value;
  const selectedPackaging = () => $('input:checked', packaging).value;
  const update = () => {
    $('#heroSpecLabel').textContent = `${gauge} mm²`;
    $('#cablePrint').textContent = `NEW CABOS · ${gauge}mm² · 1800V · 0001 m`;
    const shrink = {4:38,6:32,10:25,16:18}[gauge];
    $('.cable-3d__core').style.inset = `${shrink}px 0`;
    $('.cable-3d__insul').style.inset = `${Math.max(shrink - 15, 8)}px 0`;
    $('.cable-3d__jacket').style.background = {Preto:'#171b22',Vermelho:'#b82c32',Verde:'#167547'}[selectedColor()];
    $('#orderPackage').textContent = packagingText(packagingFor(gauge, Number(meters.value), selectedPackaging()));
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
    commercialOrder.push({bitola:gauge, cor:selectedColor(), metros:meters.value, quantidade:Number(quantity.value), embalagem:selectedPackaging()}); render();
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
      $$('button', group).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      if (key === 'pessoa') mostraCnpj();
    }));
  });

  const showErr = (k) => { const e = $(`[data-err="${k}"]`); if (e) e.hidden = false; };
  const hideErr = (k) => { const e = $(`[data-err="${k}"]`); if (e) e.hidden = true; };

  /* --- passo 2: cartões de produto e acondicionamento automático --- */
  const itemsEl = $('#items');
  let itemSequence = 0;
  const checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const readItem = row => ({
    bitola: $('[data-f=bitola]:checked', row)?.value || '',
    cor: $('[data-f=cor]:checked', row)?.value || '',
    metros: $('[data-f=metros]', row).value.trim(),
    quantidade: Number($('[data-f=quantidade]', row).value),
    embalagem: $('[data-f=embalagem]:checked', row)?.value || '',
  });
  const metersValue = item => Number(item.metros.replace(/\D/g, ''));
  const lerItens = () => $$('.item', itemsEl).map(readItem);
  const itemError = row => {
    const item = readItem(row);
    if (!BITOLAS.includes(item.bitola)) return { field: $('[data-f=bitola]', row), message: 'Escolha a bitola deste produto.' };
    if (!CORES.includes(item.cor)) return { field: $('[data-f=cor]', row), message: 'Escolha a cor deste produto.' };
    if (!metersValue(item) || metersValue(item) > 9999999) return { field: $('[data-f=metros]', row), message: 'Informe a metragem por unidade, de 1 a 9.999.999 m.' };
    if (!Number.isInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 99999) return { field: $('[data-f=quantidade]', row), message: 'Informe uma quantidade inteira, de 1 a 99.999 unidades.' };
    return null;
  };
  const updateOrderTotal = () => {
    const items = lerItens();
    const complete = items.filter((_, index) => !itemError($$('.item', itemsEl)[index]));
    const units = complete.reduce((sum, i) => sum + i.quantidade, 0);
    $('#itemsTotal').textContent = `${nf(complete.reduce((sum, i) => sum + metersValue(i) * i.quantidade, 0))} m`;
    $('#itemsTotalDetails').textContent = complete.length ? `${complete.length} ${complete.length === 1 ? 'produto' : 'produtos'} · ${nf(units)} ${units === 1 ? 'unidade' : 'unidades'}${complete.length < items.length ? ' · Há produto para completar' : ''}` : 'Configure seu primeiro produto acima';
  };
  const numeraItens = () => {
    const rows = $$('.item', itemsEl);
    rows.forEach((row, index) => {
      $('[data-n]', row).textContent = String(index + 1).padStart(2, '0');
      row.setAttribute('aria-label', `Produto ${index + 1}`);
      $('.item__rm', row).hidden = rows.length === 1;
      $('.item__rm', row).setAttribute('aria-label', `Remover produto ${index + 1}`);
      $$('[data-quantity-step]', row).forEach(button => button.setAttribute('aria-label', `${Number(button.dataset.quantityStep) > 0 ? 'Aumentar' : 'Diminuir'} quantidade do produto ${index + 1}`));
    });
    updateOrderTotal();
  };
  const novoItem = (item = null) => {
    const uid = ++itemSequence;
    const row = document.createElement('article');
    row.className = 'item';
    row.innerHTML = `
      <header class="item__head">
        <div class="item__identity"><span class="item__number" data-n></span><div><strong data-item-title>Cabo fotovoltaico</strong><span class="item__subtitle">Configure seu produto</span></div></div>
        <button type="button" class="item__rm"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5m4-5v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Remover</span></button>
      </header>
      <div class="item__body">
        <fieldset class="item__options"><legend>Bitola do cabo</legend>
          <div class="item__gauges">${BITOLAS.map(v => `<label class="item__gauge"><input class="item__radio" type="radio" name="bitola-${uid}" data-f="bitola" value="${v}"><span><b>${v}</b><small>mm²</small></span></label>`).join('')}</div>
        </fieldset>
        <fieldset class="item__options"><legend>Cor</legend>
          <div class="item__colors">${CORES.map(v => `<label class="item__color"><input class="item__radio" type="radio" name="cor-${uid}" data-f="cor" value="${v}" ${v === 'Preto' ? 'checked' : ''}><span><i class="item__swatch" data-color="${v}" aria-hidden="true"></i>${v}${checkIcon}</span></label>`).join('')}</div>
        </fieldset>
        <fieldset class="item__options"><legend>Acondicionamento desejado</legend><div class="packaging-options">${packagingChoices(`packaging-${uid}`)}</div></fieldset>
        <div class="item__measurements">
          <div class="item__measure"><label class="item__label" for="meters-${uid}">Metros por unidade</label>
            <div class="item__input-wrap"><input id="meters-${uid}" type="text" data-f="metros" inputmode="numeric" maxlength="9" placeholder="Ex.: 100" aria-describedby="meters-help-${uid}"><span aria-hidden="true">m</span></div>
            <small class="item__help" id="meters-help-${uid}">Metragem de cada retalho, rolo, carretel ou bobina.</small>
            <div class="item__presets" role="group" aria-label="Atalhos de metragem">${[50,100,200,500].map(v => `<button type="button" data-meters="${v}" aria-pressed="false">${v} m</button>`).join('')}</div>
          </div>
          <div class="item__measure"><label class="item__label" for="quantity-${uid}">Quantidade de unidades</label>
            <div class="item__stepper"><button type="button" data-quantity-step="-1">−</button><input id="quantity-${uid}" type="number" data-f="quantidade" min="1" max="99999" step="1" value="1" inputmode="numeric" aria-describedby="quantity-help-${uid}"><button type="button" data-quantity-step="1">+</button></div>
            <small class="item__help" id="quantity-help-${uid}">Quantas unidades desta metragem?</small>
          </div>
        </div>
        <div class="item__packaging" role="status"><span class="item__package-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></span><div><strong data-package-title>Acondicionamento automático</strong><p data-package-copy>Escolha a bitola e informe a metragem. Nós indicamos a embalagem.</p></div></div>

        <p class="item__error" id="item-error-${uid}" data-item-error role="alert" hidden></p>
      </div>
      <footer class="item__footer"><span data-item-summary>Total deste produto</span><strong data-item-total>— m</strong></footer>`;
    if (item) {
      $$('[data-f=bitola], [data-f=cor]', row).forEach(input => { input.checked = input.value === String(item[input.dataset.f] || ''); });
      $('[data-f=metros]', row).value = item.metros ? nf(Number(item.metros)) : '';
      $('[data-f=quantidade]', row).value = item.quantidade ?? 1;
      $$('[data-f=embalagem]', row).forEach(input => { input.checked = input.value === (item.embalagem || ''); });
    }
    const refresh = () => {
      const current = readItem(row), meters = metersValue(current);
      const ready = current.bitola && meters > 0;
      const pack = packagingFor(current.bitola, meters, current.embalagem);
      const status = $('.item__packaging', row);
      status.classList.toggle('is-standard', Boolean(ready && !pack.analise));
      status.classList.toggle('is-review', Boolean(ready && pack.analise));
      $('[data-package-title]', row).textContent = !ready ? 'Acondicionamento automático' : pack.analise ? 'Vamos confirmar a embalagem com você' : `${pack.padrao} · padrão da fábrica`;
      $('[data-package-copy]', row).textContent = !ready ? 'Escolha a bitola e informe a metragem. Nós indicamos a embalagem.' : pack.analise ? `${pack.solicitado ? 'Preferência: ' + pack.solicitado + '. ' : ''}${pack.padrao ? 'Padrão para esta metragem: ' + pack.padrao + '. ' : ''}Sujeito à análise comercial e produtiva, sem garantia de disponibilidade.` : 'Embalagem indicada para esta metragem. Fornecimento sujeito à confirmação da New Cabos.';
      $('[data-item-title]', row).textContent = current.bitola ? `Cabo fotovoltaico · ${current.bitola} mm²` : 'Cabo fotovoltaico';
      $('.item__subtitle', row).textContent = current.bitola ? `${current.cor || 'Escolha a cor'} · ${ready ? 'Configuração do pedido' : 'Informe a metragem abaixo'}` : 'Selecione a bitola para começar';
      const validQuantity = Number.isInteger(current.quantidade) && current.quantidade > 0 && current.quantidade <= 99999;
      $('[data-item-summary]', row).textContent = meters && validQuantity ? `${nf(current.quantidade)} ${current.quantidade === 1 ? 'unidade' : 'unidades'} × ${nf(meters)} m` : 'Total deste produto';
      $('[data-item-total]', row).textContent = meters && validQuantity ? `${nf(meters * current.quantidade)} m` : '— m';
      $$('[data-meters]', row).forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.meters) === meters)));
      const quantity = $('[data-f=quantidade]', row);
      $('[data-quantity-step="-1"]', row).disabled = Number(quantity.value) <= 1;
      $('[data-quantity-step="1"]', row).disabled = Number(quantity.value) >= 99999;
      const message = $('[data-item-error]', row);
      if (!message.hidden) {
        const error = itemError(row);
        row.classList.toggle('is-invalid', Boolean(error)); message.hidden = !error;
        $$('[aria-invalid]', row).forEach(input => { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-errormessage'); });
        if (error) {
          message.textContent = error.message;
          error.field.setAttribute('aria-invalid', 'true');
          error.field.setAttribute('aria-errormessage', message.id);
        }
      }
      updateOrderTotal();
    };
    $('[data-f=metros]', row).addEventListener('input', e => {
      const value = e.target.value.replace(/\D/g, '').slice(0, 7);
      e.target.value = value ? nf(Number(value)) : '';
    });
    row.addEventListener('input', () => { hideErr('itens'); refresh(); });
    row.addEventListener('change', () => { hideErr('itens'); refresh(); });
    $$('[data-meters]', row).forEach(button => button.addEventListener('click', () => {
      $('[data-f=metros]', row).value = nf(Number(button.dataset.meters)); hideErr('itens'); refresh();
    }));
    $$('[data-quantity-step]', row).forEach(button => button.addEventListener('click', () => {
      const input = $('[data-f=quantidade]', row), value = Number(input.value);
      input.value = Math.min(99999, Math.max(1, (Number.isFinite(value) ? Math.floor(value) : 1) + Number(button.dataset.quantityStep)));
      hideErr('itens'); refresh();
    }));
    $('.item__rm', row).addEventListener('click', () => {
      const next = row.nextElementSibling || row.previousElementSibling;
      row.remove(); numeraItens(); hideErr('itens');
      ($('[data-f=bitola]:checked', next) || $('[data-f=bitola]', next))?.focus();
    });
    itemsEl.appendChild(row); numeraItens(); refresh();
    return row;
  };
  $('#itemAdd').addEventListener('click', () => {
    const row = novoItem(); $('[data-f=bitola]', row).focus(); hideErr('itens');
  });
  novoItem();
  $('#orderQuote').addEventListener('click', () => {
    if (!commercialOrder.length) return;
    itemsEl.replaceChildren(); commercialOrder.forEach(item => novoItem(item));
    go(data.perfil ? 2 : 1, false);
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
      let firstInvalid = null;
      $$('.item', itemsEl).forEach(row => {
        const error = itemError(row);
        row.classList.toggle('is-invalid', Boolean(error));
        const message = $('[data-item-error]', row); message.hidden = !error;
        $$('[aria-invalid]', row).forEach(input => { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-errormessage'); });
        if (error) {
          message.textContent = error.message;
          error.field.setAttribute('aria-invalid', 'true');
          error.field.setAttribute('aria-errormessage', message.id);
          firstInvalid ||= error.field;
        }
      });
      if (firstInvalid) { showErr('itens'); firstInvalid.focus(); return false; }
    }
    if (s === 3) {
      let ok = true;
      const nome = $('#wNome').value.trim(), fone = $('#wFone').value.trim();
      if (!nome || fone.replace(/\D/g, '').length < 10) { showErr('contato'); ok = false; } else hideErr('contato');
      const email = $('#wEmail');
      email.value = email.value.trim();
      if (!email.checkValidity()) { showErr('email'); email.setAttribute('aria-invalid', 'true'); ok = false; }
      else { hideErr('email'); email.removeAttribute('aria-invalid'); }
      if ($('#wMsg').value.length > $('#wMsg').maxLength) { showErr('mensagem'); ok = false; } else hideErr('mensagem');
      if (!data.pessoa) { showErr('pessoa'); ok = false; }
      if (data.pessoa === 'PJ' && !cnpjConfere(limpaCnpj(cnpjIn.value))) { showErr('cnpj'); ok = false; }
      if (!ok) {
        if (step === 3) {
          if (!nome) $('#wNome').focus();
          else if (fone.replace(/\D/g, '').length < 10) $('#wFone').focus();
          else if (!email.checkValidity()) email.focus();
        }
        return false;
      }
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
    dots.forEach(dot => {
      if (Number(dot.dataset.wizdot) === s) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
    btnNext.textContent = s === 2 ? 'Continuar para contato →' : 'Montar meu pedido →';
    btnBack.hidden = s === 1;
    btnNext.hidden = s === 3;
    btnSend.hidden = s !== 3;
    sendErr.hidden = true;
    if (scroll) {
      const heading = $(`[data-pane="${s}"] > legend`, form);
      heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true });
      $('.wiz').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
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

  const messageInput = $('#wMsg');
  messageInput.addEventListener('input', () => {
    $('#messageCount').textContent = nf(messageInput.value.length);
    hideErr('mensagem');
  });
  $('#wEmail').addEventListener('input', e => {
    hideErr('email'); e.target.removeAttribute('aria-invalid');
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
    for (const s of [1, 2, 3]) { if (!valida(s)) { if (step !== s) go(s); return; } }
    enviar();
  });

  go(1, false); // estado inicial não deve rolar a página
})();
