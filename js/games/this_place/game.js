// 自动加载 Google 3D 渲染器
if (!customElements.get('model-viewer')) {
  const s = document.createElement('script');
  s.type = 'module';
  s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
  document.head.appendChild(s);
}

const SAVE_KEY = 'this_place_save_data';

let state = {
  money: 500,
  affection: 20,
  hunger: 60,
  dialogue: '“你回来啦？今天累不累，我做了你爱吃的，快坐～”'
};

function loadSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try { Object.assign(state, JSON.parse(raw)); } catch (e) {}
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function renderGame(container) {
  loadSave();

  container.innerHTML = `
    <div style="position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; background: #f6f7fb; overflow: hidden; user-select: none;">
      
      <!-- 气泡台词 -->
      <div id="tp-bubble" style="
        position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
        background: rgba(255,255,255,0.95); padding: 12px 18px; border-radius: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.06); font-size: 13px; color: #333;
        width: 82%; text-align: center; z-index: 10; transition: transform 0.2s;
      ">${state.dialogue}</div>

      <!-- 3D 舞台区域 (手机单指滑动可 360° 旋转，双指可缩放) -->
      <div style="flex: 1; position: relative;">
        <model-viewer 
          src="https://modelviewer.dev/shared-assets/models/Astronaut.glb" 
          auto-rotate 
          camera-controls 
          rotation-per-second="20deg"
          shadow-intensity="1"
          style="width: 100%; height: 100%; outline: none;">
        </model-viewer>
      </div>

      <!-- 底部面板 -->
      <div style="background: #fff; padding: 16px 20px 24px; border-top-left-radius: 24px; border-top-right-radius: 24px; box-shadow: 0 -4px 20px rgba(0,0,0,0.05); z-index: 10;">
        <div style="display: flex; justify-content: space-around; margin-bottom: 14px; font-size: 13px; color: #777;">
          <div>零花钱: <b style="color: #ff4757; font-size: 15px;">￥<span id="tp-money">${state.money}</span></b></div>
          <div>TA对我的羁绊: <b style="color: #ff4757; font-size: 15px;"><span id="tp-aff">${state.affection}</span></b></div>
          <div>饱腹度: <b style="color: #2ed573; font-size: 15px;"><span id="tp-hunger">${state.hunger}</span>%</b></div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button id="btn-money" style="padding: 12px; border: none; border-radius: 12px; background: #ffeaa7; color: #d63031; font-weight: bold; font-size: 13px; cursor: pointer;">💸 要零花钱</button>
          <button id="btn-feed" style="padding: 12px; border: none; border-radius: 12px; background: #fab1a0; color: #d63031; font-weight: bold; font-size: 13px; cursor: pointer;">🍱 让TA投喂</button>
          <button id="btn-touch" style="padding: 12px; border: none; border-radius: 12px; background: #a8e6cf; color: #1b4332; font-weight: bold; font-size: 13px; cursor: pointer;">✨ 摸摸TA</button>
          <button id="btn-sleep" style="padding: 12px; border: none; border-radius: 12px; background: #dfe6e9; color: #2d3436; font-weight: bold; font-size: 13px; cursor: pointer;">💤 一起躺平</button>
        </div>
      </div>

    </div>
  `;

  const update = (text) => {
    state.dialogue = text;
    const bubble = container.querySelector('#tp-bubble');
    if (bubble) {
      bubble.innerText = text;
      bubble.style.transform = 'translateX(-50%) scale(1.04)';
      setTimeout(() => bubble.style.transform = 'translateX(-50%) scale(1)', 150);
    }
    container.querySelector('#tp-money').innerText = state.money;
    container.querySelector('#tp-aff').innerText = state.affection;
    container.querySelector('#tp-hunger').innerText = state.hunger;
    saveState();
  };

  container.querySelector('#btn-money').onclick = () => {
    const get = Math.floor(Math.random() * 80) + 120;
    state.money += get;
    state.affection += 2;
    update(`“刚给你转了 ¥${get}，想吃什么随便买，不够再找我要～”`);
  };

  container.querySelector('#btn-feed').onclick = () => {
    if (state.hunger >= 100) return update("“肚子都圆滚滚的啦，再吃就要积食了哦～”");
    state.hunger = Math.min(100, state.hunger + 20);
    state.affection += 3;
    update("“今天做了你最喜欢的点心，张嘴，啊——”");
  };

  container.querySelector('#btn-touch').onclick = () => {
    state.affection += 5;
    update("“（被摸得愣了一下，脸颊微红）……你今天也很黏人呢。”");
  };

  container.querySelector('#btn-sleep').onclick = () => {
    update("“被窝弄得暖融融的了，有我在，安心睡吧。晚安。”");
  };
}
