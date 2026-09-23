import { ChatEngine } from './engine/chat_engine.js';
import { ReaderEngine } from './engine/reader_engine.js';
import { MemoryEngine } from './engine/memory_engine.js';
import { GalleryEngine } from './engine/gallery_engine.js';

export const PhoneEngine = {
  ...ChatEngine,
  ...ReaderEngine,
  ...MemoryEngine,
  ...GalleryEngine,
};

export default PhoneEngine;
