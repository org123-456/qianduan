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

    getWorldbookData() {
        let wb = localStorage.getItem('worldbook_entries');
        if (!wb) {
            const defaultWb = [
                { id: 'wb1', title: '防八股/去AI味', content: '绝对禁止使用华丽空洞的辞藻堆砌。禁止使用"眼底闪过一丝"、"嘴角勾起一抹"、"空气中弥漫着"等AI惯用套路句式。描写必须具体、写实、接地气。', online: true, offline: true, isCustom: false },
                { id: 'wb2', title: '防抢话机制', content: '绝对禁止替用户做出决定、动作或说话，只描写你自己的反应。', online: true, offline: true, isCustom: false },
                { id: 'wb3', title: '合理制造冲突', content: '不要总是顺从用户，根据人设适度制造戏剧冲突、拒绝或傲娇反驳。', online: true, offline: true, isCustom: false },
                { id: 'wb4', title: '动作微表情', content: '说话时必须配合细腻的微表情（如挑眉、垂眸、手指的小动作）。', online: false, offline: true, isCustom: false }
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

    addWorldbook() {
        const titleEl = document.getElementById('wb-new-title');
        const contentEl = document.getElementById('wb-new-content');
        const title = titleEl.value.trim();
        const content = contentEl.value.trim();
        
        if(!title || !content) {
            alert('标题和内容不能为空哦！');
            return;
        }
        
        let wb = this.getWorldbookData();
        wb.push({
            id: 'wb_' + Date.now(),
            title: title,
            content: content,
            online: true,
            offline: true,
            isCustom: true 
        });
        
        localStorage.setItem('worldbook_entries', JSON.stringify(wb));
        
        titleEl.value = '';
        contentEl.value = '';
        window.PhoneUI.closeWbModal();
        window.PhoneUI.openApp('worldbook', '世界书');
        this.showToast("✅ 规则添加成功！");
    },

    deleteWorldbook(id) {
        if(!confirm('确定要删除这条自定义规则吗？')) return;
        let wb = this.getWorldbookData();
        wb = wb.filter(w => w.id !== id);
        localStorage.setItem('worldbook_entries', JSON.stringify(wb));
        window.PhoneUI.openApp('worldbook', '世界书');
        this.showToast("🗑️ 规则已删除");
    },

    saveNovelWords() {
        const val = document.getElementById('novel-min-words')?.value || '150';
        localStorage.setItem('novel_min_words', val);
    },

    // 🌟 核心升级：剧情存档室逻辑
    getArchives() {
        return JSON.parse(localStorage.getItem('story_archives') || '[]');
    },

    saveArchive() {
        const nameInput = document.getElementById('archive-name');
        const name = nameInput.value.trim();
        if (!name) return alert('请先输入存档名称！');
        
        const roleId = window.Config.currentContactId;
        const items = window.Config.phoneData[roleId]?.wechat?.items || [];
        if (items.length === 0) return alert('当前没有剧情可以存档哦！');

        const archives = this.getArchives();
        archives.push({
            id: 'arc_' + Date.now(),
            name: name,
            date: new Date().toLocaleString(),
            count: items.length,
            data: JSON.parse(JSON.stringify(items)) // 深度拷贝当前聊天记录
        });
        localStorage.setItem('story_archives', JSON.stringify(archives));
        
        nameInput.value = '';
        window.PhoneUI.renderArchiveList();
        this.showToast('💾 存档成功！');
    },

    loadArchive(id) {
        if (!confirm('读取存档将覆盖当前的剧情，确定要读取吗？（建议先保存当前进度）')) return;
        const archives = this.getArchives();
        const arc = archives.find(a => a.id === id);
        if (arc) {
            const roleId = window.Config.currentContactId;
            if (!window.Config.phoneData[roleId]) window.Config.phoneData[roleId] = {};
            if (!window.Config.phoneData[roleId].wechat) window.Config.phoneData[roleId].wechat = {};
            
            // 覆盖当前聊天记录
            window.Config.phoneData[roleId].wechat.items = JSON.parse(JSON.stringify(arc.data));
            localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
            
            window.PhoneUI.closeArchiveModal();
            if (window.Config.currentAppId === 'novel') window.PhoneUI.renderNovelContent();
            else window.PhoneUI.renderAppContent('wechat');
            
            this.showToast('✨ 存档读取成功！');
        }
    },

    deleteArchive(id) {
        if (!confirm('确定要删除这个存档吗？删除后无法恢复！')) return;
        let archives = this.getArchives();
        archives = archives.filter(a => a.id !== id);
        localStorage.setItem('story_archives', JSON.stringify(archives));
        window.PhoneUI.renderArchiveList();
        this.showToast('🗑️ 存档已删除');
    },

    startNewTimeline() {
        if (!confirm('开启新剧情将清空当前的聊天和故事记录！请确保你已经存档。确定要清空吗？')) return;
        const roleId = window.Config.currentContactId;
        if (window.Config.phoneData[roleId]?.wechat) {
            window.Config.phoneData[roleId].wechat.items = [];
            localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
        }
        window.PhoneUI.closeArchiveModal();
        if (window.Config.currentAppId === 'novel') window.PhoneUI.renderNovelContent();
        else window.PhoneUI.renderAppContent('wechat');
        this.showToast('🚀 已开启全新时间线！');
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
