/* =========================================================
   NEW CABOS — Landing Page
   Vanilla JS, sem dependências.
   ---------------------------------------------------------
   ⚠️  AJUSTE AQUI ANTES DE PUBLICAR: telefone, WhatsApp e e-mail.
   Os valores abaixo são PLACEHOLDERS — troque pelos reais.
   ========================================================= */
const CONFIG = {
  // Dados reais, extraídos da LP oficial (lp.newcabos.com.br)
  whatsapp: '5515997556534',
  telefone: '+5515997556534',
  telefoneLabel: '(15) 99755-6534',
  email: 'contato@newcabos.com.br',
  empresa: 'New Cabos',
};

/* ---------- helpers ---------- */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const nf = (n, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const waLink = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   DADOS DE PRODUTO
   Valores de ampacidade são referências de catálogo para cabo
   fotovoltaico ao ar livre — confirme com a ficha técnica oficial.
   ========================================================= */
const GAUGES = {
  4:  { amp: 55,  diam: '5,6 mm', peso: '62 g/m',  strands: 56,  viz: 104,
        uso: 'O mais usado em casa e em comércio pequeno, quando o inversor fica perto das placas.',
        badge: 'O queridinho das obras em casa' },
  6:  { amp: 70,  diam: '6,4 mm', peso: '85 g/m',  strands: 84,  viz: 120,
        uso: 'O mais vendido do Brasil. Serve pra quase toda obra em casa e em comércio.',
        badge: 'O mais vendido' },
  10: { amp: 98,  diam: '8,0 mm', peso: '138 g/m', strands: 80,  viz: 142,
        uso: 'Pra quando o inversor fica longe das placas, ou quando passa bastante energia junta.',
        badge: 'Pra distância grande' },
  16: { amp: 132, diam: '9,6 mm', peso: '210 g/m', strands: 126, viz: 164,
        uso: 'Pra usina e obra industrial, onde passa muita energia de uma vez só.',
        badge: 'Pra usina e indústria' },
};


/* =========================================================
   1. HEADER, MENU, PROGRESSO, REVEAL
   ========================================================= */
(function chrome() {
  const header = $('#header');
  const bar    = $('#scrollBar');
  const fab    = $('.fab');

  const onScroll = () => {
    const y   = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-stuck', y > 12);
    if (bar) bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    if (fab) fab.classList.toggle('is-in', y > 620);
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
   3. LINKS DE CONTATO (WhatsApp / tel / e-mail)
   ========================================================= */
(function contatos() {
  const msgs = {
    fab:     `Oi! Vim pelo site da ${CONFIG.empresa} e queria falar sobre cabo solar.`,
    direto:  `Oi! Queria um preço de cabo solar da ${CONFIG.empresa}.`,
    footer:  `Oi! Vim pelo site da ${CONFIG.empresa} e queria mais informações sobre cabo solar.`,
  };
  $$('[data-wa]').forEach(a => { a.href = waLink(msgs[a.dataset.wa] || msgs.direto); a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-tel]').forEach(a => { a.href = `tel:${CONFIG.telefone}`; a.textContent = a.textContent.trim() === 'Telefone comercial' || a.textContent.trim() === 'Telefone' ? CONFIG.telefoneLabel : a.textContent; });
  $$('[data-mail]').forEach(a => { a.href = `mailto:${CONFIG.email}`; if (/E-mail/i.test(a.textContent)) a.textContent = CONFIG.email; });
})();

/* =========================================================
   4. CABO DO HERO — troca de bitola
   ========================================================= */
(function heroCable() {
  const pills = $$('.cable-card__switch .pill');
  if (!pills.length) return;
  const stats = $('#heroStats'), label = $('#heroSpecLabel'), print = $('#cablePrint');
  const core = $('.cable-3d__core'), insul = $('.cable-3d__insul');

  const apply = (g) => {
    const d = GAUGES[g];
    label.textContent = `${g} mm²`;
    print.textContent = `NEW CABOS · ${g}mm² · 1500V · 0001 m`;
    $('[data-stat=amp]',  stats).textContent = `${d.amp} A`;
    $('[data-stat=diam]', stats).textContent = d.diam;
    // espessuras proporcionais à bitola
    const shrink = { 4: 38, 6: 32, 10: 25, 16: 18 }[g];
    core.style.inset  = `${shrink}px 0`;
    insul.style.inset = `${Math.max(shrink - 15, 8)}px 0`;
  };

  pills.forEach(p => p.addEventListener('click', () => {
    pills.forEach(x => x.classList.remove('is-active'));
    p.classList.add('is-active');
    apply(p.dataset.gauge);
  }));
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
      nc:  { st: 'Novo',           cls: 'is-ok',  bar: 100, txt: 'Metragem marcada de metro em metro e laudo.' },
      gen: { st: 'Novo',           cls: 'is-ok',  bar: 100, txt: 'Parece igual. Mas sem marcação e sem laudo.', jk: '#1D2128' } },
    { label: '1 ano',   dias: 365,  trocas: '0',
      nc:  { st: 'Como novo',      cls: 'is-ok',  bar: 98,  txt: 'Capa dupla firme, aguenta sol de frente.' },
      gen: { st: 'Ressecando',     cls: 'is-mid', bar: 75,  txt: 'O sol começa a ressecar a capa.', jk: '#3A3530' } },
    { label: '3 anos',  dias: 1095, trocas: '0',
      nc:  { st: 'Sem rachaduras', cls: 'is-ok',  bar: 96,  txt: 'Conector limpo, sem oxidação.' },
      gen: { st: 'Rachando',       cls: 'is-bad', bar: 40,  txt: 'A capa racha. Risco de curto e de o inversor desligar.', jk: '#5E5347' } },
    { label: '10 anos', dias: 3650, trocas: '1',
      nc:  { st: 'Funcionando',    cls: 'is-ok',  bar: 92,  txt: 'Capa e cobre estanhado em boas condições.' },
      gen: { st: 'Hora de trocar', cls: 'is-bad', bar: 12,  txt: 'Cobre exposto. Equipe de volta ao telhado.', jk: '#7D6E5D' } },
    { label: '25 anos', dias: 9125, trocas: '2+',
      nc:  { st: 'Funcionando',    cls: 'is-ok',  bar: 88,  txt: 'Feito pra durar a vida útil do sistema.' },
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
   Não há backend nesta LP: o envio monta uma mensagem
   pronta e abre o WhatsApp do comercial (com alternativa
   por e-mail). Se um dia entrar um CRM/endpoint, troque
   apenas a função `enviar()`.
   ========================================================= */
(function wizard() {
  const form = $('#wizForm');
  if (!form) return;

  const panes = $$('.wiz__pane', form);
  const dots  = $$('[data-wizdot]');
  const label = $('#wizLabel');
  const btnBack = $('#wizBack'), btnNext = $('#wizNext'), btnSend = $('#wizSend');
  const alt = $('#wizAlt'), done = $('#wizDone');

  const titles = ['O que você faz', 'Do que você precisa', 'Seus dados'];
  const data = { perfil: '', bitolas: [], prazo: '' };
  let step = 1;

  /* --- seleção de cards e chips --- */
  $$('[data-choice]').forEach(group => {
    const key = group.dataset.choice;
    const multi = group.dataset.multi === 'true';
    $$('button', group).forEach(b => b.addEventListener('click', () => {
      if (multi) {
        b.classList.toggle('is-on');
        data[key] = $$('button.is-on', group).map(x => x.dataset.value);
      } else {
        $$('button', group).forEach(x => x.classList.remove('is-on'));
        b.classList.add('is-on');
        data[key] = b.dataset.value;
      }
      hideErr(key);
    }));
  });

  const showErr = (k) => { const e = $(`[data-err="${k}"]`); if (e) e.hidden = false; };
  const hideErr = (k) => { const e = $(`[data-err="${k}"]`); if (e) e.hidden = true; };

  const valida = (s) => {
    if (s === 1) {
      if (!data.perfil) { showErr('perfil'); return false; }
    }
    if (s === 2) {
      let ok = true;
      if (!data.bitolas.length) { showErr('bitolas'); ok = false; }
      if (!data.prazo)          { showErr('prazo');   ok = false; }
      if (!ok) return false;
    }
    if (s === 3) {
      const nome = $('#wNome').value.trim(), fone = $('#wFone').value.trim();
      if (!nome || fone.replace(/\D/g, '').length < 10) { showErr('contato'); return false; }
      hideErr('contato');
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
    alt.hidden = s !== 3;
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
    const linhas = [
      `*Pedido de preço — site ${CONFIG.empresa}*`,
      '',
      `*O que faz:* ${data.perfil}`,
      `*Quer:* ${data.bitolas.join(', ')}`,
      g('#wMetros') ? `*Metros:* ${g('#wMetros')}` : null,
      `*Prazo:* ${data.prazo}`,
      '',
      `*Nome:* ${g('#wNome')}`,
      g('#wEmpresa') ? `*Empresa:* ${g('#wEmpresa')}` : null,
      `*WhatsApp:* ${g('#wFone')}`,
      g('#wEmail')  ? `*E-mail:* ${g('#wEmail')}`   : null,
      g('#wCidade') ? `*Cidade:* ${g('#wCidade')}`  : null,
      g('#wMsg')    ? `\n*Sobre a obra:*\n${g('#wMsg')}` : null,
    ].filter(Boolean);
    return linhas.join('\n');
  };

  const enviar = (canal) => {
    const msg = montaMensagem();
    if (canal === 'email') {
      const assunto = `Pedido de preço de cabo solar — ${$('#wNome').value.trim()}`;
      window.location.href =
        `mailto:${CONFIG.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(msg.replace(/\*/g, ''))}`;
      return;
    }
    const url = waLink(msg);
    $('#wizRetry').href = url;
    window.open(url, '_blank', 'noopener');
    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!valida(3)) return;
    enviar('whatsapp');
  });

  $('#wizMail').addEventListener('click', (e) => {
    e.preventDefault();
    if (!valida(3)) return;
    enviar('email');
  });

  go(1, false); // estado inicial não deve rolar a página
})();
