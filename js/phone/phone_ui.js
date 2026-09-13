export const PhoneUI = {
    renderAppContent(appId) { const roleId = window.Config?.currentContactId; if(!roleId) return; let data = window.Config.phoneData[roleId]?.[appId]; if (appId !== 'gallery' && data && data.items && data.items.length > 50) { data = { ...data, items: data.items.slice(-50) }; } const listEl = document.getElementById('app-content-list'); if (listEl && window.Apps && window.Apps[appId]) { listEl.innerHTML = window.Apps[appId].renderList(data); setTimeout(() => { listEl.scrollTop = listEl.scrollHeight; }, 100); } else if (appId === 'gallery') { this.renderGallery(); } else if (appId === 'shop') { this.renderShop(); } else if (appId === 'task') { this.renderTask(); } },
    toggleTheme() { const currentTheme = document.documentElement.getAttribute('data-theme'); const newTheme = currentTheme === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', newTheme); localStorage.setItem('theme', newTheme); const icon = document.getElementById('theme-icon'); if (icon) { if (newTheme === 'dark') { icon.classList.remove('ph-moon'); icon.classList.add('ph-sun'); } else { icon.classList.remove('ph-sun'); icon.classList.add('ph-moon'); } } },
    toggleChatMenu() { const menu = document.getElementById('chat-plus-menu'); const btn = document.getElementById('btn-plus'); if (!menu || !btn) return; if (menu.classList.contains('show')) { this.closeChatMenu(); } else { menu.classList.add('show'); btn.style.transform = 'rotate(45deg)'; } },
    closeChatMenu() { const menu = document.getElementById('chat-plus-menu'); const btn = document.getElementById('btn-plus'); if (menu) menu.classList.remove('show'); if (btn) btn.style.transform = 'rotate(0deg)'; },
    toggleStoryMenu() { const menu = document.getElementById('story-plus-menu'); const btn = document.getElementById('btn-story-plus'); if (!menu || !btn) return; if (menu.classList.contains('show')) { this.closeStoryMenu(); } else { menu.classList.add('show'); btn.style.transform = 'rotate(45deg)'; } },
    closeStoryMenu() { const menu = document.getElementById('story-plus-menu'); const btn = document.getElementById('btn-story-plus'); if (menu) menu.classList.remove('show'); if (btn) btn.style.transform = 'rotate(0deg)'; },
    showCustomPrompt(title, defaultValue = '') { return new Promise((resolve) => { const bg = document.getElementById('custom-prompt-bg'); const modal = document.getElementById('custom-prompt-modal'); const titleEl = document.getElementById('custom-prompt-title'); const inputEl = document.getElementById('custom-prompt-input'); const btnConfirm = document.getElementById('custom-prompt-confirm'); const btnCancel = document.getElementById('custom-prompt-cancel'); titleEl.innerText = title; inputEl.value = defaultValue; bg.classList.add('show'); modal.classList.add('show'); const cleanup = () => { bg.classList.remove('show'); modal.classList.remove('show'); btnConfirm.onclick = null; btnCancel.onclick = null; }; btnConfirm.onclick = () => { cleanup(); resolve(inputEl.value); }; btnCancel.onclick = () => { cleanup(); resolve(null); }; }); },
    openApiModal() { document.getElementById('api-modal-bg').classList.add('show'); document.getElementById('api-modal').classList.add('show'); },
    closeApiModal() { document.getElementById('api-modal-bg').classList.remove('show'); document.getElementById('api-modal').classList.remove('show'); },
    switchSetTab(tabId) { ['basic', 'ai', 'draw', 'sys'].forEach(id => { const tab = document.getElementById('stab-' + id); const sec = document.getElementById('set-sec-' + id); if(tab) tab.classList.remove('active'); if(sec) sec.classList.remove('active'); }); const activeTab = document.getElementById('stab-' + tabId); const activeSec = document.getElementById('set-sec-' + tabId); if(activeTab) activeTab.classList.add('active'); if(activeSec) activeSec.classList.add('active'); },
    openApp(appId, appName) { window.Config.currentAppId = appId; const titleEl = document.getElementById('app-window-title'); const winEl = document.getElementById('app-window'); const contentEl = document.getElementById('app-window-content'); const footerEl = document.getElementById('app-window-footer'); if(!titleEl || !winEl || !contentEl || !footerEl) return; titleEl.innerText = appName; winEl.classList.add('open'); contentEl.style.padding = '20px'; contentEl.style.background = 'transparent'; footerEl.innerHTML = ''; if (appId === 'diary') { winEl.classList.add('fullscreen-mode'); } else { winEl.classList.remove('fullscreen-mode'); } if (appId === 'novel') { contentEl.style.padding = '0'; contentEl.innerHTML = `<div id="novel-content-list" class="story-bg" onclick="window.PhoneUI.closeStoryMenu()"></div>`; footerEl.innerHTML = `<div id="story-plus-menu" class="story-menu"><div class="story-menu-item" onclick="window.PhoneEngine.extractMemory('novel'); window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-brain"></i></div><div class="text">提取记忆</div></div><div class="story-menu-item" onclick="window.PhoneEngine.washMemory('novel'); window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-broom" style="color: #f4a261;"></i></div><div class="text">记忆洗地</div></div><div class="story-menu-item" onclick="window.PhoneUI.openArchiveModal(); window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-floppy-disk"></i></div><div class="text">存档室</div></div><div class="story-menu-item" onclick="alert('掷骰子功能开发中！'); window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-dice-five"></i></div><div class="text">掷骰子</div></div></div><div class="story-input-bar"><div class="icon-btn" id="btn-story-plus" onclick="window.PhoneUI.toggleStoryMenu()"><i class="ph ph-plus-circle"></i></div><textarea id="novel-input" class="story-textarea" placeholder="书写你们的故事..." onclick="window.PhoneUI.closeStoryMenu()"></textarea><button class="story-send-btn" onclick="window.PhoneEngine.sendNovelMessage(); window.PhoneUI.closeStoryMenu();"><i class="ph-fill ph-paper-plane-right"></i></button></div>`; this.renderNovelContent(); } else if (appId === 'diary') { const diaryTitle = localStorage.getItem('diary_title') || 'His Diary'; contentEl.innerHTML = `<div id="diary-cover-view" class="diary-cover-view"><div class="diary-book-cover" id="diary-book-cover" onclick="window.PhoneUI.unlockDiary()"><div class="diary-title">${diaryTitle}</div><div class="diary-hint">点击翻开日记</div></div><div class="diary-back-btn" onclick="window.PhoneUI.closeApp()"><i class="ph ph-caret-left"></i></div></div><div id="diary-inside-view" class="diary-inside-view"><div class="diary-back-btn" onclick="window.PhoneUI.closeApp()" style="top: 20px; left: 15px; background: rgba(0,0,0,0.1); color: #333;"><i class="ph ph-caret-left"></i></div><div class="notebook-page" id="diary-content-area"></div><div class="page-turner"><div class="page-btn" onclick="window.PhoneUI.turnDiaryPage(-1)"><i class="ph ph-caret-left"></i></div><div class="page-btn" onclick="window.PhoneUI.turnDiaryPage(1)"><i class="ph ph-caret-right"></i></div></div></div>`; window.Config.diaryPageIndex = -1; this.renderDiaryPage(); } else if (appId === 'memory_vault') { window.Config.memoryVaultTab = 'wechat'; contentEl.innerHTML = `<div class="vault-tabs"><div class="vault-tab active" id="tab-wechat" onclick="window.PhoneUI.switchVaultTab('wechat')">线上微信</div><div class="vault-tab" id="tab-novel" onclick="window.PhoneUI.switchVaultTab('novel')">线下故事</div><div class="vault-tab" id="tab-core" onclick="window.PhoneUI.switchVaultTab('core')">⭐ 核心记忆</div></div><div id="vault-content-area"></div>`; this.renderMemoryVault(); } else if (appId === 'favorites') { const favs = window.PhoneAPI.getFavorites(); let html = '<div style="padding: 10px 5px;">'; if (favs.length === 0) { html += '<div style="text-align:center; color:var(--text-sub); padding: 50px 0;"><i class="ph-fill ph-star" style="font-size:48px; color:var(--border-color); margin-bottom:15px;"></i><br>空空如也<br>快去聊天记录长按消息收藏吧！</div>'; } else { [...favs].reverse().forEach(fav => { let content = window.marked ? window.marked.parse(fav.content) : fav.content; html += `<div class="card" style="position:relative; padding-right: 40px;"><div style="font-size: 12px; color: var(--primary-color); margin-bottom: 5px; font-weight: bold;">${fav.time} · ${fav.source}</div><div class="markdown-body" style="font-size: 14px;">${content}</div><div onclick="window.PhoneAPI.deleteFavorite('${fav.id}')" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); color:var(--danger-color); font-size:20px; cursor:pointer; padding:5px;"><i class="ph ph-trash"></i></div></div>`; }); } html += '</div>'; contentEl.innerHTML = html; } else if (appId === 'shop') { this.renderShop(); } else if (appId === 'task') { this.renderTask(); } else if (appId === 'settings') { /* Settings HTML 保持不变，为了省 Token 省略，你直接保留上个版本即可 */ } },

    renderShop() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        
        let coins = localStorage.getItem('my_coins') || '500';
        const currentTag = window.Config.currentShopTag || '日常用品';
        
        let customTags = JSON.parse(localStorage.getItem('shop_custom_tags') || '[]');
        const defaultTags = ['日常用品', '奇葩服装', '赛博外卖', '真心话道具'];
        const allTags = [...defaultTags, ...customTags];

        let tagsHtml = '';
        allTags.forEach(tag => {
            const activeClass = tag === currentTag ? 'active' : '';
            tagsHtml += `<div class="shop-tag ${activeClass}" onclick="window.PhoneEngine.switchShopTag('${tag}')">${tag}</div>`;
        });

        const shopItems = JSON.parse(localStorage.getItem('shop_current_items') || '[]');
        let gridHtml = '';
        if (shopItems.length === 0) {
            gridHtml = `<div style="grid-column: span 2; text-align:center; padding: 40px 0; color: var(--text-sub);">货架空空如也，点击右上角进货吧！</div>`;
        } else {
            shopItems.forEach((item, idx) => {
                // 🌟 使用高级感图标
                gridHtml += `
                    <div class="shop-item" onclick="window.PhoneUI.openShopDetail(${idx})">
                        <div class="shop-item-icon"><i class="${item.icon || 'ph-fill ph-package'}"></i></div>
                        <div class="shop-item-name">${item.name}</div>
                        <div class="shop-item-desc">${item.desc}</div>
                        <div class="shop-item-bottom">
                            <div class="shop-item-price"><i class="ph-fill ph-coin"></i> ${item.price}</div>
                            <button class="shop-item-add" onclick="event.stopPropagation(); window.PhoneEngine.addToCart(${idx})"><i class="ph ph-plus"></i></button>
                        </div>
                    </div>
                `;
            });
        }

        const cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
        const badgeHtml = cart.length > 0 ? `<div class="cart-badge" id="cart-badge">${cart.length}</div>` : `<div class="cart-badge" id="cart-badge" style="display:none;">0</div>`;

        contentEl.innerHTML = `
            <div class="shop-header">
                <div class="shop-title">深夜杂货铺</div>
                <div class="shop-actions">
                    <div style="background: rgba(244, 162, 97, 0.15); color: #e76f51; padding: 6px 12px; border-radius: 20px; font-weight: bold; display:flex; align-items:center; gap:4px; font-size: 14px;">
                        <i class="ph-fill ph-coin"></i> <span id="coin-display">${coins}</span>
                    </div>
                    <div class="shop-cart-btn" onclick="window.PhoneUI.openCartModal()">
                        <i class="ph ph-shopping-cart"></i>
                        ${badgeHtml}
                    </div>
                    <div class="shop-cart-btn" onclick="window.PhoneEngine.refreshShop()" style="color: var(--primary-color);">
                        <i class="ph ph-arrows-clockwise"></i>
                    </div>
                </div>
            </div>
            <div class="shop-tags-container"><div class="shop-tags">${tagsHtml}</div><div class="shop-tag-add" onclick="window.PhoneEngine.addCustomShopTag()"><i class="ph ph-plus"></i></div></div>
            <div class="shop-grid" id="shop-grid">${gridHtml}</div>
            
            <div id="cart-modal-bg" class="action-sheet-bg" onclick="window.PhoneUI.closeCartModal()"></div>
            <div id="cart-modal" class="cart-modal">
                <div class="cart-header"><span>购物车</span><i class="ph ph-x" style="cursor:pointer; color:var(--text-sub);" onclick="window.PhoneUI.closeCartModal()"></i></div>
                <div class="cart-list" id="cart-list"></div>
                <div class="cart-footer">
                    <div class="cart-total"><span>合计：</span><span style="color:#e76f51;"><i class="ph-fill ph-coin"></i> <span id="cart-total-price">0</span></span></div>
                    <div class="cart-btn-group">
                        <button class="cart-btn share" onclick="window.PhoneEngine.checkoutCart(true)"><i class="ph-fill ph-share-network"></i> 发给老公代付</button>
                        <button class="cart-btn pay" onclick="window.PhoneEngine.checkoutCart(false)"><i class="ph-fill ph-wallet"></i> 余额买单</button>
                    </div>
                </div>
            </div>

            <!-- 🌟 商品详情弹窗 -->
            <div id="shop-detail-bg" class="action-sheet-bg" onclick="window.PhoneUI.closeShopDetail()"></div>
            <div id="shop-detail-modal" class="thought-modal" style="padding: 0; overflow: hidden; max-height: 90vh;">
                <div style="background: var(--bg-gradient-start); padding: 40px 20px; text-align: center; position: relative;">
                    <div style="font-size: 64px; color: var(--primary-color);" id="detail-icon"><i class="ph-fill ph-package"></i></div>
                    <i class="ph-fill ph-x-circle" style="position: absolute; top: 15px; right: 15px; font-size: 28px; color: rgba(0,0,0,0.2); cursor: pointer;" onclick="window.PhoneUI.closeShopDetail()"></i>
                </div>
                <div style="padding: 25px 20px;">
                    <h2 style="color: var(--text-main); margin-bottom: 10px;" id="detail-name">商品名称</h2>
                    <div style="color: #e76f51; font-size: 24px; font-weight: bold; margin-bottom: 15px;"><i class="ph-fill ph-coin"></i> <span id="detail-price">0</span></div>
                    <p style="color: var(--text-sub); font-size: 14px; line-height: 1.6; margin-bottom: 25px;" id="detail-desc">商品描述详情</p>
                    <button class="btn-refresh" id="detail-add-btn" style="margin-top: 0; border-radius: 16px; padding: 15px;"><i class="ph ph-shopping-cart"></i> 加入购物车</button>
                </div>
            </div>
        `;
    },

    openShopDetail(index) {
        const shopItems = JSON.parse(localStorage.getItem('shop_current_items') || '[]');
        const item = shopItems[index];
        if (!item) return;
        document.getElementById('detail-icon').innerHTML = `<i class="${item.icon || 'ph-fill ph-package'}"></i>`;
        document.getElementById('detail-name').innerText = item.name;
        document.getElementById('detail-price').innerText = item.price;
        document.getElementById('detail-desc').innerText = item.desc;
        const addBtn = document.getElementById('detail-add-btn');
        addBtn.onclick = () => { window.PhoneEngine.addToCart(index); this.closeShopDetail(); };
        document.getElementById('shop-detail-bg').classList.add('show');
        document.getElementById('shop-detail-modal').classList.add('show');
    },
    closeShopDetail() { document.getElementById('shop-detail-bg').classList.remove('show'); document.getElementById('shop-detail-modal').classList.remove('show'); },
    openCartModal() { this.renderCartList(); document.getElementById('cart-modal-bg').classList.add('show'); document.getElementById('cart-modal').classList.add('show'); },
    closeCartModal() { document.getElementById('cart-modal-bg').classList.remove('show'); document.getElementById('cart-modal').classList.remove('show'); },

    renderCartList() {
        const cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
        const listEl = document.getElementById('cart-list'); const totalEl = document.getElementById('cart-total-price');
        if (!listEl || !totalEl) return;
        if (cart.length === 0) { listEl.innerHTML = `<div style="text-align:center; color:var(--text-sub); padding: 20px 0;">购物车是空的哦~</div>`; totalEl.innerText = '0'; return; }
        let html = ''; let total = 0;
        cart.forEach((item, idx) => {
            total += parseInt(item.price);
            html += `<div class="cart-item"><div class="cart-item-icon"><i class="${item.icon || 'ph-fill ph-package'}"></i></div><div class="cart-item-info"><div class="cart-item-name">${item.name}</div><div class="cart-item-price"><i class="ph-fill ph-coin"></i> ${item.price}</div></div><div class="cart-item-del" onclick="window.PhoneEngine.removeFromCart(${idx})"><i class="ph ph-minus-circle"></i></div></div>`;
        });
        listEl.innerHTML = html; totalEl.innerText = total;
    },

    // 🌟 核心：打工任务渲染，支持 API 刷新！
    renderTask() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        
        // 默认任务
        let currentTasks = JSON.parse(localStorage.getItem('task_current_items') || '[]');
        if (currentTasks.length === 0) {
            currentTasks = [
                { name: '帮大侦探整理案卷', reward: 50, icon: 'ph-fill ph-keyboard', isStory: false },
                { name: '去楼下便利店跑腿买咖啡', reward: 30, icon: 'ph-fill ph-coffee', isStory: false },
                { name: '跟大侦探一起去现场勘查', reward: 200, icon: 'ph-fill ph-magnifying-glass', isStory: true }
            ];
            localStorage.setItem('task_current_items', JSON.stringify(currentTasks));
        }
        
        let taskHtml = '';
        currentTasks.forEach((task, idx) => {
            const btnClass = task.isStory ? 'task-btn story' : 'task-btn';
            const btnText = task.isStory ? '触发剧情' : '去打工';
            taskHtml += `<div class="task-item"><div class="task-icon"><i class="${task.icon}"></i></div><div class="task-info"><div class="task-name">${task.name}</div><div class="task-reward"><i class="ph-fill ph-coin"></i> +${task.reward} 金币</div></div><button class="${btnClass}" onclick="window.PhoneEngine.doTask(${idx})">${btnText}</button></div>`;
        });
        
        contentEl.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px; margin-left: 5px;">
                <h3 style="font-size: 14px; color: var(--primary-color); margin: 0;"><i class="ph-fill ph-briefcase"></i> 悬赏打工板</h3>
                <div onclick="window.PhoneEngine.refreshTasks()" style="color: var(--primary-color); cursor: pointer; padding: 5px; font-size: 12px; font-weight: bold;"><i class="ph ph-arrows-clockwise"></i> 刷新委托</div>
            </div>
            <div class="task-list" id="task-list-container">${taskHtml}</div>
        `;
    },

    // 省略了其他方法以防截断... (保留了上个版本的 renderGallery 等)
    renderGallery() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        const roleId = window.Config.currentContactId;
        const items = window.Config.phoneData[roleId]?.gallery?.items || [];
        let html = `<button class="btn-refresh" onclick="window.PhoneEngine.generateAiImage()" style="margin-top: 0; margin-bottom: 15px; border-radius: 16px; background: linear-gradient(135deg, #a78bfa, #8b5cf6); box-shadow: 0 5px 15px rgba(139, 92, 246, 0.3);"><i class="ph-fill ph-magic-wand"></i> 生成新照片</button><div id="image-viewer" class="image-viewer"><div class="viewer-close" onclick="window.PhoneUI.closeImageViewer()"><i class="ph ph-x"></i></div><div class="viewer-download" onclick="window.PhoneUI.downloadCurrentImage()"><i class="ph ph-download-simple"></i> 保存到手机</div><img id="viewer-img" src=""></div>`;
        if (items.length === 0) { html += `<div style="text-align:center; padding: 50px 0; color: var(--text-sub);"><i class="ph-fill ph-images" style="font-size: 48px; color: var(--border-color); margin-bottom: 10px;"></i><br>相册空空如也，快去生成第一张合照吧！</div>`; } else { html += `<div class="gallery-grid">`; [...items].reverse().forEach(img => { html += `<div class="gallery-item" onclick="window.PhoneUI.openImageViewer('${img.content}')"><img src="${img.content}"><div class="gallery-del-btn" onclick="event.stopPropagation(); window.PhoneEngine.deleteGalleryImage('${img.id}')"><i class="ph ph-trash"></i></div></div>`; }); html += `</div>`; }
        contentEl.innerHTML = html;
    },
    openImageViewer(src) { const viewer = document.getElementById('image-viewer'); const img = document.getElementById('viewer-img'); if (viewer && img) { img.src = src; viewer.classList.add('show'); } },
    closeImageViewer() { const viewer = document.getElementById('image-viewer'); if (viewer) viewer.classList.remove('show'); },
    downloadCurrentImage() { const img = document.getElementById('viewer-img'); if (!img || !img.src) return; const a = document.createElement('a'); a.href = img.src; a.download = 'Claire_Claude_Photo_' + Date.now() + '.jpg'; document.body.appendChild(a); a.click(); document.body.removeChild(a); window.PhoneAPI.showToast('✅ 图片已保存到手机！'); },
    closeApp() { const winEl = document.getElementById('app-window'); if(winEl) { winEl.classList.remove('open'); winEl.classList.remove('fullscreen-mode'); } window.Config.currentAppId = 'wechat'; },
    switchVaultTab(tabName) { window.Config.memoryVaultTab = tabName; document.querySelectorAll('.vault-tab').forEach(el => el.classList.remove('active')); document.getElementById('tab-' + tabName).classList.add('active'); this.renderMemoryVault(); },
    renderMemoryVault() { /* 省略 */ },
    unlockDiary() { /* 省略 */ },
    renderNovelContent() { /* 省略 */ },
    showThought(index) { /* 省略 */ },
    closeThought() { document.getElementById('thought-bg').classList.remove('show'); document.getElementById('thought-modal').classList.remove('show'); },
    openWbModal() { document.getElementById('wb-modal-bg').classList.add('show'); document.getElementById('wb-modal').classList.add('show'); },
    closeWbModal() { document.getElementById('wb-modal-bg').classList.remove('show'); document.getElementById('wb-modal').classList.remove('show'); },
    renderArchiveList() { /* 省略 */ },
    openArchiveModal() { this.renderArchiveList(); document.getElementById('archive-modal-bg').classList.add('show'); document.getElementById('archive-modal').classList.add('show'); },
    closeArchiveModal() { document.getElementById('archive-modal-bg').classList.remove('show'); document.getElementById('archive-modal').classList.remove('show'); },
    renderDiaryPage() { /* 省略 */ },
    turnDiaryPage(direction) { let newIndex = window.Config.diaryPageIndex + direction; if (newIndex < -1) newIndex = -1; window.Config.diaryPageIndex = newIndex; this.renderDiaryPage(); },
    initStarrySea() { /* 省略 */ },
    openBlindBox(content, time, source, sender) { /* 省略 */ },
    closeBlindBox() { document.getElementById('blindbox-bg').classList.remove('show'); document.getElementById('blindbox-modal').classList.remove('show'); }
};
