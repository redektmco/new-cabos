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
   5. CALCULADORA DE BITOLA
   ---------------------------------------------------------
   Queda de tensão CC:  ΔV = 2 · ρ · L · I / S
   ρ (cobre, temperatura de operação) = 0,0178 Ω·mm²/m
   Estimativa de pré-venda. O projeto elétrico manda.
   ========================================================= */
const CALC = {
  rho: 0.0178,        // Ω·mm²/m
  metaQueda: 1.0,     // % — meta de projeto no lado CC
  limiteQueda: 3.0,   // % — acima disso, reprovado
  hsp: 4.5,           // h/dia de sol pleno (média Brasil)
  tarifa: 0.85,       // R$/kWh
  folga: 1.10,        // 10% de folga na metragem
};

(function calculadora() {
  const wrap = $('#calcLines');
  if (!wrap) return;

  const bitolas = [4, 6, 10, 16];
  const cores = ['Preto', 'Vermelho', 'Verde'];
  const opts = (arr, fmt) => arr.map(v => `<option value="${v}">${fmt(v)}</option>`).join('');

  const addLine = () => {
    const n = wrap.children.length + 1;
    const row = document.createElement('div');
    row.className = 'calc__line';
    row.innerHTML = `
      <p class="calc__lineTitle">Produto ${n}</p>
      <div class="field--row calc__lineRow">
        <div><label>Bitola</label><select data-f="bitola">${opts(bitolas, v => v + ' mm²')}</select></div>
        <div><label>Metragem</label><input type="number" data-f="metros" min="1" step="1" inputmode="numeric" placeholder="Ex.: 500"></div>
        <div><label>Cor</label><select data-f="cor">${opts(cores, v => v)}</select></div>
      </div>`;
    wrap.appendChild(row);
  };
  addLine();
  $('#calcAdd')?.addEventListener('click', addLine);

  // CTA → leva os dados para o formulário
  $('#calcCta')?.addEventListener('click', () => {
    const itens = [...wrap.children].map(r => ({
      bitola: $('[data-f=bitola]', r).value,
      metros: +$('[data-f=metros]', r).value,
      cor: $('[data-f=cor]', r).value,
    }));
    const txt = 'Pedido pelo site:\n' + itens.map(i =>
      `• ${i.bitola} mm² · ${i.metros ? nf(i.metros) + ' m' : 'metragem a definir'} · ${i.cor}`).join('\n');
    const msg = $('#wMsg');
    if (msg) msg.value = txt;
    const sel = new Set(itens.map(i => `${i.bitola} mm²`));
    $$('[data-choice=bitolas] .chip-btn').forEach(c => c.classList.toggle('is-on', sel.has(c.dataset.value)));
    const total = itens.reduce((a, i) => a + i.metros, 0);
    const met = $('#wMetros');
    if (met && total) met.value = `${nf(total)} m`;
  });
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
