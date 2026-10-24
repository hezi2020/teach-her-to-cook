/* 音效系统：WebAudio 解码 Kenney 音效包，按事件播放。 */

const SFX_FILES = [
  'back_001','back_002','back_003','back_004','bong_001','click_001','click_002','click_003',
  'click_004','click_005','close_001','close_002','close_003','close_004','confirmation_001',
  'confirmation_002','confirmation_003','confirmation_004','drop_001','drop_002','drop_003',
  'drop_004','error_001','error_002','error_003','error_004','error_005','error_006','error_007',
  'error_008','glass_001','glass_002','glass_003','glass_004','glass_005','glass_006',
  'glitch_001','glitch_002','glitch_003','glitch_004','maximize_001','maximize_002',
  'maximize_003','maximize_004','maximize_005','maximize_006','maximize_007','maximize_008',
  'maximize_009','minimize_001','minimize_002','minimize_003','minimize_004','minimize_005',
  'minimize_006','minimize_007','minimize_008','minimize_009','open_001','open_002','open_003',
  'open_004','pluck_001','pluck_002','question_001','question_002','question_003','question_004',
  'scratch_001','scratch_002','scratch_003','scratch_004','scratch_005','scroll_001','scroll_002',
  'scroll_003','scroll_004','scroll_005','select_001','select_002','select_003','select_004',
  'select_005','select_006','select_007','select_008','switch_001','switch_002','switch_003',
  'switch_004','switch_005','switch_006','switch_007','tick_001','tick_002','tick_004',
  'toggle_001','toggle_002','toggle_003','toggle_004'
];

const SFX = (() => {
  const BASE = 'assets/audio/Audio/';
  const MAP = {
    click: 'click_001',
    select: 'select_002',
    pick: 'select_003',
    confirm: 'confirmation_001',
    correct: 'confirmation_002',
    wrong: 'error_004',
    neutral: 'click_004',
    burn: 'error_006',
    sizzle: 'glass_005',
    step: 'switch_002',
    heat: 'switch_001',
    open: 'open_001',
    close: 'close_001',
    pause: 'toggle_001',
    resume: 'toggle_002',
    finish: 'bong_001',
    restart: 'select_005',
    toast: 'click_003',
    tick: 'tick_001',
    bubble: 'pluck_002',
    tap: 'pluck_001',
    drawer: 'open_002',
    drop: 'drop_002',
    question: 'question_001',
    send: 'click_005',
    fail: 'error_007',
    win: 'maximize_003'
  };

  const PRELOAD = [
    'click_001','click_003','click_004','click_005','select_002','select_003','select_005',
    'confirmation_001','confirmation_002','error_004','error_006','error_007','switch_001',
    'switch_002','open_001','open_002','close_001','toggle_001','toggle_002','bong_001',
    'tick_001','pluck_001','pluck_002','glass_005','drop_002','question_001','maximize_003'
  ];

  let ctx = null;
  let master = null;
  let enabled = true;
  const buffers = new Map();
  const pending = new Map();
  const listeners = new Set();

  function ensureCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    return ctx;
  }

  function load(name) {
    if (!name) return Promise.resolve(null);
    if (buffers.has(name)) return Promise.resolve(buffers.get(name));
    if (pending.has(name)) return pending.get(name);
    const c = ensureCtx();
    if (!c) return Promise.resolve(null);
    const p = fetch(BASE + name + '.ogg')
      .then((r) => r.arrayBuffer())
      .then((ab) => c.decodeAudioData(ab))
      .then((buf) => { buffers.set(name, buf); pending.delete(name); return buf; })
      .catch(() => { pending.delete(name); return null; });
    pending.set(name, p);
    return p;
  }

  function play(name, opts = {}) {
    if (!enabled) return;
    const c = ensureCtx();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
    load(name).then((buf) => {
      if (!buf) return;
      const src = c.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = opts.rate || 1;
      const g = c.createGain();
      g.gain.value = opts.volume == null ? 0.85 : opts.volume;
      src.connect(g);
      g.connect(master);
      src.start(0);
    });
  }

  function event(key, opts) {
    const name = MAP[key];
    if (!name) return;
    play(name, opts);
  }

  function preload(list = PRELOAD) {
    const c = ensureCtx();
    if (!c) return Promise.resolve();
    return Promise.all(list.map(load));
  }

  function unlock() {
    const c = ensureCtx();
    if (c && c.state === 'suspended') c.resume();
  }

  function toggle() {
    enabled = !enabled;
    if (enabled) { event('confirm', { volume: 0.7 }); preload(); }
    listeners.forEach((fn) => fn(enabled));
    return enabled;
  }

  function onChange(fn) { listeners.add(fn); }
  function isEnabled() { return enabled; }
  function has(name) { return SFX_FILES.includes(name); }

  // 首次点击后解锁音频并预载常用音效
  document.addEventListener('pointerdown', function once() {
    unlock();
    preload();
    document.removeEventListener('pointerdown', once);
  }, { once: true });

  return { play, event, preload, toggle, onChange, isEnabled, unlock, has, FILES: SFX_FILES, MAP };
})();
