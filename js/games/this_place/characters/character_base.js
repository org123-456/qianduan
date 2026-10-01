// 此间归处 - 角色基础模型

export function createCharacter(config = {}) {
  return {
    id: config.id || null,
    name: config.name || '未知角色',
    personality: config.personality || [],
    preferences: config.preferences || [],
    state: {
      mood: 'normal',
      energy: 100,
      ...config.state
    }
  };
}
