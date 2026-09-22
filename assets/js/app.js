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
   5. ANATOMIA INTERATIVA DO CABO
   ========================================================= */
const LAYERS = {
  conductor: {
    title: 'O fio de cobre',
    sub: 'Por onde a energia passa',
    text: 'Lá no meio ficam vários fios finos de cobre, trançados juntos. Quanto mais fios e mais fininhos, mais o cabo dobra fácil — e menos ele briga com você na hora de passar pela calha e chegar no conector.',
    specs: ['Cobre de boa qualidade', 'Bem flexível, feito pra trabalhar em telhado', 'Vem em 4, 6, 10 e 16 mm²'],
    risk: 'Cabo duro é um sofrimento de instalar e racha nas dobras. E se o cobre for menos do que deveria, ele esquenta.',
  },
  tin: {
    title: 'O banho de estanho',
    sub: 'O detalhe que ninguém vê',
    text: 'Cada fio de cobre recebe uma camada fininha de estanho por cima. Isso protege o cobre de escurecer com o tempo — principalmente na ponta, onde você aperta o conector, que é o lugar que mais sofre.',
    specs: ['Protege o cobre de escurecer', 'Mantém a ligação firme no conector', 'Evita que o conector esquente'],
    risk: 'Cobre sem proteção escurece na ponta. O conector esquenta, o inversor acusa erro — e o chamado cai pra você.',
  },
  insulation: {
    title: 'A camada de dentro',
    sub: 'Segura a energia no lugar',
    text: 'É a primeira capa, aplicada direto em cima do cobre. Ela é feita de um material que não amolece quando esquenta — e telhado de metal ao meio-dia esquenta muito.',
    specs: ['Não amolece no calor', 'Feita pra 1500 V, a tensão da energia solar', 'Solta pouca fumaça e não espalha fogo'],
    risk: 'Capa comum amolece no calor e se deforma embaixo da abraçadeira. Aí a proteção fica mais fina do que deveria.',
  },
  jacket: {
    title: 'A capa de fora',
    sub: 'A que enfrenta 25 verões',
    text: 'É a parte que toma sol, chuva e poeira todo dia. Nela também vem escrito o nome do cabo e o número do metro — que é o que deixa você conferir o rolo assim que ele chega na obra.',
    specs: ['Feita pra tomar sol sem rachar', 'Tem o número do metro escrito nela', 'Vem em preto, vermelho e verde'],
    risk: 'Capa fraca resseca e racha em poucos anos. E sem número escrito, você nunca sabe se o rolo de 100 m tinha mesmo 100 m.',
  },
};


