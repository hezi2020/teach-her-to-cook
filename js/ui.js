/* 界面渲染：顶部、火候、食材、操作台、菜谱本与结算。只负责画，不含规则。 */

const UI = (() => {
  const $ = (id) => document.getElementById(id);
  const el = {};

  const ICONS = {
    egg: '<svg viewBox="0 0 24 24" width="18" height="18"><ellipse cx="12" cy="12" rx="9" ry="7" fill="#FBF8F1" stroke="#D8CEBD"/><circle cx="12" cy="12" r="3.2" fill="#F0D18A"/></svg>',
    tomato: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="13" r="7" fill="#CF7F68"/><path d="M12 6q2-3 4-2-1 2-4 2z" fill="#8FA383"/></svg>',
    scallion: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 20V9q0-3 2-4 2 1 2 4v11M14 20V8q0-3 2-4 2 1 2 4v12" fill="none" stroke="#8FA383" stroke-width="1.8" stroke-linecap="round"/></svg>',
    salt: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 9h8l1 11H7z" fill="#FBF8F1" stroke="#D8CEBD" stroke-width="1.4"/><path d="M9.5 9v-2h5v2" fill="none" stroke="#D8CEBD" stroke-width="1.4"/><circle cx="12" cy="14" r="1" fill="#C9BFAE"/><circle cx="12" cy="17" r="1" fill="#C9BFAE"/></svg>',
    onion: '<svg viewBox="0 0 24 24" width="18" height="18"><ellipse cx="12" cy="13" rx="8" ry="6" fill="none" stroke="#C9A46A" stroke-width="1.6"/><ellipse cx="12" cy="13" rx="4.6" ry="3.4" fill="none" stroke="#C9A46A" stroke-width="1.3"/><path d="M12 5q2-2 4-1" fill="none" stroke="#8FA383" stroke-width="1.6" stroke-linecap="round"/></svg>',
    chicken: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 14c0-4 3-7 7-7 3 0 5 2 5 5 0 4-3 7-7 7-3 0-5-2-5-5z" fill="#EBD1BC" stroke="#D8BFA8" stroke-width="1.3"/><path d="M16 6l3-3" stroke="#D8BFA8" stroke-width="2" stroke-linecap="round"/></svg>',
    rice: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14q0 7-7 7t-7-7z" fill="#FBF8F1" stroke="#D8CEBD" stroke-width="1.4"/><path d="M7 10q2-2 5-2t5 2" fill="none" stroke="#D8CEBD" stroke-width="1.3"/></svg>',
    sauce: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 8h8v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" fill="#E9DCC3" stroke="#D8CBB4" stroke-width="1.3"/><path d="M10 5h4v3h-4z" fill="#C9A46A"/></svg>'
  };

  const ING_QUIPS = {
    egg: '鸡蛋还剩这些，够用。',
    tomato: '番茄有点软了，正好煮汤。',
    scallion: '小葱最后撒，别忘了。',
    salt: '盐我放在手边了。',
    onion: '洋葱切的时候我尽量不揉眼睛。',
    chicken: '鸡腿肉挺厚的，要切小一点。',
    rice: '饭已经盛好了。',
    sauce: '出汁是昨天熬的，还香。'
  };

  function init() {
    el.dishName = $('dishName');
    el.stepChip = $('stepChip');
    el.dots = $('dots');
    el.timerText = $('timerText');
    el.autoChip = $('autoChip');
    el.autoText = $('autoText');
    el.pauseBtn = $('pauseBtn');
    el.bookBtn = $('bookBtn');
    el.heatPanel = $('heatPanel');
    el.heatFill = $('heatFill');
    el.heatKnob = $('heatKnob');
    el.burnFill = $('burnFill');
    el.burnPct = $('burnPct');
    el.skillFill = $('skillFill');
    el.skillPct = $('skillPct');
    el.trayGrid = $('trayGrid');
    el.boardInner = $('boardInner');
    el.board = $('board');
    el.doing = $('doing');
    el.doingText = $('doingText');
    el.fallback = $('fallback');
    el.expr = $('expr');
    el.bubble = $('bubble');
    el.bubbleText = $('bubbleText');
    el.opName = $('opName');
    el.opHint = $('opHint');
    el.opFill = $('opFill');
    el.opCount = $('opCount');
    el.cmdInput = $('cmdInput');
    el.stopBtn = $('stopBtn');
    el.drawer = $('drawer');
    el.recipeList = $('recipeList');
    el.startBtn = $('startBtn');
    el.drawerClose = $('drawerClose');
    el.settlement = $('settlement');
    el.stAgain = $('stAgain');
    el.stOther = $('stOther');
    el.toast = $('toast');
  }

  function setDish(dish) {
    el.dishName.textContent = dish.name;
    el.dots.innerHTML = dish.nodes.map(() => '<i></i>').join('');
    const flow = $('flow');
    if (flow) {
      flow.innerHTML = dish.nodes.map((n, i) =>
        `<span class="fnode" data-i="${i}"><i></i>${n.label}</span>`).join('') +
        `<span class="ftotal">0 / ${dish.nodes.length}</span>`;
    }
  }

  function setStep(index, total, label) {
    el.stepChip.textContent = `第 ${Math.min(index + 1, total)} / ${total} 步 · ${label}`;
    [...el.dots.children].forEach((d, i) => {
      d.className = i < index ? 'on' : (i === index ? 'now' : '');
    });
    const flow = $('flow');
    if (flow) {
      [...flow.querySelectorAll('.fnode')].forEach((n, i) => {
        n.classList.toggle('done', i < index);
        n.classList.toggle('now', i === index);
      });
      const totalEl = flow.querySelector('.ftotal');
      if (totalEl) totalEl.textContent = `${Math.min(index + 1, total)} / ${total}`;
    }
  }

  function setTimer(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    el.timerText.textContent = `${m}:${s}`;
  }

  function setAuto(text, paused) {
    el.autoText.textContent = text;
    el.autoChip.classList.toggle('paused', !!paused);
  }

  function setHeat(level) {
    [...el.heatPanel.querySelectorAll('.lv')].forEach((b) => {
      b.classList.toggle('on', Number(b.dataset.heat) === level);
    });
    const pct = [18, 52, 88][level];
    el.heatFill.style.width = pct + '%';
    el.heatKnob.style.left = pct + '%';
  }

  function setBurn(pct) {
    el.burnFill.style.width = Math.round(pct * 100) + '%';
    el.burnPct.textContent = Math.round(pct * 100) + '%';
  }

  function setSkill(pct) {
    el.skillFill.style.width = Math.round(pct) + '%';
    el.skillPct.textContent = Math.round(pct) + '%';
  }

  function renderTray(dish, onSlot) {
    el.trayGrid.innerHTML = dish.ingredients.map((ing) => `
      <button class="slot" data-ing="${ing.icon}" title="${ing.label} ×${ing.count}">
        ${ICONS[ing.icon] || ICONS.salt}<span class="n">${ing.count}</span>
      </button>`).join('');
    [...el.trayGrid.children].forEach((btn) => {
      btn.addEventListener('click', () => onSlot(btn.dataset.ing));
    });
  }

  function quipFor(iconKey) { return ING_QUIPS[iconKey] || '嗯，在呢。'; }

  function setDoing(text) {
    if (!text) { el.doing.hidden = true; return; }
    el.doing.hidden = false;
    el.doingText.textContent = text;
  }

  function setBubble(text) {
    if (!text) { el.bubble.hidden = true; return; }
    el.bubble.hidden = false;
    el.bubbleText.textContent = text;
    el.bubble.style.animation = 'none';
    void el.bubble.offsetWidth;
    el.bubble.style.animation = '';
  }

  function setExpressionLabel(key) {
    const conf = EXPRESSIONS[key] || EXPRESSIONS.calm;
    el.expr.textContent = `LIVE2D · ${conf.label}`;
    if (el.fallback && !el.fallback.hidden) {
      el.fallback.style.filter = conf.fallbackFilter;
    }
  }

  function setOp(name, hint) {
    el.opName.textContent = name || '';
    el.opHint.textContent = hint || '';
  }

  function setProgress(ratio, text) {
    el.opFill.style.width = Math.round(Math.max(0, Math.min(1, ratio)) * 100) + '%';
    el.opCount.textContent = text || '';
  }

  let gradeTimer = null;
  function showGrade(grade) {
    let g = document.querySelector('.grade');
    if (!g) {
      g = document.createElement('div');
      g.className = 'grade';
      el.board.appendChild(g);
    }
    const map = { perfect: '完美', good: '还行', miss: '糟糕' };
    g.textContent = map[grade] || '';
    g.className = `grade ${grade === 'miss' ? 'miss' : ''}`;
    requestAnimationFrame(() => g.classList.add('show'));
    clearTimeout(gradeTimer);
    gradeTimer = setTimeout(() => g.classList.remove('show'), 1100);
  }

  function clearBoard() {
    el.boardInner.innerHTML = '';
  }

  function showDrawer(show) {
    el.drawer.classList.toggle('hidden', !show);
  }

  function renderRecipes(dishes, selectedId, onSelect) {
    el.recipeList.innerHTML = dishes.map((d) => `
      <div class="ritem ${d.id === selectedId ? 'on' : ''}" data-id="${d.id}">
        <img src="${d.thumb}" alt="${d.name}">
        <div>
          <div class="nm">${d.name}</div>
          <div class="mt">${d.difficulty} · ${d.minutes} 分钟 · ${d.nodes.length} 个操作</div>
        </div>
        <span class="badge">还没教过</span>
      </div>`).join('');
    [...el.recipeList.children].forEach((node) => {
      node.addEventListener('click', () => onSelect(node.dataset.id));
    });
    el.startBtn.disabled = !selectedId;
  }

  function showSettlement(data) {
    $('stEyebrow').textContent = `今天 · 第 ${data.round} 次一起做饭`;
    $('stDish').textContent = data.dishName;
    $('stSub').textContent = data.score >= 80 ? '已收进她的拿手菜' : '记录在她的菜谱本里';
    $('stTime').textContent = data.timeText;
    $('stFix').textContent = `${data.perfect} 次`;
    $('stMiss').textContent = `${data.miss} 次`;
    $('stQuote').textContent = data.quote;
    $('stScore').textContent = data.score;
    $('stAvatar').src = data.avatar;
    el.settlement.hidden = false;
    requestAnimationFrame(() => {
      $('stBar').style.width = data.score + '%';
    });
  }

  function hideSettlement() {
    el.settlement.hidden = true;
    $('stBar').style.width = '0%';
  }

  let toastTimer = null;
  function toast(text) {
    el.toast.textContent = text;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.toast.hidden = true; }, 1800);
  }

  function shakeBoard() {
    el.board.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }],
      { duration: 220, easing: 'ease-in-out' }
    );
  }

  return {
    init, el,
    setDish, setStep, setTimer, setAuto, setHeat, setBurn, setSkill,
    renderTray, quipFor, setDoing, setBubble, setExpressionLabel,
    setOp, setProgress, showGrade, clearBoard,
    showDrawer, renderRecipes, showSettlement, hideSettlement,
    toast, shakeBoard
  };
})();
