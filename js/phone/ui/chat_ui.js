export const ChatUI = {
    // 渲染聊天主窗口内容
    renderAppContent(appId, customItems = null, scrollToBottom = true) {
        const roleId = window.Config?.currentContactId;
        if (!roleId) return;

        let data = window.Config?.phoneData?.[roleId]?.[appId];
        if (!data && appId !== 'gallery' && appId !== 'memory_vault' && appId !== 'moments' && appId !== 'favorites') return;

        // 如果传入了自定义切片（比如跳转历史时），优先渲染自定义片段；平时默认显示最新的50条保证流畅
        let itemsToRender = customItems || (data?.items || []);
        if (!customItems && appId !== 'gallery' && appId !== 'memory_vault' && appId !== 'moments' && appId !== 'favorites' && itemsToRender.length > 50) {
            itemsToRender = itemsToRender.slice(-50);
        }

        const listEl = document.getElementById('app-content-list');

        if (listEl && window.Apps && window.Apps[appId]) {
            let renderData = { ...data, items: JSON.parse(JSON.stringify(itemsToRender)) };
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

            if (scrollToBottom) {
                setTimeout(() => { 
                    if (listEl) listEl.scrollTop = listEl.scrollHeight; 
                }, 100);
            }

            if (appId === 'wechat') {
                this.updateHomeWidget();
                this._injectSearchBtnToMenu(); // 动态在 + 号菜单添加搜索按钮
            }
        } else if (appId === 'gallery') {
            this.renderGallery();
        } else if (appId === 'settings') {
            this.renderSettings();
        } else if (appId === 'moments') {
            this.renderMoments();
        } else if (appId === 'favorites') {
            if (this.currentMomentsTab === 'favorites') {
                this.renderMoments();
            }
        }
    },

    // 🌟 在聊天框的 + 号弹窗里动态注入“查找聊天记录”按钮
    _injectSearchBtnToMenu() {
        const menu = document.getElementById('chat-plus-menu');
        if (!menu || document.getElementById('menu-item-search-chat')) return;

        const searchItem = document.createElement('div');
        searchItem.id = 'menu-item-search-chat';
        searchItem.className = 'chat-menu-item';
        searchItem.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; padding: 10px; border-radius: 12px;';
        searchItem.innerHTML = `
            <div style="width: 44px; height: 44px; border-radius: 12px; background: var(--icon-bg); display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--primary-color); border: 1px solid var(--border-color);">
                <i class="ph-fill ph-magnifying-glass"></i>
            </div>
            <span style="font-size: 11px; color: var(--text-main);">查找记录</span>
        `;
        searchItem.onclick = () => {
            this.closeChatMenu();
            this.openSearchChatModal();
        };

        menu.appendChild(searchItem);
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

    openSearchChatModal() {
        let modalBg = document.getElementById('search-chat-modal-bg');
        let modal = document.getElementById('search-chat-modal');

        if (!modalBg) {
            modalBg = document.createElement('div');
            modalBg.id = 'search-chat-modal-bg';
            modalBg.className = 'modal-bg';
            modalBg.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9998; opacity: 0; visibility: hidden; transition: 0.3s; backdrop-filter: blur(5px);';
            modalBg.onclick = () => this.closeSearchChatModal();
            document.body.appendChild(modalBg);

            modal = document.createElement('div');
            modal.id = 'search-chat-modal';
            modal.className = 'custom-modal';
            modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); width: 90%; max-width: 380px; max-height: 80vh; background: var(--card-bg, #fff); border-radius: 20px; z-index: 9999; opacity: 0; visibility: hidden; transition: 0.3s; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.2); border: 1px solid var(--border-color);';
            
            modal.innerHTML = `
                <div style="padding: 16px 18px 12px 18px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
                    <div style="font-weight: bold; font-size: 15px; color: var(--primary-color); display: flex; align-items: center; gap: 6px;">
                        <i class="ph-fill ph-magnifying-glass"></i> 搜索聊天记录
                    </div>
                    <i class="ph ph-x" style="font-size: 18px; color: var(--text-sub); cursor: pointer;" onclick="window.PhoneUI.closeSearchChatModal()"></i>
                </div>
                <div style="padding: 12px 16px;">
                    <input type="text" id="chat-search-input" placeholder="输入关键词 (如：晚安、喜欢、秘密)..." style="width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--icon-bg); color: var(--text-main); font-size: 13px; outline: none;">
                </div>
                <div id="chat-search-results" style="flex: 1; overflow-y: auto; padding: 0 16px 16px 16px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="text-align: center; color: var(--text-sub); font-size: 12px; margin-top: 30px;">输入关键字开始搜索全部历史记录</div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('chat-search-input').addEventListener('input', (e) => {
                this._doSearchChat(e.target.value.trim());
            });
        }

        const input = document.getElementById('chat-search-input');
        if (input) input.value = '';
        document.getElementById('chat-search-results').innerHTML = '<div style="text-align: center; color: var(--text-sub); font-size: 12px; margin-top: 30px;">输入关键字开始搜索全部历史记录</div>';

        modalBg.style.opacity = '1';
        modalBg.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        modal.style.transform = 'translate(-50%, -50%) scale(1)';
        setTimeout(() => { if (input) input.focus(); }, 100);
    },

    closeSearchChatModal() {
        const modalBg = document.getElementById('search-chat-modal-bg');
        const modal = document.getElementById('search-chat-modal');
        if (modalBg) { modalBg.style.opacity = '0'; modalBg.style.visibility = 'hidden'; }
        if (modal) { modal.style.opacity = '0'; modal.style.visibility = 'hidden'; modal.style.transform = 'translate(-50%, -50%) scale(0.9)'; }
    },

    _doSearchChat(keyword) {
        const resBox = document.getElementById('chat-search-results');
        if (!resBox) return;

        if (!keyword) {
            resBox.innerHTML = '<div style="text-align: center; color: var(--text-sub); font-size: 12px; margin-top: 30px;">输入关键字开始搜索全部历史记录</div>';
            return;
        }

        const roleId = window.Config?.currentContactId;
        const allItems = window.Config?.phoneData?.[roleId]?.wechat?.items || [];
        const myName = localStorage.getItem('my_name') || '我';
        const taName = localStorage.getItem('char_name') || 'TA';

        const matches = [];
        allItems.forEach((item, index) => {
            if (item.sender !== 'typing' && item.content && typeof item.content === 'string') {
                if (item.content.toLowerCase().includes(keyword.toLowerCase())) {
                    matches.push({ item, index });
                }
            }
        });

        if (matches.length === 0) {
            resBox.innerHTML = '<div style="text-align: center; color: var(--text-sub); font-size: 12px; margin-top: 30px;">没有搜到相关聊天记录哦~</div>';
            return;
        }

        let html = `<div style="font-size: 11px; color: var(--text-sub); margin-bottom: 4px;">找到 ${matches.length} 条记录（点击直接跳转定位）：</div>`;
        
        [...matches].reverse().forEach(({ item, index }) => {
            const senderName = item.sender === 'me' ? myName : taName;
            const senderColor = item.sender === 'me' ? 'var(--primary-color)' : 'var(--danger-color, #f43f5e)';
            
            let safeContent = this.escapeHtml(item.content);
            const reg = new RegExp(`(${this.escapeHtml(keyword)})`, 'gi');
            safeContent = safeContent.replace(reg, '<mark style="background: rgba(254, 240, 138, 0.7); color: inherit; padding: 0 2px; border-radius: 2px;">$1</mark>');

            // 🌟 点击调用 jumpToChatMessage 直接跳转到聊天框真实位置
            html += `
                <div onclick="window.PhoneUI.jumpToChatMessage(${index})" style="background: var(--icon-bg); padding: 10px 12px; border-radius: 12px; border: 1px solid var(--border-color); cursor: pointer; display: flex; flex-direction: column; gap: 4px; transition: 0.2s;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px;">
                        <span style="font-weight: bold; color: ${senderColor};">${senderName}</span>
                        <span style="color: var(--text-sub); font-family: monospace;">${item.date || ''} ${item.time || ''}</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-main); line-height: 1.4; word-break: break-all;">
                        ${safeContent}
                    </div>
                </div>
            `;
        });

        resBox.innerHTML = html;
    },

    // 🌟 核心：点击直接跳转并定位到历史记录那一刻
    jumpToChatMessage(targetIndex) {
        const roleId = window.Config?.currentContactId;
        const allItems = window.Config?.phoneData?.[roleId]?.wechat?.items || [];
        if (!allItems[targetIndex]) return;

        // 1. 关闭搜索弹窗
        this.closeSearchChatModal();

        // 2. 以目标消息为中心，加载前后各 30 条消息（共 60 条）
        const start = Math.max(0, targetIndex - 30);
        const end = Math.min(allItems.length, targetIndex + 30);
        const snippetItems = allItems.slice(start, end);

        // 3. 渲染这部分历史切片进聊天框（先不要自动滚到底部）
        this.renderAppContent('wechat', snippetItems, false);

        // 4. 定位目标节点，平滑滚动并高亮闪烁
        setTimeout(() => {
            const listEl = document.getElementById('app-content-list');
            if (!listEl) return;

            // 目标在切片里的相对索引
            const relativeIndex = targetIndex - start;
            // 找到渲染出来的气泡项
            const bubbleNodes = listEl.querySelectorAll('.chat-bubble, .chat-item, [onclick*="openMsgMenu"]');
            const targetNode = bubbleNodes[relativeIndex] || listEl.children[relativeIndex];

            if (targetNode) {
                targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // 呼吸高亮闪烁效果
                const prevTransition = targetNode.style.transition;
                const prevShadow = targetNode.style.boxShadow;
                targetNode.style.transition = 'all 0.3s ease';
                targetNode.style.boxShadow = '0 0 0 3px var(--primary-color), 0 4px 15px rgba(167, 139, 250, 0.5)';
                targetNode.style.borderRadius = '14px';

                setTimeout(() => {
                    targetNode.style.boxShadow = prevShadow;
                    targetNode.style.transition = prevTransition;
                }, 2200);
            }

            // 5. 显示“回到最新”悬浮按钮
            this._showBackToBottomBtn();
        }, 150);
    },

    // 浮现“回到底部”小按钮
    _showBackToBottomBtn() {
        let btn = document.getElementById('chat-btn-back-bottom');
        if (!btn) {
            btn = document.createElement('div');
            btn.id = 'chat-btn-back-bottom';
            btn.style.cssText = 'position: fixed; right: 20px; bottom: 85px; background: var(--card-bg, #fff); color: var(--primary-color); border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.15); cursor: pointer; display: flex; align-items: center; gap: 4px; z-index: 50; transition: 0.3s;';
            btn.innerHTML = `<i class="ph-bold ph-arrow-down"></i> 回到最新`;
            btn.onclick = () => {
                this.renderAppContent('wechat'); // 恢复渲染最新 50 条
                btn.remove();
            };
            const chatScreen = document.getElementById('app-content-list')?.parentElement;
            if (chatScreen) chatScreen.appendChild(btn);
            else document.body.appendChild(btn);
        }
    }
};
