// 此间归处 - 崩铁·不死途专属 2D 温馨小窝 + 风铃拍立得手账系统

// 🌟 使用专属高速 CDN 绝对路径，彻底消灭 404！
const BASE_URL = 'https://cdn.jsdelivr.net/gh/org123-456/qianduan@main/js/games/this_place/';

const ASSETS = {
  // 小窝背景池
  rooms: {
    day: BASE_URL + 'room_day.png',
    dusk: BASE_URL + 'room_dusk.png',
    night: BASE_URL + 'room_night.png',
    autumn: BASE_URL + 'room_autumn.png',
    winter: BASE_URL + 'room_winter.png'
  },
  
  // 不死途三套差分立绘
  characters: {
    idle: BASE_URL + 'ashveil_idle.png',     // 待机沉稳
    shy: BASE_URL + 'ashveil_shy.png',       // 扶帽微笑（摸头）
    hand: BASE_URL + 'ashveil_hand.png'      // 抬手邀请（给钱/投喂）
  },

  // 5 个旅行地点的专属拍立得大图
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

const LETTER_DATABASE = {
  forest: [
    "晨雾比想象中要浓，踩在湿青苔上时差点滑了一下。捡到这枚松果的时候，忽然觉得你握在手心里刚刚好。",
    "林间木屋后有一条没被踩过的小径。折了一支药草夹在信里，回去记得闻闻，有冷杉的香味。",
    "阳光穿透树林的那一瞬间很漂亮。可惜你不在身边，只能用镜头替你留下来。"
  ],
  hill: [
    "这里的风铃响了一整个下午，声音很像你平时在耳边哼歌。找村民换了香草束，今晚放在你枕边吧。",
    "山坡上的野花开得很盛，风一吹全是草木香气。等下次有空，我牵着你从山脚慢慢走上来。",
    "在木栈道上喝了一杯粗茶。阳光照在身上暖洋洋的，忽然很想看你晒着太阳打瞌睡的样子。"
  ],
  station: [
    "列车进站时卷起了一地的银杏叶，金灿灿的，像落在地上的碎金。买了下一次同行的双人车票，不许弄丢。",
    "旧长椅上的落叶厚得可以陷进去。在站台等车的时候，满脑子都是你在小窝里等我回家的模样。",
    "买了站台现烤的便当，趁热用保温盒装好了。回去如果凉了，我热给你吃。"
  ],
  lake: [
    "夜里的月湖安静得能听见自己的心跳。湖面上落满了银河，我在浅滩捞起这块发光的石头，第一眼就想送给你。",
    "坐在栈道边缘吹了很久的夜风。湖水倒映着满天星斗，那一刻只希望你也在我怀里看着。",
    "夜里的木屋点起了灯，隔着湖水看像一团小小的火苗。那一瞬间，忽然特别想快点回到有你的小窝。"
  ],
  coast: [
    "海浪退下去的时候，在沙滩上捡到了这枚被冲刷得极温润的贝壳。贴在耳边听，海风很喧嚣，我很想你。",
    "灯塔下的风很大，帽子差点被吹走。海天一色的蓝很纯粹，回头带你去踩水。",
    "沙滩上留下的两行脚印被海水冲平了。带了一小袋粗海盐晶体回去，放在窗台当小摆件吧。"
  ]
};

const SAVE_KEY = 'this_place_windchime_save';

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

function loadSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try { Object.assign(state, JSON.parse(raw)); } catch (e) {}
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

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

  if (state.travelState.status === 'traveling' && Date.now() >= state.travelState.returnTime) {
    const place = state.travelState.targetPlace;
    const souvenir = place.souvenirs[Math.floor(Math.random() * place.souvenirs.length)];
    const letterPool = LETTER_DATABASE[place.id] || LETTER_DATABASE.forest;
    const letter = letterPool[Math.floor(Math.random() * letterPool.length)];
    
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
    addJournal(`从${place.name}回来，把照片夹在风铃上。某人凑过来看手写字的样子，可爱得要命。`);
    saveState();
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
      .ashveil-char {
        animation: gentleBreath 4s ease-in-out infinite;
        transition: opacity 0.2s ease, transform 0.2s ease;
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

    <div style="position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; background: #fafafa; overflow: hidden; user-select: none; font-family: -apple-system, sans-serif;">
      
      <!-- 顶栏快捷操作 -->
      <div style="position: absolute; top: 12px; left: 16px; right: 16px; display: flex; justify-content: space-between; z-index: 25;">
        <button id="btn-open-journal" style="background: rgba(255,255,255,0.88); backdrop-filter: blur(8px); border: 1px solid rgba(0,0,0,0.06); padding: 7px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; color: #444; box-shadow: 0 2px 10px rgba(0,0,0,0.05); cursor: pointer;">
          📖 私人饲养日记
        </button>
        <button id="btn-open-gallery" style="background: rgba(255,255,255,0.88); backdrop-filter: blur(8px); border: 1px solid rgba(0,0,0,0.06); padding: 7px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; color: #444; box-shadow: 0 2px 10px rgba(0,0,0,0.05); cursor: pointer;">
          🎐 记忆风铃 (${state.polaroids.length})
        </button>
      </div>

      <!-- 落地窗顶：微风拍立得悬挂栏 -->
      ${state.polaroids.length > 0 ? `
        <div class="windchime-line" style="position: absolute; top: 50px; left: 0; right: 0; display: flex; gap: 12px; padding: 0 20px; overflow-x: auto; z-index: 20; scrollbar-width: none;">
          ${state.polaroids.slice(0, 6).map((item, idx) => `
            <div class="polaroid-clip" data-id="${item.id}" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; flex-shrink: 0;">
              <div style="width: 6px; height: 14px; background: #c8d6e5; border-radius: 2px; margin-bottom: -3px; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
              <div style="background: #ffffff; padding: 4px 4px 10px; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); transform: rotate(${idx % 2 === 0 ? '-2deg' : '2deg'});">
                <img src="${item.photoUrl}" style="width: 50px; height: 64px; object-fit: cover; border-radius: 2px; display: block;" />
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- 台词气泡 -->
      <div id="tp-bubble" style="
        position: absolute; top: ${state.polaroids.length > 0 ? '146px' : '60px'}; left: 50%; transform: translateX(-50%);
        background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 12px 18px; border-radius: 20px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.08); font-size: 13px; color: #2d3436;
        width: 82%; text-align: center; z-index: 15; transition: transform 0.2s, top 0.3s; border: 1px solid rgba(255,255,255,0.8);
      ">${isTraveling ? `“去【${state.travelState.targetPlace.name}】看看，不用跟来，乖乖等我。”` : state.dialogue}</div>

      <!-- 2D 房间背景与不死途立绘 -->
      <div style="flex: 1; position: relative; overflow: hidden; display: flex; align-items: flex-end; justify-content: center; background-image: url('${currentRoom}'); background-size: cover; background-position: center;">
        
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 100%);"></div>

        ${isTraveling ? `
          <div style="z-index: 5; margin-bottom: 70px; text-align: center; background: rgba(255,255,255,0.92); padding: 24px 30px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="font-size: 54px; margin-bottom: 8px;">🧳</div>
            <div style="font-size: 15px; font-weight: bold; color: #2d3436;">不死途 正在采风中</div>
            <div style="font-size: 12px; color: #ff4757; margin-top: 4px;">目的地：${state.travelState.targetPlace.name}</div>
          </div>
        ` : `
          <div class="ashveil-char" style="z-index: 5; height: 82%; width: 100%; display: flex; align-items: flex-end; justify-content: center;">
            <img id="char-img" src="${ASSETS.characters.idle}" style="
              height: 100%; max-width: 95vw; object-fit: contain; object-position: center bottom;
              filter: drop-shadow(0 12px 24px rgba(0,0,0,0.18));
            " />
          </div>
        `}
      </div>

      <!-- 底部控制面板 -->
      <div style="background: #ffffff; padding: 16px 20px 24px; border-top-left-radius: 26px; border-top-right-radius: 26px; box-shadow: 0 -6px 25px rgba(0,0,0,0.06); z-index: 10;">
        <div style="display: flex; justify-content: space-around; margin-bottom: 14px; font-size: 13px; color: #777;">
          <div>零花钱: <b style="color: #ff4757; font-size: 15px;">￥<span id="tp-money">${state.money}</span></b></div>
          <div>他的羁绊: <b style="color: #ff4757; font-size: 15px;"><span id="tp-aff">${state.affection}</span></b></div>
          <div>饱腹感: <b style="color: #2ed573; font-size: 15px;"><span id="tp-hunger">${state.hunger}</span>%</b></div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button id="btn-money" ${isTraveling ? 'disabled style="opacity:0.5"' : ''} style="padding: 12px; border: none; border-radius: 14px; background: #ffeaa7; color: #d63031; font-weight: bold; font-size: 13px; cursor: pointer;">💸 要零花钱</button>
          <button id="btn-feed" ${isTraveling ? 'disabled style="opacity:0.5"' : ''} style="padding: 12px; border: none; border-radius: 14px; background: #fab1a0; color: #d63031; font-weight: bold; font-size: 13px; cursor: pointer;">🍱 让他投喂</button>
          <button id="btn-touch" ${isTraveling ? 'disabled style="opacity:0.5"' : ''} style="padding: 12px; border: none; border-radius: 14px; background: #a8e6cf; color: #1b4332; font-weight: bold; font-size: 13px; cursor: pointer;">✨ 摸摸他</button>
          <button id="btn-travel" ${isTraveling ? 'disabled style="opacity:0.5"' : ''} style="padding: 12px; border: none; border-radius: 14px; background: #dff9fb; color: #130f40; font-weight: bold; font-size: 13px; cursor: pointer;">🎒 催他出门</button>
        </div>
      </div>

      <!-- 拍立得 3D 翻转弹窗 -->
      <div id="tp-photo-modal" style="display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); z-index: 100; justify-content: center; align-items: center; flex-direction: column;">
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
                  <span style="font-size: 12px; font-weight: bold; color: #e17055;" id="modal-card-souvenir">礼物</span>
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
        <div style="color: white; font-size: 12px; margin-top: 20px; opacity: 0.8;">💡 轻点卡片可翻转到背面查看手写字</div>
        <button id="btn-close-photo" style="margin-top: 14px; background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.4); color: white; padding: 8px 24px; border-radius: 20px; font-size: 13px; cursor: pointer;">收起</button>
      </div>

      <!-- 普通文字弹窗 -->
      <div id="tp-modal" style="display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 90; justify-content: center; align-items: flex-end;">
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

  photoCard.onclick = () => {
    photoCard.classList.toggle('flipped');
  };

  container.querySelector('#btn-close-photo').onclick = () => {
    photoModal.style.display = 'none';
  };

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

  let resetTimer = null;
  const switchStance = (stanceKey) => {
    const charImg = container.querySelector('#char-img');
    if (!charImg || !ASSETS.characters[stanceKey]) return;

    charImg.style.opacity = '0.7';
    setTimeout(() => {
      charImg.src = ASSETS.characters[stanceKey];
      charImg.style.opacity = '1';
    }, 100);

    if (resetTimer) clearTimeout(resetTimer);
    if (stanceKey !== 'idle') {
      resetTimer = setTimeout(() => {
        if (charImg) {
          charImg.style.opacity = '0.7';
          setTimeout(() => {
            charImg.src = ASSETS.characters.idle;
            charImg.style.opacity = '1';
          }, 100);
        }
      }, 2500);
    }
  };

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

  if (!isTraveling) {
    container.querySelector('#btn-money').onclick = () => {
      switchStance('hand');
      const get = Math.floor(Math.random() * 100) + 150;
      state.money += get;
      state.affection += 2;
      update(`“（递过卡片）又花光了？拿去吧，喜欢什么别亏待自己。”`);
      addJournal(`找我要零钱时伸手伸得理直气壮。塞了 ¥${get} 过去，眼尾都在笑，真是拿TA没办法。`);
    };

    container.querySelector('#btn-feed').onclick = () => {
      switchStance('hand');
      if (state.hunger >= 100) return update("“肚子都圆了还吃？小心半夜积食睡不着。”");
      state.hunger = Math.min(100, state.hunger + 20);
      state.affection += 3;
      update("“把热好的点心端过来了。张嘴，啊——趁热吃。”");
      addJournal('喂了点心，唇角沾了糖霜，顺手帮TA抹掉了。乖乖仰着头的样子很招人疼。');
    };

    container.querySelector('#btn-touch').onclick = () => {
      switchStance('shy');
      state.affection += 5;
      update("“（压低帽檐，耳尖微红）……手怎么这么凉？别乱动，握着暖暖。”");
      addJournal('忽然伸手碰我的脸。这只小宠物好像根本不知道我的底线在哪里，越来越黏人了。');
    };

    container.querySelector('#btn-travel').onclick = () => {
      modalTitle.innerText = "安排不死途的外出采风";
      modalContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${PLACES.map(p => `
            <div class="place-opt" data-id="${p.id}" style="border: 1px solid #eee; padding: 12px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #fafafa;">
              <div>
                <div style="font-weight: bold; color: #333;">${p.name}</div>
                <div style="font-size: 11px; color: #888; margin-top: 3px;">特产：${p.souvenirs.join('、')}</div>
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
          addJournal(`出发去【${place.name}】了。答应了要给家里那个小家伙带特产和写信，早点办完早点回家。`);
          saveState();
          modal.style.display = 'none';
          renderGame(container);
        };
      });
    };
  }

  container.querySelector('#btn-open-journal').onclick = () => {
    modalTitle.innerText = "不死途的私人饲养日记 📖 (仅他可见)";
    modalContent.innerHTML = state.caretakerJournal.length === 0 ? '<p>还没有日记记录。</p>' : `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${state.caretakerJournal.map(j => `
          <div style="background: #fff9e6; border-left: 3px solid #e17055; padding: 10px 12px; border-radius: 4px;">
            <div style="font-size: 11px; color: #999; margin-bottom: 4px;">${j.time}</div>
            <div style="color: #444; font-size: 13px; line-height: 1.5;">${j.text}</div>
          </div>
        `).join('')}
      </div>
    `;
    modal.style.display = 'flex';
  };

  container.querySelector('#btn-open-gallery').onclick = () => {
    modalTitle.innerText = "风铃上的拍立得相册 🎐";
    modalContent.innerHTML = state.polaroids.length === 0 ? '<p style="text-align: center; color: #999; padding: 20px 0;">风铃上还没有挂照片呢，快催他出门吧！</p>' : `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        ${state.polaroids.map(p => `
          <div class="gallery-card" data-id="${p.id}" style="background: #fff; border: 1px solid #eee; padding: 8px; border-radius: 10px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
            <img src="${p.photoUrl}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
            <div style="font-weight: bold; font-size: 12px; color: #333;">${p.placeName}</div>
            <div style="font-size: 10px; color: #ff6b81;">🎁 ${p.souvenir}</div>
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
