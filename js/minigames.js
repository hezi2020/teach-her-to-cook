/* 手把手操作小游戏：切 / 倒 / 搅 / 卷 / 压 / 淋 / 盛。每个都返回 { update, destroy }。 */

const MINIGAMES = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 548;
  const H = 344;

  function el(tag, attrs = {}, inner = '') {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (inner) n.innerHTML = inner;
    return n;
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- 器皿 ---------- */
  function potShape(cx, cy, rx, inner = '#EDE3D0') {
    return `
      <ellipse cx="${cx}" cy="${cy + 74}" rx="${rx + 12}" ry="13" fill="rgba(120,100,70,.12)"/>
      <path d="M${cx - rx - 16} ${cy} Q${cx - rx - 6} ${cy + 92} ${cx} ${cy + 92} Q${cx + rx + 6} ${cy + 92} ${cx + rx + 16} ${cy} Z" fill="#FBF7EE"/>
      <path d="M${cx - rx - 16} ${cy + 30} q-20 6 -16 26" fill="none" stroke="#E4D8C2" stroke-width="6" stroke-linecap="round"/>
      <path d="M${cx + rx + 16} ${cy + 30} q20 6 16 26" fill="none" stroke="#E4D8C2" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx + 14}" ry="27" fill="#FFFDF8"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx - 2}" ry="20" fill="${inner}"/>`;
  }

  function panShape(cx, cy, rx, inner = '#E9C4A9') {
    return `
      <ellipse cx="${cx}" cy="${cy + 66}" rx="${rx + 16}" ry="12" fill="rgba(120,100,70,.12)"/>
      <path d="M${cx - rx - 18} ${cy} Q${cx - rx - 8} ${cy + 80} ${cx} ${cy + 80} Q${cx + rx + 8} ${cy + 80} ${cx + rx + 18} ${cy} Z" fill="#F3EEE1"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx + 16}" ry="26" fill="#FBF7EE"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="19" fill="${inner}"/>
      <rect x="${cx + rx + 18}" y="${cy + 6}" width="86" height="13" rx="6.5" fill="#DCC8AC"/>`;
  }

  function bowlShape(cx, cy, rx, inner = '#F0D18A') {
    return `
      <ellipse cx="${cx}" cy="${cy + 46}" rx="${rx + 10}" ry="10" fill="rgba(120,100,70,.10)"/>
      <path d="M${cx - rx - 8} ${cy} Q${cx - rx + 2} ${cy + 74} ${cx} ${cy + 74} Q${cx + rx - 2} ${cy + 74} ${cx + rx + 8} ${cy} Z" fill="#FFFDF8"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx + 6}" ry="19" fill="#FFFDF8" stroke="#EFE6D6" stroke-width="1.2"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx - 6}" ry="13.5" fill="${inner}"/>`;
  }

  function boardShape() {
    return `
      <ellipse cx="270" cy="300" rx="214" ry="14" fill="rgba(120,100,70,.12)"/>
      <rect x="56" y="86" width="428" height="212" rx="16" fill="#E4D3B8"/>
      <rect x="56" y="86" width="428" height="16" rx="8" fill="#EFE2CB"/>
      <g stroke="#D5C1A3" stroke-width="1.2" opacity=".7">
        <path d="M92 120 h356"/><path d="M92 152 h356"/><path d="M92 256 h356"/>
      </g>`;
  }

  const BASE_COLOR = {
    empty: '#EDE3D0', oil: '#F2E4B2', tomato: '#D99C7E', tomatoSoup: '#E0A98F',
    onion: '#E4C894', sauce: '#C9A46A', egg: '#E9C4A9', rice: '#FBF8F1',
    sheet: '#F6DE9E', roll: '#F4D68F', sliced: '#F4D68F'
  };
  function baseColor(k) { return BASE_COLOR[k] || '#EDE3D0'; }

  function steam(x, y, n = 3, op = 0.5) {
    const arr = [-26, 0, 26].slice(0, n);
    return arr.map((dx, i) => `<path d="M${x + dx} ${y} q7 -14 0 -28" fill="none" stroke="#B7C9BE" stroke-width="2.6" stroke-linecap="round" opacity="${op - i * 0.1}"/>`).join('');
  }

  /* ---------- 基类 ---------- */
  function makeOp(node, ctx, hooks) {
    const root = ctx.root;
    root.innerHTML = '';
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` });
    root.appendChild(svg);

    const st = {
      done: false,
      active: false,
      idle: 0,
      auto: node.duration,
      last: 0
    };

    const api = {
      svg, st, node, ctx,
      add(markup) { svg.insertAdjacentHTML('beforeend', markup); },
      p(e) {
        const r = root.getBoundingClientRect();
        return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
      },
      progress(ratio, text) { ctx.onProgress(clamp(ratio, 0, 1), text); },
      finish(grade) {
        if (st.done) return;
        st.done = true;
        if (window.SFX) SFX.event('drop', { volume: 0.4 });
        root.classList.remove('grab', 'grabbing');
        ctx.onFinish(grade);
      },
      autoGrade() {
        const s = ctx.skill();
        return s > 0.88 ? 'good' : 'miss';
      },
      update(dt) {
        if (st.done) return;
        st.last = dt;
        st.total = (st.total || 0) + dt;
        // 兜底：长时间卡住也要往前推进
        if (st.total > node.duration * 2.2) { api.finish('miss'); return; }
        if (st.active) st.idle = 0; else st.idle += dt;
        if (st.idle > 1.5) {
          st.auto -= dt;
          if (st.auto <= 0) { api.finish(api.autoGrade()); return; }
        }
        hooks.tick && hooks.tick(dt, api);
      }
    };

    root.addEventListener('pointerdown', (e) => {
      if (st.done) return;
      st.active = true;
      if (window.SFX) SFX.event('tap', { volume: 0.3, rate: 0.95 + Math.random() * 0.15 });
      root.classList.add('grabbing');
      try { root.setPointerCapture(e.pointerId); } catch (_) {}
      hooks.down && hooks.down(api.p(e), api);
    });
    root.addEventListener('pointermove', (e) => {
      if (st.done || !st.active) return;
      hooks.move && hooks.move(api.p(e), api);
    });
    root.addEventListener('pointerup', (e) => {
      if (st.done) return;
      st.active = false;
      root.classList.remove('grabbing');
      hooks.up && hooks.up(api.p(e), api);
    });
    root.addEventListener('pointercancel', () => { st.active = false; });

    hooks.start && hooks.start(api);
    return { update: api.update, destroy() { st.done = true; } };
  }

  /* ---------- 1. 切 ---------- */
  function chop(node, ctx) {
    let cuts = 0, lastAt = 0, gaps = [], downPos = null, autoAcc = 0;
    return makeOp(node, ctx, {
      start(api) {
        const ing = node.ingredient || 'tomato';
        const food = ing === 'onion'
          ? `<circle cx="278" cy="196" r="58" fill="#E4C894"/>
             <circle cx="278" cy="196" r="49" fill="#EAD6AE"/>
             <ellipse cx="278" cy="196" rx="34" ry="22" fill="none" stroke="#C9A46A" stroke-width="2"/>
             <ellipse cx="278" cy="196" rx="20" ry="12" fill="none" stroke="#C9A46A" stroke-width="1.6"/>
             <path d="M278 138 q10 -14 22 -9 -5 12 -22 9z" fill="#8FA383"/>`
          : ing === 'eggroll'
            ? `<rect x="196" y="164" width="164" height="64" rx="26" fill="#F4D68F" stroke="#E0BE79" stroke-width="1.6"/>
               <path d="M222 164 q4 32 0 64 M254 164 q4 32 0 64 M286 164 q4 32 0 64 M318 164 q4 32 0 64" stroke="#FBEAB9" stroke-width="1.5" fill="none"/>`
            : `<circle cx="278" cy="196" r="58" fill="#C98B6B"/>
               <circle cx="278" cy="196" r="51" fill="#D99C7E"/>
               <path d="M278 138 q10 -14 22 -9 -5 12 -22 9z" fill="#8FA383"/>`;
        api.root = api.svg;
        api.add(`
          ${boardShape()}
          <g id="food">
            ${food}
            <g id="cutmarks"></g>
          </g>
          <g id="knife" transform="translate(0,0)" opacity=".98">
            <g transform="rotate(-24)">
              <rect x="332" y="150" width="10" height="62" rx="5" fill="#B79A78"/>
              <path d="M316 206 h40 l-6 30 h-28z" fill="#F6F0E3" stroke="#CDB695" stroke-width="1.2"/>
            </g>
          </g>
          <g id="cursor"><circle cx="0" cy="0" r="13" fill="#A8D5C8" opacity=".22"/><circle r="7" fill="#A8D5C8" stroke="#FFFDF8" stroke-width="2.2"/></g>
          <text x="274" y="80" text-anchor="middle" font-family="system-ui" font-size="11" letter-spacing="2" fill="#8B8272">砧板</text>
        `);
        api.cursor = api.svg.querySelector('#cursor');
        api.knife = api.svg.querySelector('#knife');
        api.marks = api.svg.querySelector('#cutmarks');
        api.progress(0, `0 / ${node.count} 刀`);
      },
      down(p, api) {
        downPos = p;
        api.cursor.setAttribute('transform', `translate(${p.x},${p.y})`);
      },
      move(p, api) {
        api.cursor.setAttribute('transform', `translate(${p.x},${p.y})`);
        api.knife.setAttribute('transform', `translate(${p.x - 278},${p.y - 196})`);
      },
      up(p, api) {
        if (!downPos) return;
        const dx = p.x - downPos.x;
        const dy = p.y - downPos.y;
        const inside = Math.hypot((downPos.x + p.x) / 2 - 278, (downPos.y + p.y) / 2 - 196) < 92;
        if (inside && Math.abs(dx) > 58 && Math.abs(dy) < 60) {
          const now = performance.now();
          if (lastAt) gaps.push(now - lastAt);
          lastAt = now;
          cuts += 1;
          const lx = clamp(downPos.x + dx * 0.5, 228, 328);
          api.marks.insertAdjacentHTML('beforeend', `<path d="M${lx} 148 v96" stroke="#FFFDF8" stroke-width="2.4" opacity=".85"/>`);
          api.progress(cuts / node.count, `${cuts} / ${node.count} 刀`);
          if (cuts >= node.count) {
            const avg = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 600;
            const sd = gaps.length > 1 ? Math.sqrt(gaps.reduce((a, b) => a + (b - avg) ** 2, 0) / gaps.length) : 0;
            const q = clamp(1 - sd / 520, 0, 1);
            api.finish(q > 0.72 ? 'perfect' : q > 0.42 ? 'good' : 'miss');
          }
        }
        downPos = null;
      },
      tick(dt, api) {
        if (api.st.active || api.st.idle < 1.5) return;
        api._autoCut = (api._autoCut || 0) + dt;
        if (api._autoCut > 1.7 && cuts < node.count) {
          api._autoCut = 0;
          cuts += 1;
          const lx = 258 + Math.random() * 26;
          api.marks.insertAdjacentHTML('beforeend', `<path d="M${lx} 148 v96" stroke="#FFFDF8" stroke-width="2" opacity=".45"/>`);
          api.progress(cuts / node.count, `${cuts} / ${node.count} 刀`);
        }
      }
    });
  }

  /* ---------- 2. 倒 ---------- */
  function pour(node, ctx) {
    let volume = 0, evaluated = false;
    return makeOp(node, ctx, {
      start(api) {
        api.add(`
          <g id="vessel">${potShape(272, 216, 128, baseColor(node.base))}</g>
          <g id="liquid"></g>
          <g id="bottle" transform="translate(430,64)">
            <g id="bt">
              <rect x="-24" y="0" width="48" height="82" rx="12" fill="#EFE9DA" stroke="#D8CEBD" stroke-width="1.4"/>
              <rect x="-9" y="-18" width="18" height="22" rx="5" fill="#DCC8AC"/>
              <ellipse cx="0" cy="52" rx="19" ry="24" fill="#E3C27A" opacity=".55"/>
            </g>
          </g>
          <path id="stream" d="" fill="none" stroke="#E3C27A" stroke-width="7" stroke-linecap="round" opacity="0"/>
          <g id="gauge">
            <rect x="498" y="70" width="20" height="190" rx="10" fill="#FFFDF8" stroke="#E1D6C2" stroke-width="1.2"/>
            <rect x="500" y="${70 + 190 * (1 - node.target - node.band)}" width="16" height="${190 * node.band * 2}" rx="8" fill="#EAF4EE"/>
            <rect x="500" y="${70 + 190 * (1 - node.target - node.band)}" width="16" height="${190 * node.band * 2}" fill="none" stroke="#A8D5C8" stroke-width="1.2"/>
            <rect id="fill" x="500" y="260" width="16" height="0" rx="8" fill="#C9B79A" opacity=".8"/>
            <text x="508" y="60" text-anchor="middle" font-family="system-ui" font-size="8" fill="#8B8272">量</text>
          </g>
        `);
        api.fill = api.svg.querySelector('#fill');
        api.liq = api.svg.querySelector('#liquid');
        api.bt = api.svg.querySelector('#bt');
        api.stream = api.svg.querySelector('#stream');
        api.bottleG = api.svg.querySelector('#bottle');
        api.progress(0, '0%');
        api.svg.querySelector('#gauge');
      },
      down(p, api) {
        api.bottleG.style.transition = 'transform .12s';
        api.bt.setAttribute('transform', 'rotate(-38)');
        api.stream.setAttribute('opacity', '0.95');
        api.pouring = true;
      },
      move() {},
      up(p, api) {
        if (!api.pouring) return;
        api.pouring = false;
        api.bt.setAttribute('transform', 'rotate(0)');
        api.stream.setAttribute('opacity', '0');
        if (volume > 0.02 && !evaluated) {
          evaluated = true;
          const d = Math.abs(volume - node.target);
          const q = clamp(1 - d / (node.band * 2.4), 0, 1);
          // 允许继续倒，若不在带内则等下一次松手再判
          if (d <= node.band) api.finish(q > 0.66 ? 'perfect' : 'good');
          else if (volume > node.target + node.band) api.finish('miss');
        }
      },
      tick(dt, api) {
        if (!api.pouring) {
          volume = clamp(volume + dt * 0.05 * ctx.skill(), 0, 1);
        } else {
          volume = clamp(volume + dt * 0.24, 0, 1);
        }
        api.fill.setAttribute('y', 260 - 190 * volume);
        api.fill.setAttribute('height', 190 * volume);
        const liquid = node.base === 'sauce' ? '#C9A46A' : '#F2E4B2';
        api.liq.innerHTML = `<ellipse cx="272" cy="216" rx="${46 + volume * 76}" ry="${7 + volume * 12}" fill="${liquid}" opacity="${0.28 + volume * 0.7}"/>`;
        api.stream.setAttribute('d', `M415 118 Q${400} 170 340 208`);
        api.progress(volume, `${Math.round(volume * 100)}%`);
        if (volume >= 0.995) { api.finish('miss'); }
      }
    });
  }

  /* ---------- 3. 搅 ---------- */
  function stir(node, ctx) {
    let hold = 0, angle = null, lastT = 0, inBand = 0, activeT = 0, spin = 0, autoAng = 0;
    return makeOp(node, ctx, {
      start(api) {
        const bowl = node.vessel === 'bowl';
        api.add(`
          ${bowl ? bowlShape(272, 210, 118, baseColor(node.base)) : potShape(272, 216, 132, baseColor(node.base))}
          <g id="whirl" opacity=".9"></g>
          <circle cx="272" cy="${bowl ? 210 : 216}" r="70" fill="none" stroke="#FFFDF8" stroke-width="2" stroke-dasharray="5 8" opacity=".75"/>
          <g id="tool" transform="translate(272,216)">
            <rect x="-4" y="-92" width="8" height="62" rx="4" fill="#B79A78"/>
            <path d="M-13 -32 h26 l-4 26 h-18z" fill="#E4D3B8" stroke="#CDB695" stroke-width="1.2"/>
          </g>
          <g id="speed">
            <rect x="34" y="58" width="152" height="10" rx="5" fill="#FFFDF8" stroke="#E1D6C2"/>
            <rect x="96" y="58" width="58" height="10" rx="5" fill="#EAF4EE" stroke="#A8D5C8" stroke-width="1"/>
            <rect id="sp" x="34" y="58" width="0" height="10" rx="5" fill="#A8D5C8"/>
            <text x="34" y="50" font-family="system-ui" font-size="8" fill="#8B8272">转速</text>
          </g>
        `);
        api.tool = api.svg.querySelector('#tool');
        api.sp = api.svg.querySelector('#sp');
        api.whirl = api.svg.querySelector('#whirl');
        api.cx = 272; api.cy = bowl ? 210 : 216;
        api.progress(0, `0.0 / ${node.hold} 秒`);
      },
      down(p, api) {
        angle = Math.atan2(p.y - api.cy, p.x - api.cx);
        lastT = 0;
      },
      move(p, api) {
        const a = Math.atan2(p.y - api.cy, p.x - api.cx);
        const r = Math.min(76, Math.hypot(p.x - api.cx, p.y - api.cy));
        api.tool.setAttribute('transform', `translate(${api.cx + Math.cos(a) * r},${api.cy + Math.sin(a) * r}) rotate(${a * 180 / Math.PI + 90})`);
        if (angle !== null && lastT > 0.002) {
          let da = a - angle;
          while (da > Math.PI) da -= Math.PI * 2;
          while (da < -Math.PI) da += Math.PI * 2;
          const dt = Math.max(0.001, lastT);
          const speed = Math.abs(da) * 180 / Math.PI / dt;
          spin = spin * 0.6 + speed * 0.4;
          api.sp.setAttribute('width', clamp(spin / 420, 0, 1) * 152);
          api.spinValue = spin;
        }
        angle = a;
        lastT = api.st.last || 0.016;
      },
      up() { angle = null; },
      tick(dt, api) {
        if (!api.st.active) {
          spin *= 0.9;
          if (api.sp) api.sp.setAttribute('width', clamp(spin / 420, 0, 1) * 152);
          // 她自己搅：慢悠悠地转
          autoAng += dt * 1.6;
          const r = 54;
          api.tool.setAttribute('transform',
            `translate(${api.cx + Math.cos(autoAng) * r},${api.cy + Math.sin(autoAng) * r}) rotate(${autoAng * 180 / Math.PI + 90})`);
          return;
        }
        activeT += dt;
        if (spin >= node.speed[0] && spin <= node.speed[1]) { hold += dt; inBand += dt; }
        api.progress(hold / node.hold, `${Math.min(node.hold, hold).toFixed(1)} / ${node.hold} 秒`);
        if (hold >= node.hold) {
          const q = clamp(inBand / Math.max(0.8, activeT), 0, 1);
          api.finish(q > 0.72 ? 'perfect' : q > 0.42 ? 'good' : 'miss');
        }
      }
    });
  }

  /* ---------- 4. 卷 ---------- */
  function roll(node, ctx) {
    let prog = 0, dev = 0, samples = 0, downX = null;
    return makeOp(node, ctx, {
      start(api) {
        api.add(`
          ${panShape(258, 200, 118, '#F4D68F')}
          <g id="sheet"><rect x="150" y="182" width="230" height="38" rx="10" fill="#F6DE9E"/></g>
          <g id="rolled"></g>
          <path d="M150 160 h230" stroke="#A8D5C8" stroke-width="2" stroke-dasharray="6 8" opacity=".8"/>
          <text x="265" y="148" text-anchor="middle" font-family="system-ui" font-size="9" fill="#8B8272">沿虚线向右拖</text>
        `);
        api.sheet = api.svg.querySelector('#sheet');
        api.rolled = api.svg.querySelector('#rolled');
        api.progress(0, '0%');
      },
      down(p, api) { downX = p.x; },
      move(p, api) {
        if (downX === null) return;
        const dx = p.x - downX;
        downX = p.x;
        prog = clamp(prog + dx / 210, 0, 1);
        dev += Math.abs(p.y - 200); samples += 1;
        const w = 230 * (1 - prog);
        api.sheet.innerHTML = `<rect x="${150 + 230 * prog}" y="182" width="${Math.max(0, w)}" height="38" rx="10" fill="#F6DE9E"/>`;
        api.rolled.innerHTML = prog > 0.02
          ? `<rect x="140" y="${184 - prog * 6}" width="${30 + prog * 34}" height="${38 + prog * 12}" rx="${10 + prog * 8}" fill="#F4D68F" stroke="#E0BE79" stroke-width="1.2"/>
             <path d="M${150} ${200} q${10 + prog * 10} 10 ${22 + prog * 12} 0" fill="none" stroke="#E0BE79" stroke-width="1.2"/>`
          : '';
        api.progress(prog, `${Math.round(prog * 100)}%`);
        if (prog >= 0.99) {
          const avgDev = samples ? dev / samples : 40;
          const q = clamp(1 - avgDev / 55, 0, 1);
          api.finish(q > 0.72 ? 'perfect' : q > 0.42 ? 'good' : 'miss');
        }
      },
      up() { downX = null; },
      tick(dt, api) {
        if (api.st.active) return;
        prog = clamp(prog + dt * 0.09, 0, 1);
        api.progress(prog, `${Math.round(prog * 100)}%`);
        if (prog >= 1) api.finish(api.autoGrade());
      }
    });
  }

  /* ---------- 5. 压 ---------- */
  function press(node, ctx) {
    let hold = 0, pressure = 0.2, downY = null;
    return makeOp(node, ctx, {
      start(api) {
        api.add(`
          ${panShape(258, 200, 118, '#F4D68F')}
          <rect x="186" y="172" width="150" height="56" rx="24" fill="#F4D68F" stroke="#E0BE79" stroke-width="1.2"/>
          <g id="tool" transform="translate(261,150)">
            <rect x="-5" y="-70" width="10" height="56" rx="5" fill="#B79A78"/>
            <rect x="-22" y="-16" width="44" height="14" rx="7" fill="#E4D3B8" stroke="#CDB695"/>
          </g>
          <g id="gauge">
            <rect x="452" y="88" width="20" height="170" rx="10" fill="#FFFDF8" stroke="#E1D6C2" stroke-width="1.2"/>
            <rect x="454" y="${88 + 170 * (1 - 0.8)}" width="16" height="${170 * 0.25}" rx="8" fill="#EAF4EE" stroke="#A8D5C8" stroke-width="1"/>
            <rect id="mark" x="454" y="200" width="16" height="10" rx="5" fill="#C9B79A"/>
          </g>
        `);
        api.tool = api.svg.querySelector('#tool');
        api.mark = api.svg.querySelector('#mark');
        api.progress(0, `0.0 / ${node.hold} 秒`);
      },
      down(p, api) { downY = p.y; },
      move(p, api) {
        downY = p.y;
        pressure = clamp(1 - (p.y - 140) / 130, 0, 1);
        api.mark.setAttribute('y', 258 - 170 * pressure);
        api.tool.setAttribute('transform', `translate(261,${150 + pressure * 26})`);
        if (api.st.active) {
          if (pressure >= 0.55 && pressure <= 0.8) hold += api.st.last || 0.016;
          api.progress(hold / node.hold, `${Math.min(node.hold, hold).toFixed(1)} / ${node.hold} 秒`);
          if (hold >= node.hold) api.finish(pressure < 0.72 ? 'good' : 'perfect');
        }
      },
      up() { downY = null; },
      tick(dt, api) {
        if (api.st.active) return;
        // 她自己压：压力在低位缓慢累积
        hold += dt * 0.1 * ctx.skill();
        api.progress(hold / node.hold, `${Math.min(node.hold, hold).toFixed(1)} / ${node.hold} 秒`);
      }
    });
  }

  /* ---------- 6. 淋 ---------- */
  function drizzle(node, ctx) {
    let pts = [];
    for (let i = 0; i <= 260; i++) {
      const t = i / 260;
      const ang = Math.PI * 2 * 2.1 * t - Math.PI / 2;
      const r = 112 * (1 - t * 0.72);
      pts.push({ x: 272 + Math.cos(ang) * r, y: 212 + Math.sin(ang) * r * 0.42, hit: false });
    }
    let visited = 0, dev = 0, samples = 0, autoAcc = 0;
    return makeOp(node, ctx, {
      start(api) {
        api.add(`
          <g id="vessel">${potShape(272, 212, 132, baseColor(node.base))}</g>
          <path d="${pts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ')}"
            fill="none" stroke="#FFFDF8" stroke-width="2" stroke-dasharray="4 7" opacity=".9"/>
          <g id="trail"></g>
          <g id="bowl" transform="translate(330,96)">
            <path d="M-34 0 Q-30 40 0 40 Q30 40 34 0 Z" fill="#FFFDF8" stroke="#D8CEBD" stroke-width="1.3"/>
            <ellipse cx="0" cy="0" rx="34" ry="10" fill="#F0D18A"/>
            <ellipse cx="0" cy="0" rx="24" ry="6" fill="#F6DE9E"/>
          </g>
          <g id="cursor"><circle r="7" fill="#A8D5C8" stroke="#FFFDF8" stroke-width="2.2"/></g>
        `);
        api.cursor = api.svg.querySelector('#cursor');
        api.trail = api.svg.querySelector('#trail');
        api.bowl = api.svg.querySelector('#bowl');
        api.progress(0, '0%');
      },
      down(p, api) {
        api.cursor.setAttribute('transform', `translate(${p.x},${p.y})`);
      },
      move(p, api) {
        api.cursor.setAttribute('transform', `translate(${p.x},${p.y})`);
        let best = null, bestD = 1e9;
        for (const q of pts) {
          if (q.hit) continue;
          const d = Math.hypot(q.x - p.x, q.y - p.y);
          if (d < bestD) { bestD = d; best = q; }
        }
        if (best && bestD < 34) {
          // 标记附近一小段为已覆盖
          for (const q of pts) {
            if (!q.hit && Math.hypot(q.x - best.x, q.y - best.y) < 16) {
              q.hit = true; visited += 1;
              api.trail.insertAdjacentHTML('beforeend', `<circle cx="${q.x}" cy="${q.y}" r="2.6" fill="#F7DFA6" opacity=".95"/>`);
            }
          }
          dev += bestD; samples += 1;
          api.progress(visited / pts.length, `${Math.round(visited / pts.length * 100)}%`);
          if (visited / pts.length >= 0.9) {
            const avg = samples ? dev / samples : 20;
            const q = clamp(1 - avg / 34, 0, 1);
            api.finish(q > 0.7 ? 'perfect' : q > 0.4 ? 'good' : 'miss');
          }
        }
      },
      up() {},
      tick(dt, api) {
        if (api.st.active) return;
        // 她自己淋：按时间匀速走完整条螺旋
        autoAcc += (pts.length / (node.duration * 0.9)) * dt;
        let add = Math.floor(autoAcc);
        autoAcc -= add;
        while (add-- > 0) {
          const q = pts.find((p) => !p.hit);
          if (!q) break;
          q.hit = true; visited += 1;
          api.trail.insertAdjacentHTML('beforeend', `<circle cx="${q.x}" cy="${q.y}" r="2.2" fill="#F7DFA6" opacity=".6"/>`);
        }
        api.progress(visited / pts.length, `${Math.round(visited / pts.length * 100)}%`);
      }
    });
  }

  /* ---------- 7. 盛 ---------- */
  function plate(node, ctx) {
    let dragging = false, pos = { x: 250, y: 196 }, downOffset = { x: 0, y: 0 };
    return makeOp(node, ctx, {
      start(api) {
        api.add(`
          <ellipse cx="438" cy="252" rx="88" ry="26" fill="#FBF7EE" stroke="#E1D6C2" stroke-width="1.4"/>
          <ellipse cx="438" cy="248" rx="70" ry="19" fill="#FFFDF8"/>
          <g id="food">
            <ellipse cx="250" cy="200" rx="66" ry="20" fill="#E9C4A9"/>
            <ellipse cx="250" cy="196" rx="58" ry="15" fill="#D99C7E"/>
            <path d="M196 196 q16 -8 30 0 q16 8 30 0 q16 -8 28 0" fill="none" stroke="#F7DFA6" stroke-width="2.6" stroke-linecap="round"/>
          </g>
          <path d="M320 210 q50 -6 82 -2" fill="none" stroke="#A8D5C8" stroke-width="2" stroke-dasharray="5 7" opacity=".85"/>
          <text x="360" y="196" font-family="system-ui" font-size="9" fill="#8B8272">拖到盘子上</text>
        `);
        api.food = api.svg.querySelector('#food');
        api.progress(0, '');
      },
      down(p, api) {
        if (Math.hypot(p.x - pos.x, p.y - pos.y) < 90) {
          dragging = true;
          downOffset = { x: p.x - pos.x, y: p.y - pos.y };
        }
      },
      move(p, api) {
        if (!dragging) return;
        pos = { x: clamp(p.x - downOffset.x, 120, 430), y: clamp(p.y - downOffset.y, 150, 250) };
        api.food.setAttribute('transform', `translate(${pos.x - 250},${pos.y - 196})`);
        const d = Math.hypot(438 - pos.x, 238 - pos.y);
        api.progress(clamp(1 - d / 240, 0, 1), '');
      },
      up(p, api) {
        if (!dragging) return;
        dragging = false;
        const d = Math.hypot(438 - pos.x, 238 - pos.y);
        if (d < 120) api.finish(d < 46 ? 'perfect' : d < 90 ? 'good' : 'miss');
      },
      tick(dt, api) {
        if (api.st.active || dragging) return;
        // 她自己往盘子里挪，慢一些
        const k = 0.5 + ctx.skill() * 0.4;
        pos.x += (438 - pos.x) * dt * 0.5 * k;
        pos.y += (238 - pos.y) * dt * 0.5 * k;
        api.food.setAttribute('transform', `translate(${pos.x - 250},${pos.y - 196})`);
        const d = Math.hypot(438 - pos.x, 238 - pos.y);
        api.progress(clamp(1 - d / 240, 0, 1), '');
      }
    });
  }

  const MAP = { chop, pour, stir, roll, press, drizzle, plate };

  function create(node, ctx) {
    const fn = MAP[node.type];
    if (!fn) return null;
    return fn(node, ctx);
  }

  return { create };
})();
