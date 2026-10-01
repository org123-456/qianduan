// 此间归处 - 崩铁·不死途 沉浸式全屏 + 实时接入大模型（LLM动态台词与日记）

const BASE_URL = 'https://cdn.jsdelivr.net/gh/org123-456/qianduan@main/js/games/this_place/';

const ASSETS = {
  rooms: {
    day: BASE_URL + 'room_day.png',
    dusk: BASE_URL + 'room_dusk.png',
    night: BASE_URL + 'room_night.png',
    autumn: BASE_URL + 'room_autumn.png',
    winter: BASE_URL + 'room_winter.png'
  },
  characters: {
    idle: BASE_URL + 'ashveil_idle.png',
    shy: BASE_URL + 'ashveil_shy.png',
    hand: BASE_URL + 'ashveil_hand.png'
  },
  photos: {
    forest: BASE_URL + 'photo_forest.png',
    hill: BASE_URL + 'photo_hill.png',
    coast: BASE_URL + 'photo_coast.png',
    lake: BASE_URL + 'photo_lake.png',
    station: BASE_URL + 'photo_station.png'
  }
};

const PLACES = [
  { id: 'forest', name: '雾杉林屋', travelTime: 12000, souvenirs: ['纹路松果', '林间药草'], photoKey: 'forest' },
  { id: 'hill', name: '风铃山村', travelTime: 10000, souvenirs: ['羊毛挂饰', '香草束'], photoKey: 'hill' },
  { id: 'station', name: '银杏站郊', travelTime: 15000, souvenirs: ['纪念车票', '站台便当'], photoKey: 'station' },
  { id: 'lake', name: '月湖木屋', travelTime: 18000, souvenirs: ['月光玻璃石', '芦苇小哨'], photoKey: 'lake' },
  { id: 'coast', name: '潮汐小镇', travelTime: 20000, souvenirs: ['潮纹贝壳', '海盐晶袋'], photoKey: 'coast' }
];

const SAVE_KEY = 'this_place_ai_save_v1';
const AI_CONFIG_KEY = 'this_place_ai_config';

let state = {
  money: 500,
  affection: 20,
  hunger: 60,
  dialogue: '“小窝很安静，正好陪我待一会儿。”',
  travelState: {
    status: 'idle',
    targetPlace: null,
    returnTime: 0
  },
  caretakerJournal: [
    { time: '初始', text: '把这只小家伙接进来了。看起来毫无防备心，得看紧点，别让人欺负了去。' }
  ],
  polaroids: []
};

// 大模型默认配置（支持自定义）
let aiConfig = {
  endpoint: 'https://api.deepseek.com/v1/chat/completions',
  apiKey: '',
  model: 'deepseek-chat'
};

function loadSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try { Object.assign(state, JSON.parse(raw)); } catch (e) {}
  }
  const rawAi = localStorage.getItem(AI_CONFIG_KEY);
  if (rawAi) {
    try { Object.assign(aiConfig, JSON.parse(rawAi)); } catch (e) {}
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function saveAiConfig() {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(aiConfig));
}

