export const PhoneAPI = {
    // 保存所有设置到本地缓存 (API + 人设)
    saveSettings() {
        // API 设置
        const url = document.getElementById('api-url').value.trim();
        const key = document.getElementById('api-key').value.trim();
        const model = document.getElementById('api-model').value.trim();
        
        // 人设设置
        const charName = document.getElementById('char-name').value.trim();
        const charPersona = document.getElementById('char-persona').value.trim();
        
        localStorage.setItem('ai_api_url', url);
        localStorage.setItem('ai_api_key', key);
        localStorage.setItem('ai_api_model', model);
        
        localStorage.setItem('char_name', charName);
        localStorage.setItem('char_persona', charPersona);
        
        alert("✅ 设置保存成功！AI 已经记住了新的人设。");
        
        // 动态更新顶部标题
        if (charName) {
            document.getElementById('top-title').innerText = `我 & ${charName}`;
        }
    },

    // 加载设置到页面上
    loadSettings() {
        document.getElementById('api-url').value = localStorage.getItem('ai_api_url') || '';
        document.getElementById('api-key').value = localStorage.getItem('ai_api_key') || '';
        document.getElementById('api-model').value = localStorage.getItem('ai_api_model') || '';
        
        const savedName = localStorage.getItem('char_name') || '';
        document.getElementById('char-name').value = savedName;
        document.getElementById('char-persona').value = localStorage.getItem('char_persona') || '';
        
        if (savedName) {
            document.getElementById('top-title').innerText = `我 & ${savedName}`;
        }
    },

    // 真正的 AI 聊天请求
    async chatWithAI(messages) {
        const url = localStorage.getItem('ai_api_url');
        const key = localStorage.getItem('ai_api_key');
        const model = localStorage.getItem('ai_api_model');

        if (!url || !key || !model) {
            throw new Error("请先去 Mine 页面配置 API 接口！");
        }

        const endpoint = url.endsWith('/chat/completions') ? url : url.replace(/\/$/, '') + '/chat/completions';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`API 请求失败: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error(error);
            throw new Error("网络错误或 API 配置不正确，请检查。");
        }
    }
};
