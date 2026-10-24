/* Live2D 加载与表情控制。加载失败时降级为静态立绘。 */

const Live2D = (() => {
  const MODEL_URL = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display@0.4.0/test/assets/haru/haru_greeter_t03.model3.json';
  const FALLBACK_URL = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20Japanese%20cooking%20assistant%20girl%20flat%20anime%20illustration%20soft%20mint%20green%20cream%20apron%20short%20dark%20hair%20gentle%20smile%20standing%20full%20body%20plain%20white%20background%20clean%20minimal%20line%20art&image_size=portrait_4_3';

  let app = null;
  let model = null;
  let ready = false;
  const listeners = new Set();

  function notify(state) {
    listeners.forEach((fn) => fn(state));
  }

  function useFallback(img, reason) {
    ready = false;
    notify({ mode: 'fallback', reason });
    if (img) {
      img.src = FALLBACK_URL;
      img.hidden = false;
      img.style.display = 'block';
    }
  }

  async function init({ canvas, container, fallbackImg }) {
    if (!window.PIXI || !PIXI.live2d || !window.Live2DCubismCore) {
      useFallback(fallbackImg, 'runtime-missing');
      return;
    }

    try {
      app = new PIXI.Application({
        view: canvas,
        transparent: true,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        resizeTo: container
      });
      app.renderer.backgroundAlpha = 0;

      model = await PIXI.live2d.Live2DModel.from(MODEL_URL, { autoInteract: false });
      app.stage.addChild(model);
      model.anchor.set(0.5, 1);
      fit();

      model.on('hit', () => {
        if (model) {
          model.motion('Tap');
          setExpression('proud');
          notify({ mode: 'hit' });
        }
      });

      ready = true;
      notify({ mode: 'live2d' });
    } catch (err) {
      console.warn('[Live2D] 加载失败，降级为静态立绘', err);
      useFallback(fallbackImg, 'load-failed');
    }
  }

  /* 半身取景：只露头部到腰部，放大后底边裁掉下半身。
     比例基于模型包围盒：头顶约在 9% 处，腰部约在 58% 处。 */
  function fit() {
    if (!model || !app) return;
    const w = app.renderer.width / app.renderer.resolution;
    const h = app.renderer.height / app.renderer.resolution;
    if (!w || !h) return;
    const HEAD_TOP = 0.09;
    const WAIST = 0.58;
    const HEAD_PAD = 8;
    const baseH = model.height / (model.scale.y || 1);
    if (!baseH) return;
    const shownH = (h - HEAD_PAD) / (WAIST - HEAD_TOP); // 模型包围盒的渲染高度
    model.scale.set(shownH / baseH);
    model.x = w / 2;
    model.y = HEAD_PAD - HEAD_TOP * shownH + shownH;
  }

  function setExpression(key) {
    const conf = EXPRESSIONS[key] || EXPRESSIONS.calm;
    if (ready && model) {
      try {
        model.expression(conf.index);
      } catch (err) {
        console.warn('[Live2D] 表情切换失败', err);
      }
    }
    document.dispatchEvent(new CustomEvent('live2d:expression', { detail: { key, conf } }));
  }

  function onState(fn) { listeners.add(fn); }
  function isReady() { return ready; }

  window.addEventListener('resize', () => { if (ready) fit(); });

  return { init, setExpression, onState, isReady, FALLBACK_URL };
})();
