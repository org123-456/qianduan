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

    _doSave() {
        const getVal = (id) => document.getElementById(id)?.value.trim() || '';
        
        localStorage.setItem('ai_api_url', getVal('api-url'));
        localStorage.setItem('ai_api_key', getVal('api-key'));
        localStorage.setItem('ai_api_model', getVal('api-model'));
        
        localStorage.setItem('my_name', getVal('my-name'));
        localStorage.setItem('char_name', getVal('char-name'));
        localStorage.setItem('char_persona', getVal('char-persona'));
        
        localStorage.setItem('ban_emoji', document.getElementById('ban-emoji')?.checked || false);

        localStorage.setItem('my_avatar', getVal('my-avatar'));
        localStorage.setItem('ta_avatar', getVal('ta-avatar'));
        
        const charName = getVal('char-name');
        const myName = getVal('my-name');
        if (charName && myName) {
            const titleEl = document.getElementById('top-title');
            if (titleEl) titleEl.innerText = `${myName} & ${charName}`;
        }
    },

    autoSave() {
        try {
            this._doSave();
        } catch (e) {
            console.error("自动保存失败", e);
        }
    },

    saveSettings() {
        try {
            this._doSave();
            this.showToast("✅ 设置保存成功！");
            window.PhoneUI.renderAppContent('wechat');
        } catch (error) {
            alert("保存失败，请检查代码");
        }
    },

    loadSettings() {
        try {
            const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
            
            setVal('api-url', localStorage.getItem('ai_api_url') || '');
            setVal('api-key', localStorage.getItem('ai_api_key') || '');
            
            const savedModel = localStorage.getItem('ai_api_model') || '';
            setVal('api-model', savedModel);
            const selectEl = document.getElementById('api-model-select');
            if (selectEl) {
                let optionExists = Array.from(selectEl.options).some(opt => opt.value === savedModel);
                selectEl.value = optionExists ? savedModel : "";
            }
            
            const savedMyName = localStorage.getItem('my_name') || '';
            const savedCharName = localStorage.getItem('char_name') || '';
            setVal('my-name', savedMyName);
            setVal('char-name', savedCharName);
            setVal('char-persona', localStorage.getItem('char_persona') || '');
            
            setVal('my-avatar', localStorage.getItem('my_avatar') || '');
            setVal('ta-avatar', localStorage.getItem('ta_avatar') || '');

            const banEmojiEl = document.getElementById('ban-emoji');
            if(banEmojiEl) banEmojiEl.checked = localStorage.getItem('ban_emoji') === 'true';

            if (savedCharName && savedMyName) {
                const titleEl = document.getElementById('top-title');
                if (titleEl) titleEl.innerText = `${savedMyName} & ${savedCharName}`;
            }
        } catch (error) {
            console.error("加载设置失败:", error);
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

    // 🌟 新增：读取和保存世界书数据
    getWorldbookData() {
        let wb = localStorage.getItem('worldbook_entries');
        if (!wb) {
            // 默认内置的几个神级插件
            const defaultWb = [
                { id: 'wb1', title: '防抢话机制', content: '绝对禁止替用户做出决定、动作或说话，只描写你自己的反应。', online: true, offline: true },
                { id: 'wb2', title: '合理制造冲突', content: '不要总是顺从用户，根据人设适度制造戏剧冲突、拒绝或傲娇反驳。', online: true, offline: true },
                { id: 'wb3', title: '文青病 (环境渲染)', content: '在描写中加入大量对光影、气味、微风等环境细节的刻画，营造电影感。', online: false, offline: true },
                { id: 'wb4', title: '动作微表情', content: '说话时必须配合细腻的微表情（如挑眉、垂眸、手指的小动作）。', online: false, offline: true }
            ];
            localStorage.setItem('worldbook_entries', JSON.stringify(defaultWb));
            return defaultWb;
        }
        return JSON.parse(wb);
    },

    toggleWorldbook(id, type, isChecked) {
        let wb = this.getWorldbookData();
        let item = wb.find(w => w.id === id);
        if (item) {
            item[type] = isChecked;
            localStorage.setItem('worldbook_entries', JSON.stringify(wb));
        }
    },

    saveNovelWords() {
        const val = document.getElementById('novel-min-words')?.value || '150';
        localStorage.setItem('novel_min_words', val);
    },

    async chatWithAI(messages) {
        let url = localStorage.getItem('ai_api_url');
        let key = localStorage.getItem('ai_api_key');
        let model = localStorage.getItem('ai_api_model');

        if (!url) url = document.getElementById('api-url')?.value.trim();
        if (!key) key = document.getElementById('api-key')?.value.trim();
        if (!model) model = document.getElementById('api-model')?.value.trim();

        if (!url || !key || !model) {
            throw new Error("请先去 Mine 页面配置 API 接口和模型！");
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
