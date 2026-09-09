export const PhoneAPI = {
    saveSettings() {
        const url = document.getElementById('api-url').value.trim();
        const key = document.getElementById('api-key').value.trim();
        const model = document.getElementById('api-model').value.trim();
        
        const charName = document.getElementById('char-name').value.trim();
        const charPersona = document.getElementById('char-persona').value.trim();
        
        const banEmoji = document.getElementById('ban-emoji').checked;
        const replyLength = document.getElementById('reply-length').value;

        const myAvatar = document.getElementById('my-avatar').value.trim();
        const taAvatar = document.getElementById('ta-avatar').value.trim();
        
        localStorage.setItem('ai_api_url', url);
        localStorage.setItem('ai_api_key', key);
        localStorage.setItem('ai_api_model', model);
        
        localStorage.setItem('char_name', charName);
        localStorage.setItem('char_persona', charPersona);
        
        localStorage.setItem('ban_emoji', banEmoji);
        localStorage.setItem('reply_length', replyLength);

        localStorage.setItem('my_avatar', myAvatar);
        localStorage.setItem('ta_avatar', taAvatar);
        
        alert("✅ 设置保存成功！");
        
        if (charName) {
            document.getElementById('top-title').innerText = `我 & ${charName}`;
        }
        window.PhoneUI.renderAppContent('wechat');
    },

    loadSettings() {
        document.getElementById('api-url').value = localStorage.getItem('ai_api_url') || '';
        document.getElementById('api-key').value = localStorage.getItem('ai_api_key') || '';
        document.getElementById('api-model').value = localStorage.getItem('ai_api_model') || '';
        
        const savedName = localStorage.getItem('char_name') || '';
        document.getElementById('char-name').value = savedName;
        document.getElementById('char-persona').value = localStorage.getItem('char_persona') || '';
        
        document.getElementById('ban-emoji').checked = localStorage.getItem('ban_emoji') === 'true';
        const savedLength = localStorage.getItem('reply_length');
        if(savedLength) {
            document.getElementById('reply-length').value = savedLength;
        }

        document.getElementById('my-avatar').value = localStorage.getItem('my_avatar') || '';
        document.getElementById('ta-avatar').value = localStorage.getItem('ta_avatar') || '';

        if (savedName) {
            document.getElementById('top-title').innerText = `我 & ${savedName}`;
        }
    },

    clearChat() {
        if(confirm("确定要清空所有聊天记录吗？清空后无法恢复！")) {
            if(window.Config.phoneData['role_001'] && window.Config.phoneData['role_001'].wechat) {
                window.Config.phoneData['role_001'].wechat.items = [];
            }
            window.PhoneUI.renderAppContent('wechat');
            alert("🗑️ 聊天记录已清空！");
        }
    },

    async chatWithAI(messages) {
        // 先从缓存读
        let url = localStorage.getItem('ai_api_url');
        let key = localStorage.getItem('ai_api_key');
        let model = localStorage.getItem('ai_api_model');

        // 兜底神技：如果缓存是空的，直接去页面输入框里硬抓！
        if (!url) url = document.getElementById('api-url').value.trim();
        if (!key) key = document.getElementById('api-key').value.trim();
        if (!model) model = document.getElementById('api-model').value.trim();

        if (!url || !key || !model) {
            throw new Error("请先去 Mine 页面配置 API 接口和模型名称！");
        }

        // 顺手帮你保存一下，免得下次刷新没了
        localStorage.setItem('ai_api_url', url);
        localStorage.setItem('ai_api_key', key);
        localStorage.setItem('ai_api_model', model);

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
                // 如果中转站报错，把错误信息弹出来给你看
                const errData = await response.json().catch(() => ({}));
                throw new Error(`API 报错: ${response.status} ${errData.error?.message || ''}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "网络错误或 API 配置不正确，请检查。");
        }
    }
};
