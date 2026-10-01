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
  },

  first_talk: {
    id: 'first_talk',
    title: '第一次聊天',
    condition: {
      firstMeeting: true
    },
    memory: {
      title: '第一次聊天',
      text: '第一次真正聊起彼此的故事。'
    },
    effects: {
      chapter: 2
    }
  }
};

export function getEvent(id) {
  return events[id] || null;
}
