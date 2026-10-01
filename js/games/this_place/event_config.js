// 此间归处 - 事件配置

export const events = {
  first_meeting: {
    id: 'first_meeting',
    title: '第一次相遇',
    memory: {
      title: '第一次相遇',
      text: '第一次来到此间归处，遇见了重要的人。'
    },
    effects: {
      chapter: 1
    }
  }
};

export function getEvent(id) {
  return events[id] || null;
}
