export const ChatUI = {
    renderAppContent(appId) {
        const roleId = window.Config?.currentContactId;
        if (!roleId) return;

        let data = window.Config?.phoneData?.[roleId]?.[appId];
        if (!data && appId !== 'gallery' && appId !== 'memory_vault' && appId !== 'moments' && appId !== 'favorites') return;

        // 允许翻看全部历史记录，放宽到 1000 条
        let renderItems = data?.items || [];
        if (appId === 'wechat' && renderItems.length > 1000) {
            renderItems = renderItems.slice(-1000);
        }

        const listEl = document.getElementById('app-content-list');

        if (listEl && window.Apps && window.Apps[appId]) {
            let renderData = { ...data, items: JSON.parse(JSON.stringify(renderItems)) };
            if (Array.isArray(renderData.items)) {
                renderData.items.forEach(item => {
                    if (item && typeof item.content === 'string') {
                        // 表情包转换
                        if (item.content.includes('[发送了表情包：')) {
                            const urlMatch = item.content.match(/(https?:\/\/[^\s\)]+)/);
                            if (urlMatch) {
                                const safeUrl = this.escapeHtml(urlMatch[1]);
                                item.content = `<img src="${safeUrl}" class="chat-sticker" onclick="window.PhoneUI.previewImage(this.src)">`;
                            }
                        }
                        // 普通图片气泡点击也能直接全屏查看 + 保存到本地
                        else if (item.content.includes('![图片](') || item.content.includes('![](')) {
                            item.content = item.content.replace(/!\[(.*?)\]\((https?:\/\/[^\s\)]+|data:image\/[^\s\)]+)\)/g, (match, alt, url) => {
                                return `<img src="${url}" style="max-width:100%; border-radius:10px; cursor:pointer;" onclick="window.PhoneUI.previewImage(this.src)" title="点击放大与保存">`;
                            });
                        }
                    }
                });
            }
            listEl.innerHTML = window.Apps[appId].renderList(renderData);

            setTimeout(() => { 
                if (listEl) listEl.scrollTop = listEl.scrollHeight; 
            }, 100);

            if (appId === 'wechat') {
                this.ensureChatSearchButton();
                if (window.PhoneUI && window.PhoneUI.updateHomeWidget) {
                    window.PhoneUI.updateHomeWidget();
                }
            }
        } else if (appId === 'gallery') {
            if (this.renderGallery) this.renderGallery();
        } else if (appId === 'settings') {
            if (this.renderSettings) this.renderSettings();
        } else if (appId === 'moments') {
            if (this.renderMoments) this.renderMoments();
        } else if (appId === 'favorites') {
            if (this.currentMomentsTab === 'favorites') {
                if (this.renderMoments) this.renderMoments();
            }
        }
    },

    ensureChatSearchButton() {
        if (document.getElementById('chat-history-search-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'chat-history-search-btn';
        btn.type = 'button';
        btn.title = '搜索聊天记录';
        btn.innerHTML = '<i class="ph ph-magnifying-glass"></i>';
        btn.style.cssText = 'position:fixed;right:14px;top:calc(env(safe-area-inset-top, 0px) + 58px);z-index:120;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border:none;border-radius:50%;background:var(--window-bg);color:var(--primary-color);box-shadow:0 4px 14px rgba(0,0,0,.12);cursor:pointer;font-size:20px;';
        btn.onclick = () => this.openChatHistorySearch();
        document.body.appendChild(btn);
    },

    openChatHistorySearch() {
        this.closeChatMenu();
        this.closeStickerPanel();

        let modal = document.getElementById('chat-history-search-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'chat-history-search-modal';
            modal.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.28);backdrop-filter:blur(8px);display:flex;align-items:flex-start;justify-content:center;padding:calc(env(safe-area-inset-top, 0px) + 54px) 14px 20px;';
            modal.innerHTML = `
                <div style="width:min(680px,100%);height:min(78vh,720px);background:var(--window-bg);border:1px solid var(--border-color);border-radius:22px;box-shadow:0 15px 50px rgba(0,0,0,.22);display:flex;flex-direction:column;overflow:hidden;">
                    <div style="display:flex;align-items:center;gap:10px;padding:15px;border-bottom:1px solid var(--border-color);">
                        <i class="ph ph-magnifying-glass" style="font-size:20px;color:var(--primary-color);"></i>
                        <input id="chat-history-search-input" type="search" placeholder="搜索全部聊天记录……" autocomplete="off" style="flex:1;border:none;outline:none;background:transparent;color:var(--text-main);font-size:15px;">
                        <button type="button" onclick="window.PhoneUI.closeChatHistorySearch()" style="border:none;background:var(--icon-bg);color:var(--text-main);width:34px;height:34px;border-radius:50%;font-size:18px;">×</button>
                    </div>
                    <div id="chat-history-search-meta" style="padding:8px 15px;font-size:11px;color:var(--text-sub);border-bottom:1px solid var(--border-color);">可搜索全部本地聊天，不受聊天页面只显示最近 1000 条的限制。</div>
                    <div id="chat-history-search-results" style="flex:1;overflow-y:auto;padding:10px 12px;"></div>
                </div>`;
            document.body.appendChild(modal);
            const input = document.getElementById('chat-history-search-input');
            input.addEventListener('input', (e) => this.searchChatHistory(e.target.value));
            modal.addEventListener('click', (e) => { if (e.target === modal) this.closeChatHistorySearch(); });
        }
        modal.style.display = 'flex';
        const input = document.getElementById('chat-history-search-input');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 50);
        }
        this.searchChatHistory('');
    },

    closeChatHistorySearch() {
        const modal = document.getElementById('chat-history-search-modal');
        if (modal) modal.style.display = 'none';
    },

    searchChatHistory(query) {
        const results = document.getElementById('chat-history-search-results');
        const meta = document.getElementById('chat-history-search-meta');
        if (!results) return;

        const roleId = window.Config?.currentContactId;
        const items = window.Config?.phoneData?.[roleId]?.wechat?.items || [];
        const q = String(query || '').trim().toLowerCase();

        if (!q) {
            meta.textContent = `本地共有 ${items.length} 条聊天。输入关键词后会从全部记录搜索，不会修改任何数据。`;
            results.innerHTML = '<div style="text-align:center;padding:50px 15px;color:var(--text-sub);font-size:13px;">🔎 输入你记得的词、句子、日期或时间<br><span style="font-size:11px;">例如：外卖 / bug / 2026-09-30 / 23:07</span></div>';
            return;
        }

        const matches = [];
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            if (!item || item.sender === 'typing') continue;
            const content = String(item.content || '');
            const time = String(item.time || item.timestamp || item.createdAt || item.date || '');
            const haystack = (content + ' ' + time).toLowerCase();
            if (haystack.includes(q)) {
                matches.push({ item, index: i });
                if (matches.length >= 80) break;
            }
        }

        meta.textContent = matches.length
            ? `找到 ${matches.length}${matches.length >= 80 ? '+' : ''} 条匹配记录（按最新在前显示）`
            : '没有找到匹配记录。';

        if (!matches.length) {
            results.innerHTML = '<div style="text-align:center;padding:55px 15px;color:var(--text-sub);font-size:13px;">没有找到这句话。<br>可以换一个更短的关键词试试。</div>';
            return;
        }

        results.innerHTML = matches.map(({item, index}) => {
            const raw = String(item.content || '');
            const stamp = item.time || item.timestamp || item.createdAt || item.date || '';
            const sender = item.sender === 'me' ? '我' : (item.sender === 'other' ? 'TA' : String(item.sender || ''));
            const escaped = this.escapeHtml(raw.length > 260 ? raw.slice(0, 260) + '…' : raw);
            const safeStamp = this.escapeHtml(String(stamp));
            const safeSender = this.escapeHtml(sender);
            return `
                <div style="padding:12px 10px;margin-bottom:8px;border:1px solid var(--border-color);border-radius:13px;background:var(--icon-bg);">
                    <div style="display:flex;justify-content:space-between;gap:10px;font-size:11px;color:var(--text-sub);margin-bottom:6px;">
                        <span>${safeSender}</span><span>${safeStamp}</span>
                    </div>
                    <div style="font-size:13px;line-height:1.55;color:var(--text-main);white-space:pre-wrap;word-break:break-word;">${escaped}</div>
                    <div style="margin-top:7px;font-size:10px;color:var(--text-sub);">第 ${index + 1} 条原始记录</div>
                </div>`;
        }).join('');
    },

    toggleChatMenu() {
        const menu = document.getElementById('chat-plus-menu');
        const btn = document.getElementById('btn-plus');
        if (!menu) return;
        if (menu.classList.contains('show')) { 
            this.closeChatMenu(); 
        } else { 
            menu.classList.add('show'); 
            if (btn) btn.style.transform = 'rotate(45deg)'; 
        }
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

    showThought(index) {
        const roleId = window.Config?.currentContactId;
        if (!roleId) return;
        const appData = window.Config?.phoneData?.[roleId]?.wechat;
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
    },

    previewImage(imgUrl) {
        let viewer = document.getElementById('image-viewer-modal');
        if (!viewer) {
            viewer = document.createElement('div');
            viewer.id = 'image-viewer-modal';
            viewer.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(10px); transition: 0.3s; opacity: 0; visibility: hidden;';
            viewer.innerHTML = `
                <div style="position: absolute; top: 30px; right: 20px; font-size: 28px; color: #fff; cursor: pointer; padding: 10px;" onclick="window.PhoneUI.closeImageViewer()"><i class="ph ph-x"></i></div>
                <img id="viewer-img" src="" style="max-width: 92%; max-height: 75vh; border-radius: 12px; object-fit: contain; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <div style="display: flex; gap: 15px; margin-top: 25px;">
                    <button id="btn-save-image" onclick="window.PhoneUI.downloadCurrentImage()" style="background: var(--primary-color); color: #fff; border: none; padding: 10px 24px; border-radius: 25px; font-size: 14px; font-weight: bold; display: flex; align-items: center; gap: 6px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                        <i class="ph-bold ph-download-simple" style="font-size: 18px;"></i> 保存到本地
                    </button>
                </div>
            `;
            document.body.appendChild(viewer);
        }

        const imgEl = document.getElementById('viewer-img');
        imgEl.src = imgUrl;
        viewer._currentImgUrl = imgUrl;

        viewer.style.visibility = 'visible';
        viewer.style.opacity = '1';
    },

    closeImageViewer() {
        const viewer = document.getElementById('image-viewer-modal');
        if (viewer) {
            viewer.style.opacity = '0';
            viewer.style.visibility = 'hidden';
        }
    },

    async downloadCurrentImage() {
        const viewer = document.getElementById('image-viewer-modal');
        if (!viewer || !viewer._currentImgUrl) return;
        const url = viewer._currentImgUrl;

        try {
            if (window.PhoneAPI) window.PhoneAPI.showToast("⏳ 正在保存图片...");

            if (url.startsWith('data:')) {
                const a = document.createElement('a');
                a.href = url;
                a.download = `Photo_${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                if (window.PhoneAPI) window.PhoneAPI.showToast("✅ 图片已成功保存到手机！");
                return;
            }

            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `Photo_${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);

            if (window.PhoneAPI) window.PhoneAPI.showToast("✅ 图片已成功保存到手机！");
        } catch (e) {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.download = `Photo_${Date.now()}.jpg`;
            a.click();
            if (window.PhoneAPI) window.PhoneAPI.showToast("✅ 请长按图片保存到本地！");
        }
    }
};

// 🌟 核心：回车键只连发用户气泡，不惊动 AI；AI 唯有点击屏幕右下角的发送按钮才回复！
if (typeof document !== 'undefined') {
    document.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        if (active && (active.id === 'chat-input' || active.classList.contains('chat-input-box'))) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // 仅上屏用户消息，绝对不触发模型！
                if (window.PhoneEngine && window.PhoneEngine.sendUserMsgOnly) {
                    window.PhoneEngine.sendUserMsgOnly();
                } else if (window.ChatEngine && window.ChatEngine.sendUserMsgOnly) {
                    window.ChatEngine.sendUserMsgOnly();
                }
            }
        }
    }, true);
}
