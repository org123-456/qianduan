export const PhoneAPI = {
    showToast(msg) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-msg');
        if (toast && toastMsg) {
            toastMsg.innerText = msg;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000); 
        } else {
            alert(msg); 
        }
    },

    saveSettings() {
        try {
            // 用 ?. 安全读取，找不到也不会崩溃
            const url = document.getElementById('api-url')?.value.trim() || '';
            const key = document.getElementById('api-key')?.value.trim() || '';
            const model = document.getElementById('api-model')?.value.trim() || '';
            
            const myName = document.getElementById('my-name')?.value.trim() || '';
            const charName = document.getElementById('char-name')?.value.trim() || '';
            
            const banEmoji = document.getElementById('ban-emoji')?.checked || false;
            const replyLength = document.getElementById('reply-length')?.value || 'short';

            const myAvatar = document.getElementById('my-avatar')?.value.trim() || '';
            const taAvatar = document.getElementById('ta-avatar')?.value.trim() || '';
            
            localStorage.setItem('ai_api_url', url);
            localStorage.setItem('ai_api_key', key);
            localStorage.setItem('ai_api_model', model);
            
            localStorage.setItem('my_name', myName);
            localStorage.setItem('char_name', charName);
            
            localStorage.setItem('ban_emoji', banEmoji);
            localStorage.setItem('reply_length', replyLength);

            localStorage.setItem('my_avatar', myAvatar);
            localStorage.setItem('ta_avatar', taAvatar);
            
            this.showToast("✅ 设置保存成功！");
            
            if (charName && myName) {
                const titleEl = document.getElementById('top-title');
                if (titleEl) titleEl.innerText = `${myName} & ${charName}`;
            }
            window.PhoneUI.renderAppContent('wechat');
        } catch (error) {
            alert("保存失败，请检查代码: " + error.message);
        }
    },

    loadSettings() {
        const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
        
        setVal('api-url', localStorage.getItem('ai_api_url') || '');
        setVal('api-key', localStorage.getItem('ai_api_key') || '');
        setVal('api-model', localStorage.getItem('ai_api_model') || '');
        
        const savedMyName = localStorage.getItem('my_name') || '';
        const savedCharName = localStorage.getItem('char_name') || '';
        setVal('my-name', savedMyName);
        setVal('char-name', savedCharName);
        
        setVal('my-avatar', localStorage.getItem('my_avatar') || '');
        setVal('ta-avatar', localStorage.getItem('ta_avatar') || '');

        const banEmojiEl = document.getElementById('ban-emoji');
        if(banEmojiEl) banEmojiEl.checked = localStorage.getItem('ban_emoji') === 'true';
        
        const replyLengthEl = document.getElementById('reply-length');
        if(replyLengthEl && localStorage.getItem('reply_length')) {
            replyLengthEl.value = localStorage.getItem('reply_length');
        }

        if (savedCharName && savedMyName) {
            const titleEl = document.getElementById('top-title');
            if (titleEl) titleEl.innerText = `${savedMyName} & ${savedCharName}`;
        }
    },

    clearChat() {
        if(confirm("确定要清空所有聊天记录吗？清空后无法恢复！")) {
            if(window.Config.phoneData['role_001']) {
                window.Config.phoneData['role_001'].wechat = { items: [] };
            }
            localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
            window.PhoneUI.renderAppContent('wechat');
            this.showToast("🗑️ 聊天记录已清空！");
        }
    },

    async chatWithAI(messages) {
        let url = localStorage.getItem('ai_api_url');
        let key = localStorage.getItem('ai_api_key');
        let model = localStorage.getItem('ai_api_model');

        if (!url) url = document.getElementById('api-url')?.value.trim();
        if (!key) key = document.getElementById('api-key')?.value.trim();
        if (!model) model = document.getElementById('api-model')?.value.trim();

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
