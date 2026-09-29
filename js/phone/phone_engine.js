import { ChatEngine } from './engine/chat_engine.js';
import { ReaderEngine } from './engine/reader_engine.js';
import { MemoryEngine } from './engine/memory_engine.js';
import { GalleryEngine } from './engine/gallery_engine.js';
import { DrawEngine } from './engine/draw_engine.js';
import { CinemaEngine } from './engine/cinema_engine.js'; // 🌟 引入放映室引擎

export const PhoneEngine = {
  ...ChatEngine,
  ...ReaderEngine,
  ...MemoryEngine,
  ...GalleryEngine,
  ...DrawEngine,
  ...CinemaEngine, // 🌟 导出合并
};

export default PhoneEngine;
