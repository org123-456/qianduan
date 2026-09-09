export const PhoneAPI = {
    // 呼出高级弹窗
    showToast(msg) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-msg');
        if (toast && toastMsg) {
            toastMsg.innerText = msg;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000); // 3秒后自动消失
        } else {
            alert(msg); // 兜底
        }
    },

    saveSettings() {
        const url = document.getElementById('api-url').value.trim();
        const key = document.getElementById('api-key').value.trim();
        const model = document.getElementById('api-model').value.trim();
        
        const myName = document.getElementById('my-name').value.trim();
        const charName = document.getElementById('char-name').value.trim();
        const charPersona = document.getElementById('char-persona').value.trim();
        
        const banEmoji = document.getElementById('ban-emoji').checked;
        const replyLength = document.getElementById('reply-length').value;

        const myAvatar = document.getElementById('my-avatar').value.trim();
        const taAvatar = document.getElementById('ta-avatar').value.trim();
        
        localStorage.setItem('ai_api_url', url);
        localStorage.setItem('ai_api_key', key);
        localStorage.setItem('ai_api_model', model);
        
        localStorage.setItem('my_name', myName);
        localStorage.setItem('char_name', charName);
        localStorage.setItem('char_persona', charPersona);
        
        localStorage.setItem('ban_emoji', banEmoji);
        localStorage.setItem('reply_length', replyLength);

        localStorage.setItem('my_avatar', myAvatar);
        localStorage.setItem('ta_avatar', taAvatar);
        
        this.showToast("设置保存成功！");
        
        if (charName && myName) {
            document.getElementById('top-title').innerText = `${myName} & ${charName}`;
        }
        window.PhoneUI.renderAppContent('wechat');
    },

    loadSettings() {
        document.getElementById('api-url').value = localStorage.getItem('ai_api_url') || '';
        document.getElementById('api-key').value = localStorage.getItem('ai_api_key') || '';
        document.getElementById('api-model').value = localStorage.getItem('ai_api_model') || '';
        
        const savedMyName = localStorage.getItem('my_name') || '';
        const savedCharName = localStorage.getItem('char_name') || '';
        
        document.getElementById('my-name').value = savedMyName;
        document.getElementById('char-name').value = savedCharName;
        document.getElementById('char-persona').value = localStorage.getItem('char_persona') || '';
        
        document.getElementById('ban-emoji').checked = localStorage.getItem('ban_emoji') === 'true';
        const savedLength = localStorage.getItem('reply_length');
        if(savedLength) {
            document.getElementById('reply-length').value = savedLength;
        }

        document.getElementById('my-avatar').value = localStorage.getItem('my_avatar') || '';
        document.getElementById('ta-avatar').value = localStorage.getItem('ta_avatar') || '';

        if (savedCharName && savedMyName) {
            document.getElementById('top-title').innerText = `${savedMyName} & ${savedCharName}`;
        }
    },

    clearChat() {
        if(confirm("确定要清空所有聊天记录吗？清空后无法恢复！")) {
            if(window.Config.phoneData['role_001'] && window.Config.phoneData['role_001'].wechat) {
                window.Config.phoneData['role_001'].wechat.items = [];
            }
            window.PhoneUI.renderAppContent('wechat');
            this.showToast("聊天记录已清空！");
        }
    },

    async chatWithAI(messages) {
        let url = localStorage.getItem('ai_api_url');
        let key = localStorage.getItem('ai_api_key');
        let model = localStorage.getItem('ai_api_model');

        if (!url) url = document.getElementById('api-url').value.trim();
        if (!key) key = document.getElementById('api-key').value.trim();
        if (!model) model = document.getElementById('api-model').value.trim();

        if (!url || !key || !model) {
            throw new Error("请先去 Mine 页面配置 API 接口！");
        }

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
