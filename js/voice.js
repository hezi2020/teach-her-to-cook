/* 语音输入（Web Speech API）：说话 → 文字 → 交给 Game.say。
   同时提供她的语音播报，可单独关闭。 */

const Voice = (() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let listening = false;
  let ttsOn = true;
  let onText = null;
  let micBtn = null;
  let ttsBtn = null;
  let input = null;

  function init({ onText: cb }) {
    onText = cb;
    micBtn = document.getElementById('micBtn');
    ttsBtn = document.getElementById('ttsBtn');
    input = document.getElementById('cmdInput');

    if (!SR) {
      micBtn.style.opacity = '.45';
      micBtn.title = '当前浏览器不支持语音识别（建议 Chrome / Edge）';
      micBtn.addEventListener('click', () => toast('这个浏览器不支持语音识别，试试 Chrome 或 Edge'));
    } else {
      rec = new SR();
      rec.lang = 'zh-CN';
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        listening = true;
        micBtn.classList.add('listening');
        input.classList.add('listening');
        input.placeholder = '我在听…';
      };
      rec.onresult = (e) => {
        let interim = '';
        let finalText = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalText += t;
          else interim += t;
        }
        input.value = finalText || interim;
        if (finalText) {
          onText && onText(finalText.trim());
          input.value = '';
        }
      };
      rec.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          toast('麦克风权限被拒绝，请在地址栏允许麦克风');
        } else if (e.error === 'no-speech') {
          toast('没听到声音，再试一次');
        } else if (e.error === 'network') {
          toast('语音服务需要联网');
        }
      };
      rec.onend = () => {
        listening = false;
        micBtn.classList.remove('listening');
        input.classList.remove('listening');
        input.placeholder = '对她说点什么…';
      };

      micBtn.addEventListener('click', toggle);
    }

    if (ttsBtn) {
      ttsBtn.classList.toggle('off', !ttsOn);
      ttsBtn.addEventListener('click', () => {
        ttsOn = !ttsOn;
        ttsBtn.classList.toggle('off', !ttsOn);
        if (!ttsOn && window.speechSynthesis) speechSynthesis.cancel();
        toast(ttsOn ? '她的声音：开' : '她的声音：关');
      });
    }

    if (window.speechSynthesis) {
      // 预热语音列表，部分浏览器需要一次访问才会返回中文音色
      speechSynthesis.getVoices();
    }
  }

  function toggle() {
    if (!rec) return;
    if (listening) {
      rec.stop();
      return;
    }
    try {
      if (window.speechSynthesis) speechSynthesis.cancel();
      rec.start();
    } catch (err) {
      // 连续点击时 start 会抛错，忽略
    }
  }

  function speak(text) {
    if (!ttsOn || !window.speechSynthesis || !text) return;
    const clean = String(text).replace(/[「」『』]/g, '').trim();
    if (!clean) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'zh-CN';
    u.rate = 1.02;
    u.pitch = 1.12;
    u.volume = 0.92;
    const voices = speechSynthesis.getVoices();
    const zh = voices.find((v) => /zh|Chinese|Xiaoxiao|Huihui|Yaoyao/i.test(v.lang + v.name));
    if (zh) u.voice = zh;
    speechSynthesis.speak(u);
  }

  let toastTimer = null;
  function toast(text) {
    if (typeof UI !== 'undefined' && UI.toast) UI.toast(text);
    else console.log(text);
  }

  return { init, speak, toggle };
})();
