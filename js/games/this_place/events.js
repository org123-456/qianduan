// 此间归处 - 事件系统

export function triggerEvent(eventName, payload = {}) {
  return {
    eventName,
    payload
  };
}
