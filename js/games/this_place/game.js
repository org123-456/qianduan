// 此间归处 - 3D陪伴 + 出门旅行 + 私人饲养日记 + 纪念品系统

if (!customElements.get('model-viewer')) {
  const s = document.createElement('script');
  s.type = 'module';
  s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
  document.head.appendChild(s);
}

// 移植自 world.ts 的核心地点与掉落特产配置
const PLACES = [
  { id: 'forest', name: '雾杉林屋', travelTime: 20000, souvenirs: ['纹路松果', '林间药草', '软帽蘑菇'], letter: '林间的雾气很轻，捡了枚好看的松果，想带回去给你看。' },
  { id: 'hill', name: '风铃山村', travelTime: 15000, souvenirs: ['羊毛挂饰', '香草束', '甜味野果'], letter: '屋檐下的风铃响了一下午，忽然觉得这样的安宁应该和你一起看。' },
  { id: 'station', name: '银杏站郊', travelTime: 25000, souvenirs: ['纪念车票', '手绘地图', '站台便当'], letter: '列车来来往往，买了两张旧车票，等下次带你一起坐。' },
  { id: 'lake', name: '月湖木屋', travelTime: 30000, souvenirs: ['月光玻璃石', '芦苇小哨', '湖畔鱼干'], letter: '夜里的湖面像镜子一样，捡到一块发光的石头，贴身带回来了。' },
  { id: 'coast', name: '潮汐小镇', travelTime: 35000, souvenirs: ['潮纹贝壳', '海盐晶袋', '远方护符'], letter: '海风有点大，在沙滩上吹了一会儿，贝壳很漂亮，送给你。' }
];

const SAVE_KEY = 'this_place_nest_save';

