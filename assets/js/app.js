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

let calcState = null;

(function calculadora() {
  const form = $('#calcForm');
  if (!form) return;

  const inPot = $('#inPot'), inDist = $('#inDist'), inStr = $('#inStr');
  const inTensao = $('#inTensao'), inCorr = $('#inCorr');
  const gaugeEl = $('#resGauge'), gaugeWrap = $('.calc__gauge');

  const paintRange = (el) => {
    const p = ((el.value - el.min) / (el.max - el.min)) * 100;
    el.style.setProperty('--p', `${p}%`);
  };

  const quedaPct = (secao, dist, corrente, tensao) =>
    ((2 * CALC.rho * dist * corrente) / secao) / tensao * 100;

  const compute = () => {
    const pot     = +inPot.value;
    const dist    = +inDist.value;
    const strings = +inStr.value;
    const tensao  = +inTensao.value;
    const corr    = +inCorr.value;

    const secoes = [4, 6, 10, 16];
    const linhas = secoes.map(s => ({
      secao: s,
      queda: quedaPct(s, dist, corr, tensao),
      amp: GAUGES[s].amp,
      ampOk: GAUGES[s].amp >= corr * 1.25, // fator de segurança usual do lado CC
    }));

    // escolhe a menor bitola que atende ampacidade e meta de queda
    let pick = linhas.find(l => l.ampOk && l.queda <= CALC.metaQueda);
    let motivo = 'É o cabo mais fino que dá conta da sua obra sem desperdiçar energia.';
    if (!pick) {
      pick = linhas.find(l => l.ampOk && l.queda <= CALC.limiteQueda);
      motivo = 'Nessa distância nenhum cabo fica perfeito. Esse é o melhor. Se der, tente deixar o inversor mais perto.';
    }
    if (!pick) {
      pick = linhas[linhas.length - 1];
      motivo = 'A distância é grande demais desse jeito. Fala com a gente: talvez valha mudar o inversor de lugar.';
    }

    const metros = Math.ceil((dist * 2 * strings * CALC.folga) / 10) * 10;

    // perda anual se descer uma bitola
    const idx = secoes.indexOf(pick.secao);
    const menor = idx > 0 ? linhas[idx - 1] : null;
    const deltaQueda = menor ? Math.max(menor.queda - pick.queda, 0) : 0;
    const perdaKwh = pot * CALC.hsp * 365 * (deltaQueda / 100);
    const perdaRs  = perdaKwh * CALC.tarifa;

    return { pot, dist, strings, tensao, corr, linhas, pick, motivo, metros, menor, perdaKwh, perdaRs };
  };

  const render = () => {
    const r = compute();
    calcState = r;

    $('#outPot').textContent  = `${r.pot} kWp`;
    $('#outDist').textContent = `${r.dist} m`;
    $('#outStr').textContent  = r.strings;

    if (gaugeEl.textContent !== String(r.pick.secao)) {
      gaugeEl.textContent = r.pick.secao;
      gaugeWrap.classList.remove('is-flip');
      void gaugeWrap.offsetWidth;
      gaugeWrap.classList.add('is-flip');
    }
    $('#resWhy').textContent = r.motivo;

    // queda
    $('#resDrop').textContent = `${nf(r.pick.queda, 2)}%`.replace('.', ',');
    const meter = $('#resMeter');
    const w = Math.min((r.pick.queda / CALC.limiteQueda) * 100, 100);
    meter.style.width = `${w}%`;
    meter.classList.remove('is-warn', 'is-bad');
    let hint = 'Tudo certo: perde bem pouco';
    if (r.pick.queda > CALC.metaQueda)  { meter.classList.add('is-warn'); hint = 'Dá pra usar, mas vale tentar encurtar o caminho'; }
    if (r.pick.queda > CALC.limiteQueda){ meter.classList.remove('is-warn'); meter.classList.add('is-bad'); hint = 'Perde demais. Revise a obra antes de comprar'; }
    $('#resDropHint').textContent = hint;

    // metragem
    $('#resMeters').textContent = `${nf(r.metros)} m`;

    // perda
    const box = $('#resLossBox');
    if (r.menor) {
      box.hidden = false;
      $('#resLoss').textContent = `~ ${nf(Math.round(r.perdaKwh))} kWh/ano`;
      $('#resLossMoney').textContent =
        `uns R$ ${nf(Math.round(r.perdaRs))} por ano indo embora se usar ${r.menor.secao} mm² no lugar do ${r.pick.secao} mm²`;
      $('#resLossBox .metric__k').textContent = `Se usar o de ${r.menor.secao} mm²`;
    } else {
      box.hidden = true;
    }

    // tabela
    $('#resTable').innerHTML = r.linhas.map(l => {
      let tag = '<span class="tag tag--ok">Pode usar</span>';
      if (!l.ampOk)                        tag = '<span class="tag tag--no">Fino demais</span>';
      else if (l.queda > CALC.limiteQueda) tag = '<span class="tag tag--no">Perde muito</span>';
      else if (l.queda > CALC.metaQueda)   tag = '<span class="tag tag--mid">Dá pra usar</span>';
      // .tag é renderizado como texto com marcador (ver styles.css), não como cápsula
      return `<tr class="${l.secao === r.pick.secao ? 'is-pick' : ''}">
        <td>${l.secao} mm²</td>
        <td>${nf(l.queda, 2).replace('.', ',')}%</td>
        <td>${l.amp} A</td>
        <td>${tag}</td></tr>`;
    }).join('');
  };

  [inPot, inDist, inStr].forEach(el => {
    paintRange(el);
    el.addEventListener('input', () => { paintRange(el); render(); });
  });
  [inTensao, inCorr].forEach(el => el.addEventListener('change', render));

  // CTA da calculadora → leva os números para o formulário
  $('#calcCta')?.addEventListener('click', () => {
    if (!calcState) return;
    const r = calcState;
    const txt =
`Usei a calculadora do site:
• Sistema de ${r.pot} kWp, com ${r.strings} fileira(s) de placas
• O inversor fica a ${r.dist} m das placas
• Placas: ~${r.tensao} V / ${r.corr} A
• Cabo indicado: ${r.pick.secao} mm² (perde ${nf(r.pick.queda, 2).replace('.', ',')}%)
• Metros estimados: ${nf(r.metros)} m`;
    const msg = $('#wMsg');
    if (msg) { msg.value = txt; }
    // pré-marca a bitola no passo 2
    $$('[data-choice=bitolas] .chip-btn').forEach(c =>
      c.classList.toggle('is-on', c.dataset.value === `${r.pick.secao} mm²`));
    const met = $('#wMetros');
    if (met && !met.value) met.value = `${nf(r.metros)} m`;
  });

  render();
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
