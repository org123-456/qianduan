// 此间归处 - 存档迁移

export const SAVE_VERSION = 1;

export function migrateSave(data) {
  if (!data) return null;

  const version = data.version || 0;

  if (version < 1) {
    data.progress = data.progress || {
      chapter: 0,
      firstMeeting: false
    };
    data.memories = data.memories || [];
  }

  data.version = SAVE_VERSION;
  return data;
}