// 🐺 调用大模型生成不死途的实时台词/日记
async function askAshveil(systemPrompt, userPrompt, fallbackText) {
  if (!aiConfig.apiKey) return fallbackText;

  try {
    const res = await fetch(aiConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey.trim()}`
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 150
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || fallbackText;
  } catch (err) {
    console.warn('AI生成失败，使用本地兜底:', err);
    return fallbackText;
  }
}

const ASHVEIL_SYSTEM = `你是《崩坏：星穹铁道》的不死途（Ashveil）。成熟从容、沉稳、略带慵懒与宠溺气质的领头狼。你与玩家同居在温馨小屋里，你照料TA、给TA零花钱、做饭。你不是装腔作势的霸总，而是极具生活感、靠谱、偶尔会无奈纵容但心疼TA的同居伴侣。请用简短一两句话（不超过35字）回应，语气低沉温柔、带浅浅笑意，包含适当的动作描写。`;

function addJournal(text) {
  const now = new Date();
  const timeStr = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  state.caretakerJournal.unshift({ time: timeStr, text });
  if (state.caretakerJournal.length > 50) state.caretakerJournal.pop();
  saveState();
}

function getAutoRoom() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const hour = now.getHours();
  if (month === 12 || month === 1 || month === 2) return ASSETS.rooms.winter;
  if (month >= 9 && month <= 11) return ASSETS.rooms.autumn;
  if (hour >= 17 && hour < 19) return ASSETS.rooms.dusk;
  if (hour >= 19 || hour < 6) return ASSETS.rooms.night;
  return ASSETS.rooms.day;
}

export function renderGame(container) {
  loadSave();

  // 结算旅行返回
  if (state.travelState.status === 'traveling' && Date.now() >= state.travelState.returnTime) {
    const place = state.travelState.targetPlace;
    const souvenir = place.souvenirs[Math.floor(Math.random() * place.souvenirs.length)];
    
    // 异步生成情书
    (async () => {
      const fallbackLetter = `从${place.name}给你带了${souvenir}。林风很轻，想带你一起来看。`;
      const letter = await askAshveil(
        `你是崩铁的不死途。你刚从旅行地【${place.name}】采风归来，给留在家里的伴侣带回了特产【${souvenir}】。请为拍立得背面写一段简短的手写随笔情书（40字左右），浪漫、生活化、字迹温存。`,
        `请写一段给TA的手写留言。`,
        fallbackLetter
      );

      state.polaroids.unshift({
        id: Date.now(),
        placeName: place.name,
        photoUrl: ASSETS.photos[place.photoKey],
        souvenir: souvenir,
        letter: letter,
        date: new Date().toLocaleDateString()
      });

      state.travelState.status = 'idle';
      state.travelState.targetPlace = null;
      state.dialogue = `“我回来了。特产【${souvenir}】给你带到了，拍立得也挂在风铃上了，翻过来看看？”`;
      saveState();

      // AI 写回来的日记
      const journalText = await askAshveil(
        `你是崩铁的不死途。请用私人观察日记口吻记录：你从【${place.name}】出游回家，伴侣看到你和特产时的反应（30字左右，宠溺、生活化）。`,
        `记录这篇日记。`,
        `从${place.name}回来，把照片夹在风铃上。某人凑过来看手写字的样子，可爱得要命。`
      );
      addJournal(journalText);
      renderGame(container);
    })();
  }

  const isTraveling = state.travelState.status === 'traveling';
  const currentRoom = getAutoRoom();

  container.innerHTML = `
    <style>
      @keyframes chimeSway {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(2.5deg); }
      }
      @keyframes gentleBreath {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
      .ashveil-char-wrap {
        animation: gentleBreath 4s ease-in-out infinite;
        transition: transform 0.15s ease;
      }
      .windchime-line {
        animation: chimeSway 5s ease-in-out infinite;
        transform-origin: top center;
      }
      .flip-card {
        background-color: transparent;
        width: 290px;
        height: 420px;
        perspective: 1000px;
        cursor: pointer;
      }
      .flip-card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        text-align: center;
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
      }
      .flip-card.flipped .flip-card-inner {
        transform: rotateY(180deg);
      }
      .flip-card-front, .flip-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        border-radius: 12px;
        box-shadow: 0 15px 35px rgba(0,0,0,0.3);
      }
      .flip-card-front {
        background: #fff;
        padding: 12px 12px 30px;
        box-sizing: border-box;
      }
      .flip-card-back {
        background: #fdfbf7;
        color: #333;
        transform: rotateY(180deg);
        padding: 24px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: left;
        border: 1px solid #eee;
      }
    </style>

    <!-- 真正全屏固定容器 -->
    <div id="true-fullscreen-box" style="position: fixed; inset: 0; width: 100vw; height: 100vh; background: #000; overflow: hidden; user-select: none; font-family: -apple-system, sans-serif; z-index: 9999;">
      
      <!-- 房间背景 -->
      <div style="position: absolute; inset: 0; background-image: url('${currentRoom}'); background-size: cover; background-position: center;">
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 40%, rgba(0,0,0,0.2) 100%);"></div>
      </div>

      <!-- 顶栏左侧：退出按钮 + 日记 + 风铃 -->
      <div style="position: absolute; top: calc(env(safe-area-inset-top, 16px) + 12px); left: 16px; display: flex; align-items: center; gap: 8px; z-index: 30;">
        <button id="btn-back-home" style="background: rgba(0,0,0,0.45); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2); width: 34px; height: 34px; border-radius: 50%; color: white; font-size: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ✕
        </button>
        <button id="btn-open-journal" style="background: rgba(255,255,255,0.82); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6); padding: 7px 12px; border-radius: 18px; font-size: 11px; font-weight: bold; color: #2d3436; box-shadow: 0 4px 12px rgba(0,0,0,0.08); cursor: pointer;">
          📖 日记
        </button>
        <button id="btn-open-gallery" style="background: rgba(255,255,255,0.82); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6); padding: 7px 12px; border-radius: 18px; font-size: 11px; font-weight: bold; color: #2d3436; box-shadow: 0 4px 12px rgba(0,0,0,0.08); cursor: pointer;">
          🎐 风铃 (${state.polaroids.length})
        </button>
      </div>

      <!-- 顶栏右侧：状态胶囊 + ⚙️ 模型设置 -->
      <div style="position: absolute; top: calc(env(safe-area-inset-top, 16px) + 12px); right: 16px; display: flex; gap: 6px; z-index: 30;">
        <div style="background: rgba(255,255,255,0.82); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6); padding: 6px 10px; border-radius: 16px; font-size: 11px; color: #2d3436; font-weight: 500;">
          💰 <b style="color: #d63031;">￥<span id="tp-money">${state.money}</span></b>
        </div>
        <div style="background: rgba(255,255,255,0.82); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6); padding: 6px 10px; border-radius: 16px; font-size: 11px; color: #2d3436; font-weight: 500;">
          ❤️ <b style="color: #ff4757;"><span id="tp-aff">${state.affection}</span></b>
        </div>
        <button id="btn-open-ai-settings" style="background: rgba(255,255,255,0.82); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.6); width: 30px; height: 30px; border-radius: 50%; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          ⚙️
        </button>
      </div>

      <!-- 落地窗顶：微风拍立得悬挂风铃 -->
      ${state.polaroids.length > 0 ? `
        <div class="windchime-line" style="position: absolute; top: calc(env(safe-area-inset-top, 16px) + 54px); left: 0; right: 0; display: flex; gap: 12px; padding: 0 20px; overflow-x: auto; z-index: 25; scrollbar-width: none;">
          ${state.polaroids.slice(0, 6).map((item, idx) => `
            <div class="polaroid-clip" data-id="${item.id}" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; flex-shrink: 0;">
              <div style="width: 5px; height: 12px; background: #dfe6e9; border-radius: 2px; margin-bottom: -3px; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
              <div style="background: #ffffff; padding: 3px 3px 8px; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transform: rotate(${idx % 2 === 0 ? '-2deg' : '2deg'});">
                <img src="${item.photoUrl}" style="width: 44px; height: 58px; object-fit: cover; border-radius: 2px; display: block;" />
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- 台词气泡 -->
      <div id="tp-bubble" style="
        position: absolute; top: calc(env(safe-area-inset-top, 16px) + ${state.polaroids.length > 0 ? '146px' : '62px'}); left: 50%; transform: translateX(-50%);
        background: rgba(255,255,255,0.92); backdrop-filter: blur(14px); padding: 12px 20px; border-radius: 22px;
        box-shadow: 0 6px 22px rgba(0,0,0,0.14); font-size: 13px; color: #2d3436;
        width: 82%; text-align: center; z-index: 22; transition: all 0.25s ease; border: 1px solid rgba(255,255,255,0.85); line-height: 1.5;
      ">${isTraveling ? `“去【${state.travelState.targetPlace.name}】看看，不用跟来，乖乖等我。”` : state.dialogue}</div>

      <!-- 不死途立绘容器 -->
      <div style="position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; z-index: 10;">
        ${isTraveling ? `
          <div style="margin-bottom: 35vh; text-align: center; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); padding: 24px 34px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
            <div style="font-size: 52px; margin-bottom: 8px;">🧳</div>
            <div style="font-size: 15px; font-weight: bold; color: #2d3436;">不死途 正在采风中</div>
            <div style="font-size: 12px; color: #d63031; margin-top: 4px;">前往：${state.travelState.targetPlace.name}</div>
          </div>
        ` : `
          <div class="ashveil-char-wrap" style="height: 82%; width: 100%; display: flex; align-items: flex-end; justify-content: center; cursor: pointer;">
            <img id="char-img" src="${ASSETS.characters.idle}" style="
              height: 100%; max-width: 96vw; object-fit: contain; object-position: center bottom;
              filter: drop-shadow(0 14px 28px rgba(0,0,0,0.22));
              pointer-events: auto;
            " />
          </div>
        `}
      </div>

      <!-- 安排采风小按钮 -->
      <button id="btn-travel" ${isTraveling ? 'disabled style="opacity:0.4"' : ''} style="
        position: absolute; bottom: calc(env(safe-area-inset-bottom, 20px) + 14px); left: 20px; z-index: 30;
        background: rgba(255,255,255,0.88); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.7);
        padding: 10px 20px; border-radius: 24px; display: flex; align-items: center; gap: 6px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.14); cursor: pointer; color: #2d3436; font-size: 13px; font-weight: bold;
      ">
        <span>🎒</span> 安排采风
      </button>

      <!-- 拍立得 3D 翻转弹窗 -->
      <div id="tp-photo-modal" style="display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(12px); z-index: 100; justify-content: center; align-items: center; flex-direction: column;">
        <div id="photo-card" class="flip-card">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <img id="modal-photo-img" src="" style="width: 100%; height: 350px; object-fit: cover; border-radius: 6px;" />
              <div id="modal-photo-place" style="margin-top: 10px; font-weight: bold; color: #555; font-size: 13px;">地点名</div>
            </div>
            <div class="flip-card-back">
              <div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #dcdde1; padding-bottom: 8px; margin-bottom: 16px;">
                  <span style="font-size: 12px; color: #888;" id="modal-card-date">日期</span>
                  <span style="font-size: 12px; font-weight: bold; color: #d63031;" id="modal-card-souvenir">礼物</span>
                </div>
                <div id="modal-card-letter" style="font-size: 14px; line-height: 1.8; color: #2f3542; font-family: cursive, sans-serif;">
                  手写信内容...
                </div>
              </div>
              <div style="text-align: right; font-weight: bold; color: #57606f; font-size: 14px; font-family: cursive;">
                —— 不死途
              </div>
            </div>
          </div>
        </div>
        <div style="color: white; font-size: 12px; margin-top: 18px; opacity: 0.85;">💡 轻点卡片可翻转到背面查看手写字</div>
        <button id="btn-close-photo" style="margin-top: 14px; background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.4); color: white; padding: 7px 22px; border-radius: 20px; font-size: 12px; cursor: pointer;">收起</button>
      </div>

      <!-- 通用文字弹窗 -->
      <div id="tp-modal" style="display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); z-index: 90; justify-content: center; align-items: flex-end;">
        <div style="background: rgba(255,255,255,0.98); width: 100%; max-height: 75vh; border-top-left-radius: 26px; border-top-right-radius: 26px; padding: 22px; overflow-y: auto; display: flex; flex-direction: column; box-shadow: 0 -10px 40px rgba(0,0,0,0.2);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 id="modal-title" style="margin: 0; font-size: 16px; color: #2d3436;">弹窗</h3>
            <button id="btn-close-modal" style="border: none; background: #f1f2f6; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; color: #666;">✕</button>
          </div>
          <div id="modal-content" style="font-size: 13px; line-height: 1.6; color: #555;"></div>
        </div>
      </div>

    </div>
  `;

  // 退出全屏
  container.querySelector('#btn-back-home').onclick = () => {
    const fullBox = container.querySelector('#true-fullscreen-box');
    if (fullBox) fullBox.style.display = 'none';
    const defaultBack = document.querySelector('.game-back-btn, #btn-exit-game, [data-action="exit"]');
    if (defaultBack) defaultBack.click();
    else window.history.back();
  };

  // 拍立得 3D 翻转弹窗
  const photoModal = container.querySelector('#tp-photo-modal');
  const photoCard = container.querySelector('#photo-card');
  const modalPhotoImg = container.querySelector('#modal-photo-img');
  const modalPhotoPlace = container.querySelector('#modal-photo-place');
  const modalCardDate = container.querySelector('#modal-card-date');
  const modalCardSouvenir = container.querySelector('#modal-card-souvenir');
  const modalCardLetter = container.querySelector('#modal-card-letter');

  const openPolaroidCard = (polaroid) => {
    modalPhotoImg.src = polaroid.photoUrl;
    modalPhotoPlace.innerText = `📍 ${polaroid.placeName}`;
    modalCardDate.innerText = polaroid.date;
    modalCardSouvenir.innerText = `🎁 附赠：${polaroid.souvenir}`;
    modalCardLetter.innerText = `“${polaroid.letter}”`;
    photoCard.classList.remove('flipped');
    photoModal.style.display = 'flex';
  };

  photoCard.onclick = () => { photoCard.classList.toggle('flipped'); };
  container.querySelector('#btn-close-photo').onclick = () => { photoModal.style.display = 'none'; };

  container.querySelectorAll('.polaroid-clip').forEach(clip => {
    clip.onclick = () => {
      const p = state.polaroids.find(item => item.id == clip.dataset.id);
      if (p) openPolaroidCard(p);
    };
  });

  const modal = container.querySelector('#tp-modal');
  const modalTitle = container.querySelector('#modal-title');
  const modalContent = container.querySelector('#modal-content');
  container.querySelector('#btn-close-modal').onclick = () => { modal.style.display = 'none'; };

  // 差分切换
  let resetTimer = null;
  const switchStance = (stanceKey) => {
    const charImg = container.querySelector('#char-img');
    if (!charImg || !ASSETS.characters[stanceKey]) return;

    charImg.src = ASSETS.characters[stanceKey];

    if (resetTimer) clearTimeout(resetTimer);
    if (stanceKey !== 'idle') {
      resetTimer = setTimeout(() => {
        const liveImg = container.querySelector('#char-img');
        if (liveImg) liveImg.src = ASSETS.characters.idle;
      }, 3000);
    }
  };

  const update = (text) => {
    state.dialogue = text;
    const bubble = container.querySelector('#tp-bubble');
    if (bubble) {
      bubble.innerText = text;
      bubble.style.transform = 'translateX(-50%) scale(1.05)';
      setTimeout(() => bubble.style.transform = 'translateX(-50%) scale(1)', 150);
    }
    container.querySelector('#tp-money').innerText = state.money;
    container.querySelector('#tp-aff').innerText = state.affection;
    saveState();
  };

  // 🎯 核心触碰：实时通过大模型动态生成不死途的回答！
  if (!isTraveling) {
    const charImg = container.querySelector('#char-img');
    if (charImg) {
      charImg.onclick = async (e) => {
        const rect = charImg.getBoundingClientRect();
        const clickRatio = (e.clientY - rect.top) / rect.height;

        if (clickRatio < 0.42) {
          // 👉 碰帽子/摸头
          switchStance('shy');
          state.affection += 4;
          update("“（眼神微敛，耳尖泛红）……在想台词呢……”");

          const reply = await askAshveil(
            ASHVEIL_SYSTEM,
            `玩家刚刚踮起脚尖摸了你的帽子和头顶，眼神亮晶晶地看着你。请你低声回应TA一句，带点耳根微红的无奈与宠溺。`,
            "“（压低了帽檐，耳尖微红）……手怎么这么凉？别乱动，握着暖暖。”"
          );
          update(reply);

          // 偷偷写日记
          const journal = await askAshveil(
            `你是崩铁的不死途。请用私人观察日记口吻记录：伴侣刚刚伸手摸你的帽子，你心里其实很受用但表面压低帽子的心情（25字左右）。`,
            `记录这笔日记。`,
            `忽然伸手摸我的帽子。这只小宠物真是越来越得寸进尺了，不过……挺舒服的。`
          );
          addJournal(journal);

        } else {
          // 👉 戳胸口/要零花钱
          switchStance('hand');
          const get = Math.floor(Math.random() * 100) + 150;
          state.money += get;
          state.affection += 2;
          update(`“（递过卡片）……又伸手了？”`);

          const reply = await askAshveil(
            ASHVEIL_SYSTEM,
            `玩家戳了戳你的胸口外套，眼巴巴伸手朝你要零花钱。你拿出了生活费¥${get}递给TA，请你说一句宠溺、生活化的话叮嘱TA。`,
            `“（朝你递出手掌，眼底含笑）……拿去吧，省着点花，别总吃凉的。”`
          );
          update(reply);

          // 偷偷写日记
          const journal = await askAshveil(
            `你是崩铁的不死途。请用私人观察日记口吻记录：伴侣刚刚戳你胸口要走了¥${get}零花钱，你对TA花钱和被依赖的心情（25字左右）。`,
            `记录这笔日记。`,
            `戳着我的外套理直气壮要零钱。塞了钱过去眼尾都在笑，真拿TA没办法。`
          );
          addJournal(journal);
        }
      };
    }

    container.querySelector('#btn-travel').onclick = () => {
      modalTitle.innerText = "安排不死途的外出采风 🎒";
      modalContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${PLACES.map(p => `
            <div class="place-opt" data-id="${p.id}" style="border: 1px solid #eee; padding: 12px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #fafafa;">
              <div>
                <div style="font-weight: bold; color: #2d3436;">${p.name}</div>
                <div style="font-size: 11px; color: #888; margin-top: 3px;">特产：${p.souvenirs.join('、')}</div>
              </div>
              <button style="padding: 6px 14px; border: none; border-radius: 10px; background: #d63031; color: white; font-size: 12px; font-weight: bold; cursor: pointer;">出发 ›</button>
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
          addJournal(`出发去【${place.name}】了。答应了要给家里那个小家伙带特产和写信，早点办完早点回家。`);
          saveState();
          modal.style.display = 'none';
          renderGame(container);
        };
      });
    };
  }

  // ⚙️ 大模型 API 设置弹窗
  container.querySelector('#btn-open-ai-settings').onclick = () => {
    modalTitle.innerText = "大模型接入设置 ⚙️ (接入后每次回答都不重复)";
    modalContent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="font-size: 11px; color: #888;">
          推荐使用 <b>DeepSeek API</b> 或 <b>硅基流动 SiliconFlow</b>（极其便宜，几分钱可用很久）。不填则使用本地预设台词。
        </div>
        <div>
          <label style="font-size: 12px; font-weight: bold; color: #333;">API Endpoint (接口地址):</label>
          <input id="ai-endpoint" type="text" value="${aiConfig.endpoint}" style="width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 12px; margin-top: 4px; box-sizing: border-box;" />
        </div>
        <div>
          <label style="font-size: 12px; font-weight: bold; color: #333;">API Key (秘钥):</label>
          <input id="ai-key" type="password" value="${aiConfig.apiKey}" placeholder="sk-..." style="width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 12px; margin-top: 4px; box-sizing: border-box;" />
        </div>
        <div>
          <label style="font-size: 12px; font-weight: bold; color: #333;">Model (模型代号):</label>
          <input id="ai-model" type="text" value="${aiConfig.model}" style="width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 12px; margin-top: 4px; box-sizing: border-box;" />
        </div>
        <button id="btn-save-ai" style="padding: 10px; border: none; border-radius: 12px; background: #d63031; color: white; font-weight: bold; font-size: 13px; cursor: pointer; margin-top: 6px;">
          保存配置
        </button>
      </div>
    `;
    modal.style.display = 'flex';

    modalContent.querySelector('#btn-save-ai').onclick = () => {
      aiConfig.endpoint = modalContent.querySelector('#ai-endpoint').value.trim();
      aiConfig.apiKey = modalContent.querySelector('#ai-key').value.trim();
      aiConfig.model = modalContent.querySelector('#ai-model').value.trim();
      saveAiConfig();
      modal.style.display = 'none';
      update("“设置好了？从现在起，我的每一句话都只属于你。”");
    };
  };

  // 饲养日记
  container.querySelector('#btn-open-journal').onclick = () => {
    modalTitle.innerText = "不死途的私人饲养日记 📖 (仅他可见)";
    modalContent.innerHTML = state.caretakerJournal.length === 0 ? '<p>还没有日记记录。</p>' : `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${state.caretakerJournal.map(j => `
          <div style="background: #fff9e6; border-left: 3px solid #e17055; padding: 10px 14px; border-radius: 6px;">
            <div style="font-size: 11px; color: #999; margin-bottom: 4px;">${j.time}</div>
            <div style="color: #2d3436; font-size: 13px; line-height: 1.6;">${j.text}</div>
          </div>
        `).join('')}
      </div>
    `;
    modal.style.display = 'flex';
  };

  // 记忆相册
  container.querySelector('#btn-open-gallery').onclick = () => {
    modalTitle.innerText = "风铃上的拍立得相册 🎐";
    modalContent.innerHTML = state.polaroids.length === 0 ? '<p style="text-align: center; color: #999; padding: 30px 0;">风铃上还没有挂照片呢，快安排他出门采风吧！</p>' : `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        ${state.polaroids.map(p => `
          <div class="gallery-card" data-id="${p.id}" style="background: #fff; border: 1px solid #eee; padding: 8px; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            <img src="${p.photoUrl}" style="width: 100%; height: 130px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
            <div style="font-weight: bold; font-size: 12px; color: #2d3436;">${p.placeName}</div>
            <div style="font-size: 10px; color: #d63031;">🎁 ${p.souvenir}</div>
          </div>
        `).join('')}
      </div>
    `;
    modal.style.display = 'flex';

    modalContent.querySelectorAll('.gallery-card').forEach(card => {
      card.onclick = () => {
        const p = state.polaroids.find(item => item.id == card.dataset.id);
        if (p) {
          modal.style.display = 'none';
          openPolaroidCard(p);
        }
      };
    });
  };
}