(function anatomia() {
  const body = $('#anaBody'), svg = $('.anatomy__svg');
  if (!body) return;

  // preenche os fios do condutor
  const strandsG = $('#strands');
  if (strandsG) {
    let out = '';
    const rings = [[0, 1], [24, 6], [46, 12]];
    rings.forEach(([r, count]) => {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + (r ? 0.3 : 0);
        out += `<circle cx="${(180 + Math.cos(a) * r).toFixed(1)}" cy="${(180 + Math.sin(a) * r).toFixed(1)}" r="10.5"/>`;
      }
    });
    strandsG.innerHTML = out;
  }

  const render = (key) => {
    const d = LAYERS[key];
    body.innerHTML = `
      <div class="ana-fade">
        <h3>${d.title}</h3>
        <p class="ana-sub">${d.sub}</p>
        <p>${d.text}</p>
        <ul class="ana-specs">
          ${d.specs.map(s => `<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${s}</span></li>`).join('')}
        </ul>
        <div class="ana-risk">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5L1.8 20.5h20.4L12 3.5z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M12 10v4.2M12 17.2v.6" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>
          <span><b>Quando o fabricante economiza aqui</b>${d.risk}</span>
        </div>
      </div>`;
  };

  const select = (key) => {
    $$('.ana-tab').forEach(t => {
      const on = t.dataset.layer === key;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    svg.classList.add('has-sel');
    $$('.ana-layer', svg).forEach(l => l.classList.toggle('is-sel', l.dataset.layer === key));
    $$('.ana-dot', svg).forEach(l => l.classList.toggle('is-sel', l.dataset.layer === key));
    render(key);
  };

  $$('.ana-tab').forEach(t => t.addEventListener('click', () => select(t.dataset.layer)));
  $$('[data-layer]', svg).forEach(el => el.addEventListener('click', () => select(el.dataset.layer)));
  select('conductor');
})();

/* =========================================================
   6. COMPARADOR — linha do tempo de envelhecimento
   ========================================================= */
const TIMELINE = {
  1: {
    bad:  { lvl: 'ok', label: 'Tudo bem', health: 96,
            txt: 'Acabou de ser instalado. Ninguém vê diferença nenhuma. É por isso que, na hora de comprar, parece que o cabo não importa.',
            cost: 'Até aqui não custou nada — e ainda deu a sensação de ter economizado.' },
    good: { lvl: 'ok', label: 'Tudo bem', health: 100,
            txt: 'Acabou de ser instalado. A metragem bateu com a nota na hora de conferir o rolo, e a equipe terminou sem sobra perdida.',
            cost: 'Até aqui não custou nada — e a metragem fechou certinho.' },
  },
  3: {
    bad:  { lvl: 'warn', label: 'Começando a dar problema', health: 62,
            txt: 'O sol já endureceu a capa. Onde o cabo dobra e onde a abraçadeira aperta, começam a aparecer as primeiras rachaduras.',
            cost: 'Primeira visita na obra que você não vai conseguir cobrar.' },
    good: { lvl: 'ok', label: 'Tudo bem', health: 97,
            txt: 'A capa continua macia e inteira, mesmo nos lugares que mais sofrem. Ela foi feita pra tomar esse sol todo.',
            cost: 'Nenhuma ligação do cliente até agora.' },
  },
  7: {
    bad:  { lvl: 'bad', label: 'Falhando', health: 32,
            txt: 'O cobre já escureceu dentro dos conectores. Aquele ponto esquenta e, em dia de chuva, o inversor começa a desligar sozinho.',
            cost: 'Trocar pedaços do cabo + mão de obra + cliente bravo.' },
    good: { lvl: 'ok', label: 'Tudo bem', health: 93,
            txt: 'O banho de estanho segurou o cobre firme dentro dos conectores. Nada esquenta, nada desliga, e as placas continuam entregando o que devem.',
            cost: 'Nenhuma ligação do cliente até agora.' },
  },
  15: {
    bad:  { lvl: 'bad', label: 'Precisa trocar tudo', health: 12,
            txt: 'Capa rachada e fio aparecendo em vários pontos. É risco de choque e de fogo. Vai ter que trocar o cabo inteiro antes das placas chegarem na metade da vida.',
            cost: 'Comprar o cabo de novo — agora com obra em cima.' },
    good: { lvl: 'ok', label: 'Ainda trabalhando', health: 88,
            txt: 'O cabo acompanhou a vida das placas. A usina que você entregou continua gerando como no primeiro ano — e seu nome continua colado nisso.',
            cost: 'Custo total: o do cabo. Uma vez só.' },
  },
};


(function comparador() {
  const track = $('.timeline__track');
  if (!track) return;
  const steps = $$('.timeline__step');
  const anos = [1, 3, 7, 15];

  const meterClass = (lvl) => lvl === 'bad' ? 'is-bad' : lvl === 'warn' ? 'is-warn' : '';

  const paint = (side, d) => {
    $(`#${side}Status`).textContent = d.label;
    $(`#${side}Status`).dataset.lvl = d.lvl;
    const h = $(`#${side}Health`);
    h.style.width = `${d.health}%`;
    h.className = meterClass(d.lvl);
    const st = $(`#${side}State`);
    st.textContent = d.txt;
    st.classList.remove('ana-fade'); void st.offsetWidth; st.classList.add('ana-fade');
    $(`#${side}Cost`).textContent = d.cost;
  };

  const set = (ano) => {
    const d = TIMELINE[ano];
    const idx = anos.indexOf(+ano);
    steps.forEach((s, i) => {
      s.classList.toggle('is-active', i === idx);
      s.classList.toggle('is-past', i < idx);
    });
    // a trilha vai do centro do 1º ao centro do último ponto (75% da largura)
    $('#tlFill').style.width = `${(idx / (anos.length - 1)) * 75}%`;
    paint('bad', d.bad);
    paint('good', d.good);
  };

  let auto = null;
  const pararAuto = () => { if (auto) { clearInterval(auto); auto = null; } };

  steps.forEach(s => s.addEventListener('click', () => { pararAuto(); set(s.dataset.year); }));
  set(1);

  // demonstra sozinho uma vez ao entrar na tela — e para assim que o usuário assume
  const io = new IntersectionObserver((en) => {
    if (!en[0].isIntersecting) return;
    io.disconnect();
    if (reduceMotion) return;
    let i = 0;
    auto = setInterval(() => {
      i++;
      if (i >= anos.length) { pararAuto(); return; }
      set(anos[i]);
    }, 1600);
  }, { threshold: 0.4 });
  io.observe($('.versus'));
})();

/* =========================================================
   7. CALCULADORA DE BITOLA
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
   8. PRODUTOS (tabs de bitola)
   ========================================================= */
(function produtos() {
  const panel = $('#prodPanel');
  if (!panel) return;

  const render = (g) => {
    const d = GAUGES[g];
    panel.innerHTML = `
      <div class="prod__grid ana-fade">
        <div>
          <h3 class="prod__h">Cabo solar ${g} mm²</h3>
          <p class="prod__badge">${d.badge}</p>
          <p class="prod__use">${d.uso}</p>
          <ul class="prod__specs">
            <li><b>Grossura</b><span>${g} mm²</span></li>
            <li><b>Feito para</b><span>1500 V</span></li>
            <li><b>Aguenta até</b><span>${d.amp} A</span></li>
            <li><b>Grossura por fora</b><span>${d.diam}</span></li>
            <li><b>Peso</b><span>${d.peso}</span></li>
            <li><b>Por dentro</b><span>Cobre com estanho</span></li>
          </ul>
        </div>
        <div class="prod__viz">
          <p class="prod__vizTitle">Tamanho de um comparado ao outro</p>
          <div class="prod__scale">
            ${[4, 6, 10, 16].map(s => `
              <button class="prod__dot ${s == g ? 'is-on' : ''}" data-jump="${s}" aria-label="Ver o cabo de ${s} mm²">
                <span class="prod__circle" style="--sz:${GAUGES[s].viz * 0.52}px"><span class="prod__circleIn"></span></span>
                <em>${s}</em>
              </button>`).join('')}
          </div>
          <div class="prod__colors">
            <span class="prod__color"><i class="prod__swatch" style="background:#12161D"></i> Preto</span>
            <span class="prod__color"><i class="prod__swatch" style="background:#C0342B"></i> Vermelho</span>
            <span class="prod__color"><i class="prod__swatch" style="background:#2E9E4A"></i> Verde</span>
          </div>
          <p class="prod__vizNote">Números de referência. Peça a ficha técnica pra confirmar.</p>
        </div>
      </div>`;
  };

  const seleciona = (g) => {
    $$('.prod__tab').forEach(x => {
      const on = x.dataset.prod === String(g);
      x.classList.toggle('is-active', on);
      x.setAttribute('aria-selected', String(on));
    });
    render(g);
  };

  $$('.prod__tab').forEach(t => t.addEventListener('click', () => seleciona(t.dataset.prod)));
  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-jump]');
    if (btn) seleciona(btn.dataset.jump);
  });
  seleciona('4');
})();

