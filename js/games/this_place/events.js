// 此间归处 - 事件系统

const listeners = new Map();

export function onEvent(eventName, callback) {
  if (!listeners.has(eventName)) listeners.set(eventName, []);
  listeners.get(eventName).push(callback);
}

export function triggerEvent(eventName, payload = {}) {
  const event = {
    eventName,
    payload,
    time: Date.now()
  };

  const callbacks = listeners.get(eventName) || [];
  callbacks.forEach(callback => callback(event));

  return event;
}

export function clearEvents(eventName) {
  if (eventName) listeners.delete(eventName);
  else listeners.clear();
}
