/* 启动：适配窗口、初始化界面与 Live2D。 */

(() => {
  const stage = document.getElementById('stage');
  const canvas = document.getElementById('live2d');
  const fallback = document.getElementById('fallback');
  const charwrap = document.getElementById('charwrap');

  function fit() {
    const scale = Math.min((window.innerWidth - 32) / 1180, (window.innerHeight - 32) / 664);
    stage.style.transform = `scale(${Math.min(scale, 1.2)})`;
  }

  window.addEventListener('resize', fit);
  fit();

  document.addEventListener('DOMContentLoaded', async () => {
    fit();
    Game.init();

    Live2D.onState((state) => {
      if (state.mode === 'live2d') {
        fallback.hidden = true;
        canvas.style.visibility = 'visible';
      }
      if (state.mode === 'fallback') {
        canvas.style.visibility = 'hidden';
      }
      if (state.mode === 'hit') {
        UI.setBubble('怎么啦？我手上还有东西呢。');
        UI.setExpressionLabel('proud');
        setTimeout(() => {
          if (Game.state.phase === 'playing' && Game.state.dish) {
            UI.setBubble(Game.state.dish.nodes[Game.state.nodeIndex].her);
            UI.setExpressionLabel('focus');
          }
        }, 2200);
      }
    });

    fallback.addEventListener('click', () => {
      UI.setExpressionLabel('proud');
      UI.setBubble('怎么啦？我手上还有东西呢。');
    });

    await Live2D.init({ canvas, container: charwrap, fallbackImg: fallback });
  });
})();