/* =========================================================
   9. PARA QUEM (tabs de perfil)
   ========================================================= */
const WHO = {
  integrador: {
    h: 'Quem entrega a obra é você. Quem volta nela também.',
    lead: 'O cabo que você passa hoje pode virar uma ligação chata daqui a três anos — ou nunca mais dar notícia. Isso depende de quem fabricou.',
    pts: [
      ['A metragem fecha', 'O número do metro vem escrito no cabo. Você confere o rolo antes de subir no telhado e sabe quanto gastou em cada obra.'],
      ['Menos obra de graça', 'Capa que aguenta sol e cobre com banho de estanho. Feito pra durar o tempo das placas, não o tempo da nota fiscal.'],
      ['A gente ajuda a escolher', 'Manda a distância e quantas placas. A gente confere a grossura junto com você antes de fechar o pedido.'],
    ],
  },
  engenharia: {
    h: 'O que você escreve no projeto é o que precisa chegar na obra.',
    lead: 'Não adianta o projeto pedir cabo bom se o que compram é outra coisa. Comprando direto da fábrica, dá pra saber exatamente o que foi feito.',
    pts: [
      ['Cabo com laudo', 'Nossos cabos são testados e têm laudo. Isso é o que evita susto na hora da vistoria da concessionária.'],
      ['Linha completa', 'De 4 a 16 mm², mais os conectores MC4. Da fileira de placas até a usina inteira, tudo do mesmo lugar.'],
      ['Fala direto com a fábrica', 'Dúvida técnica você tira com quem faz o cabo, sem passar por três balcões antes.'],
    ],
  },
  distribuidor: {
    h: 'Cabo é item de recompra. Se der problema, some da prateleira.',
    lead: 'O que trava a venda não é o preço — é o cabo que gera reclamação e queima o nome da sua loja.',
    pts: [
      ['Fábrica aqui no Brasil', 'Sem esperar navio, sem dólar no meio do caminho. Precisou repor, a gente produz.'],
      ['Seu nome no cabo', 'A gente grava a marca da sua loja direto na bobina. Margem melhor e sua marca aparecendo em toda obra.'],
      ['Preço de quem compra sempre', 'Quem compra todo mês compra diferente de quem compra uma vez. Fale com a gente sobre volume.'],
    ],
  },
};


