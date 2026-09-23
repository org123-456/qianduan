export const ChatUI = {
    renderAppContent(appId) {
        const roleId = window.Config?.currentContactId;
        if (!roleId) return;

        let data = window.Config?.phoneData?.[roleId]?.[appId];
        if (!data && appId !== 'gallery' && appId !== 'memory_vault' && appId !== 'moments' && appId !== 'favorites') return;

        if (appId !== 'gallery' && appId !== 'memory_vault' && appId !== 'moments' && appId !== 'favorites' && data && data.items && data.items.length > 50) {
            data = { ...data, items: data.items.slice(-50) };
        }

        const listEl = document.getElementById('app-content-list');

        if (listEl && window.Apps && window.Apps[appId]) {
            let renderData = JSON.parse(JSON.stringify(data));
            if (Array.isArray(renderData.items)) {
                renderData.items.forEach(item => {
                    if (item && typeof item.content === 'string' && item.content.includes('[发送了表情包：')) {
                        const urlMatch = item.content.match(/(https?:\/\/[^\s\)]+)/);
                        if (urlMatch) {
                            const safeUrl = this.escapeHtml(urlMatch[1]);
                            item.content = `<img src="${safeUrl}" class="chat-sticker">`;
                        }
                    }
                });
            }
            listEl.innerHTML = window.Apps[appId].renderList(renderData);

            setTimeout(() => { 
                if (listEl) listEl.scrollTop = listEl.scrollHeight; 
            }, 100);

            if (appId === 'wechat') this.updateHomeWidget();
        } else if (appId === 'gallery') {
            this.renderGallery();
        } else if (appId === 'settings') {
            this.renderSettings();
        } else if (appId === 'worldbook') {
            this.renderWorldbook();
        } else if (appId === 'moments') {
            this.renderMoments();
        } else if (appId === 'favorites') {
            if (this.currentMomentsTab === 'favorites') {
                this.renderMoments();
            }
        }
    },

    renderNovelContent() {
        const listEl = document.getElementById('novel-content-list');
        if (!listEl) return;
        const roleId = window.Config?.currentContactId;
        if (!roleId) return;
        const items = window.Config?.phoneData?.[roleId]?.novel?.items || [];

        const myAvatar = localStorage.getItem('my_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
        const myName = localStorage.getItem('my_name') || '我';
        const taName = localStorage.getItem('char_name') || 'TA';

        let html = '';
        items.forEach((item, idx) => {
            if (item.sender === 'typing') {
                html += `<div class="story-item other typing" style="opacity:0.6;"><img class="story-avatar" src="${taAvatar}"><div class="story-content-wrapper"><div class="story-name-row"><span class="story-name">${taName}</span></div><div class="story-bubble">...</div></div></div>`;
                return;
            }
            const isMe = item.sender === 'me';
            const avatar = isMe ? myAvatar : taAvatar;
            const name = isMe ? myName : taName;
            let parsed = window.marked ? window.marked.parse(item.content || '') : (item.content || '');
            let thoughtHtml = '';
            if (!isMe && item.innerThought) {
                thoughtHtml = `<div class="story-thought-icon" onclick="window.PhoneUI.showThought(${idx}, 'novel'); event.stopPropagation();"><i class="ph-fill ph-cloud"></i></div>`;
            }
            html += `<div class="story-item ${isMe ? 'me' : 'other'}"><img class="story-avatar" src="${avatar}"><div class="story-content-wrapper"><div class="story-name-row"><span class="story-name">${name}</span>${thoughtHtml}</div><div class="story-bubble markdown-body" onclick="if(window.PhoneEngine) window.PhoneEngine.openMsgMenu(${idx}, '${item.sender}')">${parsed}</div></div></div>`;
        });
        listEl.innerHTML = html;

        setTimeout(() => { 
            const listEl = document.getElementById('novel-content-list');
            if (listEl) listEl.scrollTop = listEl.scrollHeight;
        }, 100);
    },

    toggleChatMenu() {
        const menu = document.getElementById('chat-plus-menu');
        const btn = document.getElementById('btn-plus');
        if (!menu || !btn) return;
        if (menu.classList.contains('show')) { this.closeChatMenu(); } else { menu.classList.add('show'); btn.style.transform = 'rotate(45deg)'; }
    },

    closeChatMenu() {
        const menu = document.getElementById('chat-plus-menu');
        const btn = document.getElementById('btn-plus');
        if (menu) menu.classList.remove('show');
        if (btn) btn.style.transform = 'rotate(0deg)';
    },

    toggleStickerPanel() {
        const panel = document.getElementById('sticker-panel');
        if (!panel) return;
        if (panel.classList.contains('show')) { this.closeStickerPanel(); } else { this.closeChatMenu(); this.renderStickers(); panel.classList.add('show'); }
    },

    closeStickerPanel() {
        const panel = document.getElementById('sticker-panel');
        if (panel) panel.classList.remove('show');
    },

    async importStickers() {
        const text = await this.showCustomPrompt("📦 批量导入表情包", "请直接粘贴你的文档内容，格式如：\n让我摸摸:\nhttps://...gif\n害羞了:\nhttps://...gif\n（清空所有表情包请输入：CLEAR）");
        if (!text) return;
        if (text.trim() === 'CLEAR') {
            if (confirm("确定要清空所有表情包吗？")) { localStorage.removeItem('custom_stickers'); this.renderStickers(); if (window.PhoneAPI) window.PhoneAPI.showToast("🗑️ 表情包已清空"); }
            return;
        }
        const lines = text.split('\n'); let newStickers = []; let currentName = "未命名表情"; const urlRegex = /(https?:\/\/[^\s]+)/;
        lines.forEach(line => {
            const str = line.trim(); if (!str) return;
            const urlMatch = str.match(urlRegex);
            if (urlMatch) {
                const url = urlMatch[1]; let name = str.replace(url, '').replace(/[:：]/g, '').trim();
                if (!name && currentName !== "未命名表情") { name = currentName; currentName = "未命名表情"; } else if (!name) { name = "表情" + Math.floor(Math.random() * 1000); }
                newStickers.push({ name, url });
            } else { currentName = str.replace(/[:：]/g, '').trim(); }
        });
        if (newStickers.length > 0) {
            let existing = JSON.parse(localStorage.getItem('custom_stickers') || '[]'); existing = [...existing, ...newStickers];
            localStorage.setItem('custom_stickers', JSON.stringify(existing)); this.renderStickers(); if (window.PhoneAPI) window.PhoneAPI.showToast(`✅ 成功解析并导入 ${newStickers.length} 个表情包！`);
        } else { if (window.PhoneAPI) window.PhoneAPI.showToast(`❌ 未识别到任何有效链接`); }
    },

    renderStickers() {
        const panel = document.getElementById('sticker-panel');
        if (!panel) return;
        const stickers = JSON.parse(localStorage.getItem('custom_stickers') || '[]');
        let html = `<div class="sticker-add-btn" onclick="window.PhoneUI.importStickers()"><i class="ph ph-plus" style="font-size:24px;"></i><span style="font-size:10px;margin-top:4px;">导入</span></div>`;
        stickers.forEach(st => {
            const safeName = this.escapeHtml(st.name); const safeUrl = this.escapeHtml(st.url);
            html += `<div class="sticker-item" onclick="if(window.PhoneEngine) window.PhoneEngine.sendSticker('${safeName}','${safeUrl}')" title="${safeName}"><img src="${safeUrl}" alt="${safeName}"></div>`;
        });
        panel.innerHTML = html;
    },

    toggleStoryMenu() {
        const menu = document.getElementById('story-plus-menu');
        const btn = document.getElementById('btn-story-plus');
        if (!menu || !btn) return;
        if (menu.classList.contains('show')) { this.closeStoryMenu(); } else { menu.classList.add('show'); btn.style.transform = 'rotate(45deg)'; }
    },

    closeStoryMenu() {
        const menu = document.getElementById('story-plus-menu');
        const btn = document.getElementById('btn-story-plus');
        if (menu) menu.classList.remove('show');
        if (btn) btn.style.transform = 'rotate(0deg)';
    },

    showThought(index, forceApp) {
        const roleId = window.Config?.currentContactId;
        if (!roleId) return;
        const targetApp = forceApp || (window.Config?.currentAppId === 'novel' ? 'novel' : 'wechat');
        const appData = window.Config?.phoneData?.[roleId]?.[targetApp];
        if (!appData || !Array.isArray(appData.items)) return;
        const realIndex = Number(index);
        if (!Number.isInteger(realIndex) || realIndex < 0 || realIndex >= appData.items.length) return;
        let item = appData.items[realIndex];
        if (!item) return;

        let thought = item.innerThought;
        if (thought && typeof thought === 'string' && thought.includes('连发消息')) {
            for (let i = realIndex - 1; i >= 0; i--) {
                const prevItem = appData.items[i]; if (!prevItem) continue;
                if (prevItem.sender === 'other' && prevItem.time === item.time && prevItem.innerThought && typeof prevItem.innerThought === 'string' && !prevItem.innerThought.includes('连发消息')) { thought = prevItem.innerThought; break; }
            }
        }
        if (!thought || !String(thought).trim()) {
            for (let i = realIndex; i >= 0; i--) {
                const prevItem = appData.items[i]; if (!prevItem) continue;
                if (prevItem.sender === 'other' && prevItem.innerThought && typeof prevItem.innerThought === 'string' && prevItem.innerThought.trim()) { thought = prevItem.innerThought; break; }
            }
        }

        const contentEl = document.getElementById('thought-content');
        const bgEl = document.getElementById('thought-bg');
        const modalEl = document.getElementById('thought-modal');
        if (!contentEl || !bgEl || !modalEl) return;
        contentEl.innerText = thought && String(thought).trim() ? String(thought) : '（TA的心思藏得很深，什么也没看出来...）';
        bgEl.classList.add('show'); modalEl.classList.add('show');
    },

    closeThought() {
        const bgEl = document.getElementById('thought-bg');
        const modalEl = document.getElementById('thought-modal');
        if (bgEl) bgEl.classList.remove('show');
        if (modalEl) modal.classList.remove('show');
    }
};