// 初始状态
let state = {
  playerName: '你',
  petName: 'TA',
  money: 500,
  affection: 20,
  hunger: 60,
  dialogue: '“你回来啦？累不累，我做了你爱吃的，快坐下歇歇～”',
  // 旅行状态: idle(在家) | traveling(旅途中)
  travelState: {
    status: 'idle',
    targetPlace: null,
    returnTime: 0
  },
  // 私人饲养日记 (来自 model.ts/engine.ts)
  caretakerJournal: [
    { time: '初始', text: '刚把TA安顿进小窝，懵懵懂懂的样子，总想依赖人，得多准备点零花钱照料好。' }
  ],
  // 收集到的专属纪念物
  keepsakes: []
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

// 写入 TA 的私人日记
function addJournal(text) {
  const now = new Date();
  const timeStr = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  state.caretakerJournal.unshift({ time: timeStr, text });
  if (state.caretakerJournal.length > 50) state.caretakerJournal.pop();
  saveState();
}

export function renderGame(container) {
  loadSave();

  // 检查旅行是否已经完成
  if (state.travelState.status === 'traveling' && Date.now() >= state.travelState.returnTime) {
    const place = state.travelState.targetPlace;
    const souvenir = place.souvenirs[Math.floor(Math.random() * place.souvenirs.length)];
    state.keepsakes.unshift({
      id: Date.now(),
      name: souvenir,
      placeName: place.name,
      letter: place.letter,
      time: new Date().toLocaleDateString()
    });
    state.travelState.status = 'idle';
    state.travelState.targetPlace = null;
    state.dialogue = `“我从【${place.name}】回来啦！给你带了专属特产【${souvenir}】，还给你写了信！”`;
    addJournal(`从${place.name}回来了。一进门看TA眼巴巴等在门口的样子，把特产递过去时开心得不行，真好养。`);
    saveState();
  }

  const isTraveling = state.travelState.status === 'traveling';

  container.innerHTML = `
    <div style="position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; background: #f6f7fb; overflow: hidden; user-select: none; font-family: -apple-system, sans-serif;">
      
      <!-- 顶栏：查看日记与特产背包 -->
      <div style="position: absolute; top: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; z-index: 20;">
        <button id="btn-open-journal" style="background: rgba(255,255,255,0.9); border: 1px solid #eee; padding: 6px 14px; border-radius: 18px; font-size: 12px; font-weight: bold; color: #555; box-shadow: 0 2px 8px rgba(0,0,0,0.06); cursor: pointer;">
          📖 私人饲养日记
        </button>
        <button id="btn-open-bag" style="background: rgba(255,255,255,0.9); border: 1px solid #eee; padding: 6px 14px; border-radius: 18px; font-size: 12px; font-weight: bold; color: #555; box-shadow: 0 2px 8px rgba(0,0,0,0.06); cursor: pointer;">
          🎒 特产与情书 (<span id="bag-count">${state.keepsakes.length}</span>)
        </button>
      </div>

      <!-- 台词气泡 -->
      <div id="tp-bubble" style="
        position: absolute; top: 52px; left: 50%; transform: translateX(-50%);
        background: rgba(255,255,255,0.96); padding: 12px 18px; border-radius: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.06); font-size: 13px; color: #333;
        width: 82%; text-align: center; z-index: 10; transition: transform 0.2s;
      ">${isTraveling ? `“正在前往【${state.travelState.targetPlace.name}】的路上，很快就给你带特产回来～”` : state.dialogue}</div>

      <!-- 3D 舞台区域 -->
      <div style="flex: 1; position: relative;">
        ${isTraveling ? `
          <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px; animation: bounce 1.5s infinite;">🧳</div>
            <div style="font-size: 14px; font-weight: bold; color: #444;">TA 去采风旅行了……</div>
            <div style="font-size: 12px; margin-top: 6px; color: #aaa;">目的地：${state.travelState.targetPlace.name}</div>
            <div style="font-size: 11px; margin-top: 4px; color: #ff6b81;" id="travel-countdown">预计返程中...</div>
          </div>
        ` : `
          <model-viewer 
            src="https://modelviewer.dev/shared-assets/models/Astronaut.glb" 
            auto-rotate 
            camera-controls 
            rotation-per-second="20deg"
            shadow-intensity="1"
            style="width: 100%; height: 100%; outline: none;">
          </model-viewer>
        `}
      </div>

      <!-- 底部面板 -->
      <div style="background: #fff; padding: 16px 20px 24px; border-top-left-radius: 24px; border-top-right-radius: 24px; box-shadow: 0 -4px 20px rgba(0,0,0,0.05); z-index: 10;">
        <div style="display: flex; justify-content: space-around; margin-bottom: 14px; font-size: 13px; color: #777;">
          <div>零花钱: <b style="color: #ff4757; font-size: 15px;">￥<span id="tp-money">${state.money}</span></b></div>
          <div>TA对我的羁绊: <b style="color: #ff4757; font-size: 15px;"><span id="tp-aff">${state.affection}</span></b></div>
          <div>饱腹感: <b style="color: #2ed573; font-size: 15px;"><span id="tp-hunger">${state.hunger}</span>%</b></div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button id="btn-money" ${isTraveling ? 'disabled style="opacity:0.5"' : ''} style="padding: 12px; border: none; border-radius: 12px; background: #ffeaa7; color: #d63031; font-weight: bold; font-size: 13px; cursor: pointer;">💸 要零花钱</button>
          <button id="btn-feed" ${isTraveling ? 'disabled style="opacity:0.5"' : ''} style="padding: 12px; border: none; border-radius: 12px; background: #fab1a0; color: #d63031; font-weight: bold; font-size: 13px; cursor: pointer;">🍱 让TA投喂</button>
          <button id="btn-touch" ${isTraveling ? 'disabled style="opacity:0.5"' : ''} style="padding: 12px; border: none; border-radius: 12px; background: #a8e6cf; color: #1b4332; font-weight: bold; font-size: 13px; cursor: pointer;">✨ 摸摸TA</button>
          <button id="btn-travel" ${isTraveling ? 'disabled style="opacity:0.5"' : ''} style="padding: 12px; border: none; border-radius: 12px; background: #dff9fb; color: #130f40; font-weight: bold; font-size: 13px; cursor: pointer;">🎒 催TA出门旅行</button>
        </div>
      </div>

      <!-- 弹窗容器 -->
      <div id="tp-modal" style="display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; justify-content: center; align-items: flex-end;">
        <div style="background: white; width: 100%; max-height: 75vh; border-top-left-radius: 24px; border-top-right-radius: 24px; padding: 20px; overflow-y: auto; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 id="modal-title" style="margin: 0; font-size: 16px;">弹窗</h3>
            <button id="btn-close-modal" style="border: none; background: #eee; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;">✕</button>
          </div>
          <div id="modal-content" style="font-size: 13px; line-height: 1.6; color: #555;"></div>
        </div>
      </div>

    </div>
  `;

  const modal = container.querySelector('#tp-modal');
  const modalTitle = container.querySelector('#modal-title');
  const modalContent = container.querySelector('#modal-content');

  container.querySelector('#btn-close-modal').onclick = () => { modal.style.display = 'none'; };

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

  // 1. 要零花钱
  if (!isTraveling) {
    container.querySelector('#btn-money').onclick = () => {
      const get = Math.floor(Math.random() * 80) + 120;
      state.money += get;
      state.affection += 2;
      update(`“刚给你转了 ¥${get}，想吃什么随便买，不够再找我要～”`);
      addJournal(`今天又找我要零钱了，撒娇的样子根本没法拒绝，直接给塞了 ¥${get}。真不知道是谁在养谁。`);
    };

    // 2. 投喂
    container.querySelector('#btn-feed').onclick = () => {
      if (state.hunger >= 100) return update("“肚子都圆滚滚的啦，再吃就要积食了哦～”");
      state.hunger = Math.min(100, state.hunger + 20);
      state.affection += 3;
      update("“今天做了你最喜欢的点心，张嘴，啊——”");
      addJournal('给TA热了点心，吃得嘴角都是碎屑，伸手帮TA擦掉的时候乖乖站着不动，好软。');
    };

    // 3. 摸摸
    container.querySelector('#btn-touch').onclick = () => {
      state.affection += 5;
      update("“（被摸得愣了一下，脸颊微红）……你今天也很黏人呢。”");
      addJournal('今天被毫无征兆地摸了头，脸有点热，顺手捏了捏TA的脸蛋，手感真好。');
    };

    // 4. 催 TA 出门旅行 (选择 5 个地点之一)
    container.querySelector('#btn-travel').onclick = () => {
      modalTitle.innerText = "选择让 TA 采风的地点";
      modalContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${PLACES.map(p => `
            <div class="place-opt" data-id="${p.id}" style="border: 1px solid #eee; padding: 12px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #fafafa;">
              <div>
                <div style="font-weight: bold; color: #333;">${p.name}</div>
                <div style="font-size: 11px; color: #888; margin-top: 3px;">可能特产：${p.souvenirs.join('、')}</div>
              </div>
              <button style="padding: 6px 12px; border: none; border-radius: 8px; background: #ff6b81; color: white; font-size: 12px; cursor: pointer;">出发 ›</button>
            </div>
          `).join('')}
        </div>
      `;
      modal.style.display = 'flex';

      modalContent.querySelectorAll('.place-opt').forEach(opt => {
        opt.onclick = () => {
          const place = PLACES.find(p => p.id === opt.dataset.id);
          state.travelState = {
            status: 'traveling',
            targetPlace: place,
            returnTime: Date.now() + place.travelTime
          };
          addJournal(`收拾好行囊出发去【${place.name}】了。答应了要给家里那个小笨蛋带特产和写信，早点办完早点回家。`);
          saveState();
          modal.style.display = 'none';
          renderGame(container);
        };
      });
    };
  }

  // 查看私人日记
  container.querySelector('#btn-open-journal').onclick = () => {
    modalTitle.innerText = "TA 的私人饲养日记 📖 (仅自己可见)";
    modalContent.innerHTML = state.caretakerJournal.length === 0 ? '<p>还没有日记记录。</p>' : `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${state.caretakerJournal.map(j => `
          <div style="background: #fff9e6; border-left: 3px solid #f1c40f; padding: 10px 12px; border-radius: 4px;">
            <div style="font-size: 11px; color: #999; margin-bottom: 4px;">${j.time}</div>
            <div style="color: #444; font-size: 13px; line-height: 1.5;">${j.text}</div>
          </div>
        `).join('')}
      </div>
    `;
    modal.style.display = 'flex';
  };

  // 查看背包：特产与情书
  container.querySelector('#btn-open-bag').onclick = () => {
    modalTitle.innerText = "带给你的专属特产与情书 💌";
    modalContent.innerHTML = state.keepsakes.length === 0 ? '<p style="text-align: center; color: #999; padding: 20px 0;">柜子里空空的，快催 TA 出门带特产回来吧！</p>' : `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${state.keepsakes.map(k => `
          <div style="background: #fdf2f4; border: 1px solid #fcdbdf; padding: 12px; border-radius: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: bold; color: #ff4757; font-size: 14px;">🎁 ${k.name}</span>
              <span style="font-size: 11px; color: #aaa;">来自 ${k.placeName} · ${k.time}</span>
            </div>
            <div style="font-size: 12px; color: #555; background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 8px; font-style: italic;">
              “${k.letter}”
            </div>
          </div>
        `).join('')}
      </div>
    `;
    modal.style.display = 'flex';
  };
}
