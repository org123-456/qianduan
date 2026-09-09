export const PhoneAPI = {
    saveSettings() {
        const url = document.getElementById('api-url').value.trim();
        const key = document.getElementById('api-key').value.trim();
        const model = document.getElementById('api-model').value.trim();
        
        const charName = document.getElementById('char-name').value.trim();
        const charPersona = document.getElementById('char-persona').value.trim();
        
        const banEmoji = document.getElementById('ban-emoji').checked;
        const replyLength = document.getElementById('reply-length').value;

        // 保存头像
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
        // 保存完刷新一下聊天界面，让新头像生效
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

    // 新增：一键清空聊天记录
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