(function paraQuem() {
  const panel = $('#whoPanel');
  if (!panel) return;

  const render = (k) => {
    const d = WHO[k];
    panel.innerHTML = `
      <div class="who__grid ana-fade">
        <div>
          <h3>${d.h}</h3>
          <p class="who__lead">${d.lead}</p>
          <div class="who__cta"><a class="btn btn--primary" href="#orcamento">Pedir um preço</a></div>
        </div>
        <ul class="who__points">
          ${d.pts.map(([b, p]) => `<li>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span><b>${b}</b>${p}</span></li>`).join('')}
        </ul>
      </div>`;
  };

  $$('.who__tab').forEach(t => t.addEventListener('click', () => {
    $$('.who__tab').forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
    t.classList.add('is-active');
    t.setAttribute('aria-selected', 'true');
    render(t.dataset.who);
  }));
  render('integrador');
})();

/* =========================================================
   10. PROCESSO — destaca a etapa conforme o scroll
   ========================================================= */
(function processo() {
  const steps = $$('#steps .step');
  if (!steps.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => e.target.classList.toggle('is-active', e.isIntersecting));
  }, { threshold: 0.65 });
  steps.forEach(s => io.observe(s));
})();

/* =========================================================
   11. FORMULÁRIO EM 3 PASSOS
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

/* =========================================================
   12. FAQ — abre um de cada vez
   ========================================================= */
$$('#faq-list .faq__item').forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    $$('#faq-list .faq__item').forEach(o => { if (o !== item) o.open = false; });
  });
});

/* =========================================================
   13. SLOTS DE IMAGEM
   Se a foto ainda não foi colocada em assets/img/, o <img>
   é removido e a arte vetorial de base assume o lugar.
   ========================================================= */
(function shots() {
  const ok = (img) => img.closest('.shot')?.classList.add('com-foto');
  const falhou = (img) => { img.remove(); };
  $$('.shot img').forEach(img => {
    img.addEventListener('load',  () => { if (img.naturalWidth > 0) ok(img); }, { once: true });
    img.addEventListener('error', () => falhou(img), { once: true });
    if (img.complete) { img.naturalWidth > 0 ? ok(img) : falhou(img); }
  });
})();
