/* 游戏主循环：每个节点挂一个小游戏，判定结果驱动她的情绪、手感与成品。 */

const Game = (() => {
  const S = {
    dish: null,
    nodeIndex: 0,
    elapsed: 0,
    heat: 1,
    burn: 0,
    skill: 80,
    paused: false,
    phase: 'idle', // idle | playing | resolving | done
    perfect: 0,
    good: 0,
    miss: 0,
    scoreSum: 0,
    round: 1,
    warnedBurn: false,
    idleTalk: 0,
    lastTouch: 0
  };

  let op = null;
  let lastTs = 0;
  let nodeTimer = null;
  let selectedId = null;

  function init() {
    UI.init();
    UI.setHeat(S.heat);
    UI.setBurn(0);
    UI.setSkill(S.skill);
    UI.setTimer(0);
    UI.setAuto('等待开始', false);
    UI.renderRecipes(DISHES, null, selectDish);
    UI.el.recipeList.addEventListener('click', (e) => {
      const item = e.target.closest('.ritem');
      if (item && item.dataset.id) selectDish(item.dataset.id);
    });
    selectDish(DISHES[0].id);
    UI.showDrawer(true);

    const bind = (node, ev, fn) => { if (node) node.addEventListener(ev, fn); else console.warn('[bind] 缺少元素', ev); };
    bind(UI.el.startBtn, 'click', start);
    bind(UI.el.drawerClose, 'click', () => { if (S.phase !== 'idle') { UI.showDrawer(false); SFX.event('close'); } });
    bind(UI.el.bookBtn, 'click', () => { UI.showDrawer(true); SFX.event('drawer'); });
    bind(UI.el.pauseBtn, 'click', togglePause);
    bind(UI.el.stopBtn, 'click', togglePause);
    if (UI.el.heatPanel) UI.el.heatPanel.querySelectorAll('.lv').forEach((btn) => {
      btn.addEventListener('click', () => setHeat(Number(btn.dataset.heat)));
    });
    bind(UI.el.board, 'pointerdown', () => { S.lastTouch = performance.now(); });
    bind(UI.el.cmdInput, 'keydown', (e) => {
      if (e.key === 'Enter') {
        const text = e.target.value.trim();
        if (text) say(text);
        e.target.value = '';
      }
    });
    bind(UI.el.stAgain, 'click', restart);
    bind(UI.el.stOther, 'click', () => {
      UI.hideSettlement();
      UI.showDrawer(true);
      UI.renderRecipes(DISHES, null, selectDish);
    });
    bind(UI.el.fallback, 'click', () => {
      Live2D.setExpression('proud');
      UI.setExpressionLabel('proud');
      UI.setBubble('怎么啦？我手上还有东西呢。');
      SFX.event('tap');
    });

    // 音效开关
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const on = SFX.toggle();
        document.getElementById('muteWave').style.display = on ? '' : 'none';
        document.getElementById('muteCross').style.display = on ? 'none' : '';
        muteBtn.title = on ? '音效开关' : '音效已关闭';
      });
    }

    // 所有按钮的通用点击声（捕获阶段，先于业务逻辑）
    document.addEventListener('click', (e) => {
      if (e.target.closest('button')) SFX.event('click', { volume: 0.45 });
    }, true);

    requestAnimationFrame(loop);
  }

  function loop(ts) {
    const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.1) : 0;
    lastTs = ts;
    update(dt);
    requestAnimationFrame(loop);
  }

  function update(dt) {
    if (S.phase !== 'playing' || S.paused) return;
    S.elapsed += dt;
    UI.setTimer(S.elapsed);

    // 手感只在你不碰她的时候下降；大火时掉得更快
    const idle = performance.now() - S.lastTouch > 3000;
    if (idle) {
      const decay = S.heat === 2 ? 1.2 : 0.5;
      S.skill = Math.max(18, S.skill - dt * decay);
      UI.setSkill(S.skill);
    }

    // 大火 + 易糊 → 焦糊
    if (S.heat === 2) {
      S.burn = Math.min(1, S.burn + dt * 0.16);
      UI.setBurn(S.burn);
      if (S.burn >= 1 && !S.warnedBurn) {
        S.warnedBurn = true;
        S.skill = Math.max(18, S.skill - 12);
        UI.setSkill(S.skill);
        UI.shakeBoard();
        setMood('panic');
        UI.setBubble('啊，冒烟了！火是不是太大了？');
        UI.toast('焦糊了 · 她的手感下降');
        SFX.event('burn');
      }
    } else if (S.burn > 0) {
      S.burn = Math.max(0, S.burn - dt * 0.22);
      UI.setBurn(S.burn);
    }

    // 她偶尔自言自语
    S.idleTalk += dt;
    if (S.idleTalk > 24) {
      S.idleTalk = 0;
      if (S.phase === 'playing' && op && !S.paused) {
        UI.setBubble(IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)]);
      }
    }

    if (op) op.update(dt);
  }

  function stepOf() { return S.dish.nodes[S.nodeIndex]; }

  function setMood(key) {
    Live2D.setExpression(key);
    UI.setExpressionLabel(key);
  }

  function selectDish(id) {
    selectedId = id;
    SFX.event('pick', { volume: 0.6 });
    UI.renderRecipes(DISHES, id, selectDish);
  }

  function start() {
    if (!selectedId) return;
    S.dish = DISHES.find((d) => d.id === selectedId);
    S.nodeIndex = 0;
    S.elapsed = 0;
    S.heat = 1;
    S.burn = 0;
    S.skill = 80;
    S.paused = false;
    S.perfect = 0;
    S.good = 0;
    S.miss = 0;
    S.scoreSum = 0;
    S.warnedBurn = false;
    S.idleTalk = 0;
    S.phase = 'playing';
    S.lastTouch = performance.now();

    UI.showDrawer(false);
    UI.setDish(S.dish);
    UI.setHeat(S.heat);
    UI.setBurn(0);
    UI.setSkill(S.skill);
    UI.setTimer(0);
    UI.renderTray(S.dish, ingredientQuip);
    UI.setAuto('她在自己做', false);
    UI.hideSettlement();
    // 调试用：?node=2 可以直接从第 3 个操作开始
    const jump = Number(new URLSearchParams(location.search).get('node'));
    if (Number.isInteger(jump) && jump > 0 && jump < S.dish.nodes.length) S.nodeIndex = jump;
    startNode();
  }

  function startNode() {
    const node = stepOf();
    SFX.event('step', { volume: 0.5 });
    S.burn = 0;
    S.warnedBurn = false;
    S.phase = 'playing';
    S.lastTouch = performance.now();
    UI.setBurn(0);
    UI.setStep(S.nodeIndex, S.dish.nodes.length, node.label);
    UI.setOp(node.label, node.hint);
    UI.setProgress(0, '');
    UI.setDoing(node.doing);
    UI.setBubble(node.her);
    UI.setAuto('她在自己做', false);
    setMood(S.nodeIndex === 0 ? 'calm' : 'focus');
    UI.clearBoard();

    const ctx = {
      root: UI.el.boardInner,
      onProgress: (ratio, text) => UI.setProgress(ratio, text),
      onFinish: (grade) => handleFinish(grade),
      skill: () => S.skill / 100
    };

    op = (typeof MINIGAMES !== 'undefined') ? MINIGAMES.create(node, ctx) : null;
    if (!op) {
      // 没有对应小游戏时，直接按她的手感结算
      setTimeout(() => handleFinish(S.skill > 72 ? 'perfect' : S.skill > 42 ? 'good' : 'miss'), 1400);
    }
  }

  function handleFinish(grade) {
    if (S.phase !== 'playing') return;
    S.phase = 'resolving';
    const node = stepOf();

    const value = grade === 'perfect' ? 1 : grade === 'good' ? 0.75 : 0.4;
    S.scoreSum += value;
    if (grade === 'perfect') { S.perfect += 1; S.skill = Math.min(100, S.skill + 6); }
    else if (grade === 'good') { S.good += 1; S.skill = Math.min(100, S.skill + 2); }
    else { S.miss += 1; S.skill = Math.max(18, S.skill - 8); }
    UI.setSkill(S.skill);

    SFX.event(grade === 'perfect' ? 'correct' : grade === 'good' ? 'neutral' : 'wrong');
    UI.showGrade(grade);
    UI.setDoing('');
    UI.setBubble(node[grade] || node.auto || '');
    setMood(grade === 'perfect' ? 'proud' : grade === 'good' ? 'focus' : 'panic');
    UI.setAuto('她记住了', false);
    UI.setProgress(1, grade === 'perfect' ? '完成' : grade === 'good' ? '完成' : '勉强');

    clearTimeout(nodeTimer);
    nodeTimer = setTimeout(() => {
      S.nodeIndex += 1;
      if (S.nodeIndex >= S.dish.nodes.length) finish();
      else startNode();
    }, 1750);
  }

  function setHeat(level) {
    const next = Math.max(0, Math.min(2, level));
    if (next !== S.heat) SFX.event('heat', { volume: 0.6 });
    S.heat = next;
    UI.setHeat(S.heat);
    const words = ['文火', '中火', '大火'];
    if (S.phase === 'playing') UI.toast(`火候：${words[S.heat]}`);
  }

  function togglePause() {
    if (S.phase === 'idle' || S.phase === 'done') return;
    S.paused = !S.paused;
    SFX.event(S.paused ? 'pause' : 'resume');
    UI.setAuto(S.paused ? '暂停中' : '她在自己做', S.paused);
    UI.setDoing(S.paused ? '' : stepOf().doing);
  }

  /* ---------- 说话 ---------- */

  function say(text) {
    SFX.event('send', { volume: 0.5 });
    if (S.phase === 'idle' || S.phase === 'done') {
      UI.setBubble('……还没开始呢。');
      return;
    }
    if (/火/.test(text) && /(小|关|弱)/.test(text)) {
      setHeat(0);
      reply('好，我关小一点。');
      return;
    }
    if (/火/.test(text) && /(大|猛)/.test(text)) {
      setHeat(2);
      reply('火开大了……真的可以吗？', 'panic');
      return;
    }
    if (/(等|慢|别急|不急)/.test(text)) {
      reply('嗯，我慢一点。', 'focus');
      return;
    }
    if (/(好棒|厉害|对|不错|可以)/.test(text)) {
      reply('诶……被夸了。那我更认真一点。', 'proud');
      S.skill = Math.min(100, S.skill + 4);
      UI.setSkill(S.skill);
      return;
    }
    if (/(快|来不及|赶时间)/.test(text)) {
      reply('好，我加快一点。', 'focus');
      return;
    }
    const hints = [
      '嗯……那我按刚才的节奏来。',
      '你说慢一点，我没听清。',
      '我在看着锅，你说。',
      '这一步我有点拿不准。'
    ];
    reply(hints[Math.floor(Math.random() * hints.length)]);
  }

  function reply(text, mood) {
    UI.setBubble(text);
    if (mood) setMood(mood);
  }

  function ingredientQuip(key) {
    if (S.phase === 'idle' || S.phase === 'done') return;
    SFX.event('click', { volume: 0.5 });
    UI.setBubble(UI.quipFor(key));
    setMood('calm');
  }

  /* ---------- 结算 ---------- */

  function finish() {
    S.phase = 'done';
    SFX.event('finish');
    if (op) { op.destroy && op.destroy(); op = null; }
    UI.setStep(S.dish.nodes.length - 1, S.dish.nodes.length, '出锅');
    UI.setDoing('');
    UI.setAuto('出锅了', false);
    UI.setBubble('盛出来了。你尝第一口。');
    setMood(S.scoreSum / S.dish.nodes.length > 0.8 ? 'proud' : S.scoreSum / S.dish.nodes.length > 0.55 ? 'calm' : 'sad');

    const score = Math.max(0, Math.round((S.scoreSum / S.dish.nodes.length) * 100));
    const quote = score >= 85
      ? '「你看，我记住了。下次换我做给你吃。」'
      : score >= 60
        ? '「下次我会记得先关小火。你尝一口嘛，就一口。」'
        : '「……是不是我太笨了？再教我一次好不好。」';

    setTimeout(() => {
      UI.showSettlement({
        round: S.round,
        dishName: S.dish.name,
        timeText: fmt(S.elapsed),
        perfect: S.perfect,
        miss: S.miss,
        score,
        quote,
        avatar: S.dish.thumb
      });
      S.round += 1;
    }, 1400);
  }

  function fmt(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function restart() {
    SFX.event('restart', { volume: 0.7 });
    UI.hideSettlement();
    S.nodeIndex = 0;
    S.elapsed = 0;
    S.burn = 0;
    S.skill = 80;
    S.perfect = 0;
    S.good = 0;
    S.miss = 0;
    S.scoreSum = 0;
    S.paused = false;
    S.warnedBurn = false;
    S.idleTalk = 0;
    S.heat = 1;
    UI.setTimer(0);
    UI.setHeat(1);
    UI.setBurn(0);
    UI.setSkill(S.skill);
    UI.setAuto('她在自己做', false);
    startNode();
  }

  return {
    init, start, restart, selectDish, setHeat, togglePause, say, ingredientQuip,
    get state() { return S; }
  };
})();
