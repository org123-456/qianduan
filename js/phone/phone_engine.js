import { ChatEngine } from './engine/chat_engine.js';
import { ReaderEngine } from './engine/reader_engine.js';

export const PhoneEngine = {
  ...ChatEngine,
  ...ReaderEngine,
};

export default PhoneEngine;
