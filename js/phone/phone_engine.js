import { ChatEngine } from './engine/chat_engine.js';
import { ReaderEngine } from './engine/reader_engine.js?v=2';
import { GalleryEngine } from './engine/gallery_engine.js?v=2';
import { DrawEngine } from './engine/draw_engine.js';
import { CinemaEngine } from './engine/cinema_engine.js'; // 🌟 引入放映室引擎
import { GameEngine } from '../games/game_engine.js'; // 🎮 游戏引擎

export const PhoneEngine = {
  ...ChatEngine,
  ...ReaderEngine,
  ...GalleryEngine,
  ...DrawEngine,
  ...CinemaEngine, // 🌟 导出合并
  ...GameEngine, // 🎮 游戏系统挂载
};


// 记忆星海体积较大且依赖外部 Three.js，改为后台加载。
// 即使它加载失败，也不能阻塞聊天、设置、日记、阅读等整个 App。
import('./engine/memory_engine.js?v=2026.10.10-starfix2')
    .then(mod => {
        Object.assign(PhoneEngine, mod.MemoryEngine || {});
        window.MemoryEngine = mod.MemoryEngine || null;
        console.log('✅ MemoryEngine loaded');
    })
    .catch(err => console.warn('⚠️ MemoryEngine load skipped:', err));

export default PhoneEngine;
