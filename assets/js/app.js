/* =========================================================
   NEW CABOS — Landing Page
   Vanilla JS, sem dependências.
   ---------------------------------------------------------
   ⚠️  AJUSTE AQUI ANTES DE PUBLICAR: telefone, WhatsApp e e-mail.
   Os valores abaixo são PLACEHOLDERS — troque pelos reais.
   ========================================================= */
const CONFIG = {
  // Somente dígitos, com DDI 55. Ex.: '5515996040000'
  whatsapp: '5515000000000',
  // Formato E.164 para o link tel:
  telefone: '+551530000000',
  telefoneLabel: '(15) 3000-0000',
  email: 'comercial@newcabos.com.br',
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
        uso: 'Ramais de string em sistemas residenciais e pequenos comerciais, com distâncias curtas até o inversor.',
        badge: 'Mais usada em residencial' },
  6:  { amp: 70,  diam: '6,4 mm', peso: '85 g/m',  strands: 84,  viz: 120,
        uso: 'A bitola padrão do mercado fotovoltaico brasileiro. Cobre a maior parte das strings residenciais e comerciais.',
        badge: 'Campeã de vendas' },
  10: { amp: 98,  diam: '8,0 mm', peso: '138 g/m', strands: 80,  viz: 142,
        uso: 'Distâncias longas, troncos de string e sistemas comerciais onde a queda de tensão começa a pesar.',
        badge: 'Para distâncias longas' },
  16: { amp: 132, diam: '9,6 mm', peso: '210 g/m', strands: 126, viz: 164,
        uso: 'Troncos de usina, corredores de string combiner e projetos industriais de maior corrente.',
        badge: 'Usina e industrial' },
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
    fab:     `Olá! Vim pela página da ${CONFIG.empresa} e quero falar sobre cabo solar.`,
    direto:  `Olá! Quero um orçamento de cabo solar da ${CONFIG.empresa}.`,
    footer:  `Olá! Vim pelo site da ${CONFIG.empresa} e gostaria de informações sobre cabo solar.`,
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
    label.textContent = `${g} mm² · 1500 V`;
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
    title: 'Condutor de cobre eletrolítico',
    sub: 'O caminho da energia',
    text: 'Fios finos de cobre eletrolítico encordoados. Quanto mais fios e mais finos, mais flexível é o cabo — e menos ele briga com você na hora de passar pela calha, contornar a estrutura e chegar no conector.',
    specs: ['Cobre eletrolítico de primeira linha', 'Construção flexível, pensada para telhado', 'Seções de 4, 6, 10 e 16 mm²'],
    risk: 'Condutor rígido ou com seção real abaixo da nominal aquece mais, cai de tensão mais e trinca nos pontos de dobra.',
  },
  tin: {
    title: 'Estanhagem dos fios',
    sub: 'O detalhe que ninguém vê e todo mundo sente',
    text: 'Cada fio de cobre recebe uma camada de estanho. É uma proteção contra oxidação — e ela importa principalmente onde o cabo é cortado e crimpado no conector, que é justamente o ponto mais vulnerável de toda a string.',
    specs: ['Protege o cobre da oxidação ao longo dos anos', 'Mantém a resistência de contato estável na crimpagem', 'Reduz o risco de ponto quente no conector'],
    risk: 'Cobre nu oxida na ponta. A resistência sobe, o conector aquece, o inversor acusa falha de isolação — e o chamado é seu.',
  },
  insulation: {
    title: 'Primeira camada de isolação',
    sub: 'A barreira dielétrica',
    text: 'Composto termofixo extrudado diretamente sobre o condutor. Termofixo, diferente do termoplástico comum, não amolece quando a temperatura sobe — e a temperatura sobe muito num telhado de telha metálica ao meio-dia.',
    specs: ['Composto termofixo, estável sob temperatura', 'Rigidez dielétrica para tensão nominal de 1500 V CC', 'Livre de halogênio, retardante à chama e baixa emissão de fumaça'],
    risk: 'Isolação de PVC comum amolece no calor, deforma sob pressão da abraçadeira e reduz a distância de isolação entre condutor e estrutura.',
  },
  jacket: {
    title: 'Capa externa + marcação metro a metro',
    sub: 'A pele que enfrenta 20 verões',
    text: 'A segunda camada é a que leva sol, chuva, poeira e dilatação térmica todos os dias. Nela vai impressa a identificação do cabo e a metragem sequencial — o número que permite você conferir na chegada e controlar o consumo de cabo na obra.',
    specs: ['Resistente à radiação UV e a intempéries', 'Marcação sequencial impressa metro a metro', 'Cores preto e vermelho para identificação de polaridade'],
    risk: 'Sem proteção UV adequada a capa resseca e trinca em poucos anos. Sem marcação, você nunca sabe se o rolo de 100 m tinha mesmo 100 m.',
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
    bad:  { lvl: 'ok', label: 'Em ordem', health: 96,
            txt: 'Recém-instalado, ninguém vê diferença. É exatamente por isso que a escolha do cabo parece não importar no dia da compra.',
            cost: 'Custo até aqui: zero — e a sensação de ter economizado.' },
    good: { lvl: 'ok', label: 'Em ordem', health: 100,
            txt: 'Recém-instalado. A metragem bateu com a nota na conferência do rolo, e a equipe fechou a obra sem sobra perdida.',
            cost: 'Custo até aqui: zero — com metragem conferida.' },
  },
  3: {
    bad:  { lvl: 'warn', label: 'Atenção', health: 62,
            txt: 'A capa começa a endurecer sob radiação UV e ciclos de calor. Nos pontos de dobra e sob abraçadeira aparecem as primeiras microtrincas.',
            cost: 'Primeira visita técnica não faturada.' },
    good: { lvl: 'ok', label: 'Em ordem', health: 97,
            txt: 'Composto termofixo resistente a UV: a capa mantém a flexibilidade e a isolação segue íntegra mesmo nos pontos de maior esforço.',
            cost: 'Nenhum chamado aberto.' },
  },
  7: {
    bad:  { lvl: 'bad', label: 'Falhando', health: 32,
            txt: 'O cobre nu já oxidou nas crimpagens. A resistência de contato subiu, o conector aquece e o inversor passa a acusar falha de isolação em dias de chuva.',
            cost: 'Troca de trechos + mão de obra + cliente insatisfeito.' },
    good: { lvl: 'ok', label: 'Em ordem', health: 93,
            txt: 'A estanhagem preservou o contato nas crimpagens. A string segue entregando a corrente de projeto, sem ponto quente e sem alarme de isolação.',
            cost: 'Nenhum chamado aberto.' },
  },
  15: {
    bad:  { lvl: 'bad', label: 'Comprometido', health: 12,
            txt: 'Capa trincada com condutor exposto em vários trechos. Risco real de arco elétrico e de fuga à estrutura — o sistema precisa ser recabeado antes da metade da vida dos módulos.',
            cost: 'Recabeamento completo: o custo do cabo, de novo, com obra em cima.' },
    good: { lvl: 'ok', label: 'Em operação', health: 88,
            txt: 'O cabo acompanha o ciclo dos módulos. A usina que você entregou continua gerando como no primeiro ano — e o seu nome continua associado a isso.',
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
    let motivo = 'Menor bitola que mantém a queda de tensão abaixo de 1% e atende a corrente da string.';
    if (!pick) {
      pick = linhas.find(l => l.ampOk && l.queda <= CALC.limiteQueda);
      motivo = 'Nenhuma bitola da linha fica abaixo de 1% nessa distância. Esta é a melhor opção — vale avaliar aproximar o inversor ou dividir o trecho.';
    }
    if (!pick) {
      pick = linhas[linhas.length - 1];
      motivo = 'A distância é longa demais para o lado CC nessa configuração. Fale com o time técnico: pode valer repensar o ponto do inversor.';
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
    let hint = 'Dentro da meta de projeto (≤ 1%)';
    if (r.pick.queda > CALC.metaQueda)  { meter.classList.add('is-warn'); hint = 'Acima da meta de 1% — aceitável, mas vale revisar o traçado'; }
    if (r.pick.queda > CALC.limiteQueda){ meter.classList.remove('is-warn'); meter.classList.add('is-bad'); hint = 'Acima de 3% — reveja o projeto antes de comprar'; }
    $('#resDropHint').textContent = hint;

    // metragem
    $('#resMeters').textContent = `${nf(r.metros)} m`;

    // perda
    const box = $('#resLossBox');
    if (r.menor) {
      box.hidden = false;
      $('#resLoss').textContent = `~ ${nf(Math.round(r.perdaKwh))} kWh/ano`;
      $('#resLossMoney').textContent =
        `cerca de R$ ${nf(Math.round(r.perdaRs))}/ano a mais em perda joule se você usar ${r.menor.secao} mm² em vez de ${r.pick.secao} mm²`;
      $('#resLossBox .metric__k').textContent = `Se você descer para ${r.menor.secao} mm²`;
    } else {
      box.hidden = true;
    }

    // tabela
    $('#resTable').innerHTML = r.linhas.map(l => {
      let tag = '<span class="tag tag--ok">Ideal</span>';
      if (!l.ampOk)                        tag = '<span class="tag tag--no">Corrente baixa</span>';
      else if (l.queda > CALC.limiteQueda) tag = '<span class="tag tag--no">Queda alta</span>';
      else if (l.queda > CALC.metaQueda)   tag = '<span class="tag tag--mid">Aceitável</span>';
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
`Simulei na calculadora do site:
• Sistema: ${r.pot} kWp, ${r.strings} string(s)
• Distância até o inversor: ${r.dist} m
• String: ~${r.tensao} V / ${r.corr} A
• Bitola recomendada: ${r.pick.secao} mm² (queda de ${nf(r.pick.queda, 2).replace('.', ',')}%)
• Cabo estimado: ${nf(r.metros)} m`;
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
          <div class="prod__title">
            <h3>Cabo solar ${g} mm²</h3>
            <span class="prod__badge">${d.badge}</span>
          </div>
          <p class="prod__use">${d.uso}</p>
          <ul class="prod__specs">
            <li><b>Seção nominal</b><span>${g} mm²</span></li>
            <li><b>Tensão nominal</b><span>1500 V CC</span></li>
            <li><b>Corrente máx. (ref.)</b><span>${d.amp} A</span></li>
            <li><b>Ø externo aprox.</b><span>${d.diam}</span></li>
            <li><b>Peso aprox.</b><span>${d.peso}</span></li>
            <li><b>Condutor</b><span>Cobre estanhado</span></li>
          </ul>
        </div>
        <div class="prod__viz">
          <p class="prod__vizTitle">Proporção real entre as bitolas</p>
          <div class="prod__scale">
            ${[4, 6, 10, 16].map(s => `
              <button class="prod__dot ${s == g ? 'is-on' : ''}" data-jump="${s}" aria-label="Ver cabo de ${s} mm²">
                <span class="prod__circle" style="--sz:${GAUGES[s].viz * 0.52}px"><span class="prod__circleIn"></span></span>
                <em>${s}</em>
              </button>`).join('')}
          </div>
          <div class="prod__colors">
            <span class="prod__color"><i class="prod__swatch" style="background:#12161D"></i> Preto</span>
            <span class="prod__color"><i class="prod__swatch" style="background:#C0342B"></i> Vermelho</span>
          </div>
          <p class="prod__vizNote">Valores de referência — confirme na ficha técnica do produto.</p>
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
    h: 'Você entrega a obra. Você atende a garantia.',
    lead: 'O cabo que você passa hoje volta como chamado daqui a três anos — ou não volta nunca. A diferença está em quem fabricou.',
    pts: [
      ['Metragem que fecha', 'Marcação metro a metro na capa: você confere o rolo antes de subir no telhado e controla o consumo por obra.'],
      ['Menos retorno de garantia', 'Composto termofixo resistente a UV e condutor estanhado — feito para durar o ciclo dos módulos, não o da nota fiscal.'],
      ['Apoio no dimensionamento', 'Manda a distância e a string; a gente confere a bitola com você antes de fechar o pedido.'],
    ],
  },
  engenharia: {
    h: 'Especificação que sobrevive à compra.',
    lead: 'De nada adianta o memorial pedir cabo solar certificado se o que chega na obra é outra coisa. Comprando de fábrica, a rastreabilidade não se perde no caminho.',
    pts: [
      ['Processos conforme ISO 9001', 'Controle estruturado em todas as etapas, do recebimento do cobre à expedição do rolo.'],
      ['Linha completa', '4, 6, 10 e 16 mm² — do ramal de string ao tronco de usina, com a mesma régua de qualidade.'],
      ['Interlocução técnica direta', 'Dúvida de aplicação fala com quem fabrica, sem passar por três camadas de revenda.'],
    ],
  },
  distribuidor: {
    h: 'Giro alto, ruído baixo.',
    lead: 'Cabo solar é item de recompra. O que trava o giro não é o preço — é o cabo que gera reclamação e some da sua prateleira por má fama.',
    pts: [
      ['Fabricante nacional', 'Sem janela de importação, sem câmbio no meio do caminho, sem esperar contêiner para repor estoque.'],
      ['Linha que cobre o balcão', 'As quatro bitolas mais pedidas, em preto e vermelho, atendendo do residencial ao industrial.'],
      ['Condição para recorrência', 'Quem compra todo mês compra diferente de quem compra uma vez. Fale com o comercial sobre volume.'],
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
          <div class="who__cta"><a class="btn btn--primary" href="#orcamento">Falar com o comercial</a></div>
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

  const titles = ['Quem é você', 'O que você precisa', 'Seus dados'];
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
      `*Orçamento de cabo solar — site ${CONFIG.empresa}*`,
      '',
      `*Perfil:* ${data.perfil}`,
      `*Bitolas:* ${data.bitolas.join(', ')}`,
      g('#wMetros') ? `*Metragem:* ${g('#wMetros')}` : null,
      `*Prazo:* ${data.prazo}`,
      '',
      `*Nome:* ${g('#wNome')}`,
      g('#wEmpresa') ? `*Empresa:* ${g('#wEmpresa')}` : null,
      `*WhatsApp:* ${g('#wFone')}`,
      g('#wEmail')  ? `*E-mail:* ${g('#wEmail')}`   : null,
      g('#wCidade') ? `*Cidade:* ${g('#wCidade')}`  : null,
      g('#wMsg')    ? `\n*Projeto:*\n${g('#wMsg')}` : null,
    ].filter(Boolean);
    return linhas.join('\n');
  };

  const enviar = (canal) => {
    const msg = montaMensagem();
    if (canal === 'email') {
      const assunto = `Orçamento de cabo solar — ${$('#wNome').value.trim()}`;
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
