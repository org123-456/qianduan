export const MomentsUI = {
    switchMomentsTab(tab) {
        this.currentMomentsTab = tab;
        this.renderMoments();
    },

    renderMoments() {
        const contentEl = document.getElementById('moments-content-area');
        if (!contentEl) return;
        
        const myAvatar = localStorage.getItem('my_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
        const myName = localStorage.getItem('my_name') || '我';
        const taName = localStorage.getItem('char_name') || 'TA';
        
        const coverImg = localStorage.getItem('bg_moments_cover') || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1000&auto=format&fit=crop';
        document.documentElement.style.setProperty('--bg-image-moments-cover', `url('${coverImg}')`);
        
        const currentTab = this.currentMomentsTab || 'feed';
        let bottomHtml = '';
        
        if (currentTab === 'feed') {
            bottomHtml = `
                <div class="moment-card">
                    <img class="moment-avatar" src="${myAvatar}">
                    <div class="moment-body">
                        <div class="moment-name">${myName}</div>
                        <div class="moment-text">今天数学课听得我头都要炸了！！！好想吃宵夜啊啊啊</div>
                        <div class="moment-footer">
                            <span>2分钟前</span>
                            <div class="moment-actions">
                                <i class="ph ph-heart"></i>
                                <i class="ph ph-chat-circle"></i>
                            </div>
                        </div>
                        <div class="moment-comments-area">
                            <div class="comment-item"><i class="ph-fill ph-heart" style="color: var(--danger-color); font-size: 12px;"></i> ${taName}</div>
                            <div class="comment-item"><span class="c-name">${taName}:</span> 笨。哪题不会，拍过来我教你。吃宵夜的话，我顺路给你带。</div>
                        </div>
                    </div>
                </div>
                
                <div class="moment-card">
                    <img class="moment-avatar" src="${taAvatar}">
                    <div class="moment-body">
                        <div class="moment-name">${taName}</div>
                        <div class="moment-text">某人今天肚子疼，还非要喝冰奶茶，记仇。</div>
                        <div class="moment-footer">
                            <span>1小时前</span>
                            <div class="moment-actions">
                                <i class="ph-fill ph-heart" style="color: var(--danger-color);"></i>
                                <i class="ph ph-chat-circle"></i>
                            </div>
                        </div>
                        <div class="moment-comments-area">
                            <div class="comment-item"><i class="ph-fill ph-heart" style="color: var(--danger-color); font-size: 12px;"></i> ${myName}</div>
                            <div class="comment-item"><span class="c-name">${myName}:</span> 我错了嘛！下次不敢了QAQ</div>
                            <div class="comment-item"><span class="c-name">${taName}:</span> 呵，你的下次不敢我听过八百遍了。</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (currentTab === 'favorites') {
            const favs = window.PhoneAPI ? window.PhoneAPI.getFavorites() : [];
            bottomHtml = '<div style="padding:10px 5px;">';
            if (favs.length === 0) { 
                bottomHtml += `<div style="text-align:center;color:var(--text-sub);padding:50px 0;"><i class="ph-fill ph-star" style="font-size:48px;color:var(--border-color);margin-bottom:15px;"></i><br>空空如也<br>快去聊天记录长按消息收藏吧！</div>`; 
            } else {
                [...favs].reverse().forEach(fav => {
                    let content = window.marked ? window.marked.parse(fav.content || '') : (fav.content || '');
                    bottomHtml += `<div class="card" style="position:relative;padding-right:40px;"><div style="font-size:12px;color:var(--primary-color);margin-bottom:5px;font-weight:bold;">${this.escapeHtml(fav.time)} · ${this.escapeHtml(fav.source)}</div><div class="markdown-body" style="font-size:14px;">${content}</div><div onclick="if(window.PhoneAPI) window.PhoneAPI.deleteFavorite('${this.escapeHtml(fav.id)}'); event.stopPropagation();" style="position:absolute;right:15px;top:50%;transform:translateY(-50%);color:var(--danger-color);font-size:20px;cursor:pointer;padding:5px;"><i class="ph ph-trash"></i></div></div>`;
                });
            }
            bottomHtml += '</div>';
        }

        contentEl.innerHTML = `
            <div class="moments-cover long-pressable" data-img="bg_moments_cover">
                <div class="moments-cover-info">
                    <div class="moments-avatar-wrap">
                        <img src="${myAvatar}">
                        <span class="moments-name">${myName}</span>
                    </div>
                    <div class="moments-avatar-wrap">
                        <span class="moments-name">${taName}</span>
                        <img src="${taAvatar}">
                    </div>
                </div>
            </div>
            
            <div style="height: 40px;"></div>

            <div class="status-panel">
                <div class="status-half">
                    <div class="status-title"><i class="ph-fill ph-user"></i> ${myName}的状态</div>
                    <div class="status-item">
                        <span>心情打卡</span>
                        <select style="padding: 2px 5px; border-radius: 4px; font-size: 11px; background: var(--icon-bg); color: var(--text-main); border: 1px solid var(--border-color);">
                            <option>☀️ 开心</option>
                            <option>🌧️ 委屈</option>
                            <option>💢 生气</option>
                            <option>🥱 好困</option>
                        </select>
                    </div>
                    <div class="status-item">
                        <span>🩸 特殊时期</span>
                        <label class="switch" style="transform: scale(0.7); margin-right: -10px;">
                            <input type="checkbox">
                            <span class="slider" style="background-color: #ccc;"></span>
                        </label>
                    </div>
                </div>
                <div class="status-divider"></div>
                <div class="status-half">
                    <div class="status-title"><i class="ph-fill ph-activity"></i> ${taName}的潮汐</div>
                    <div class="status-item">
                        <span>当前阶段</span>
                        <span style="color: #f4a261; font-weight: bold;">[ 蓄积期 ]</span>
                    </div>
                    <div class="status-item" title="热度">
                        <span>🔥</span>
                        <div class="tide-bar-bg"><div class="tide-bar-fill" style="width: 60%; background: #e76f51;"></div></div>
                    </div>
                    <div class="status-item" title="控制力">
                        <span>🛡️</span>
                        <div class="tide-bar-bg"><div class="tide-bar-fill" style="width: 40%; background: #2a9d8f;"></div></div>
                    </div>
                </div>
            </div>
            
            <div class="moments-menu-bar">
                <div class="moments-menu-item ${currentTab === 'feed' ? 'active' : ''}" onclick="window.PhoneUI.switchMomentsTab('feed')"><i class="${currentTab === 'feed' ? 'ph-fill' : 'ph'} ph-camera"></i> 朋友圈动态</div>
                <div class="moments-menu-item ${currentTab === 'favorites' ? 'active' : ''}" onclick="window.PhoneUI.switchMomentsTab('favorites')"><i class="${currentTab === 'favorites' ? 'ph-fill' : 'ph'} ph-star"></i> 星海收藏夹</div>
                <div class="moments-menu-item" onclick="window.PhoneUI.openReader()"><i class="ph-fill ph-book-open-text"></i> 共读时光</div>
                <div class="moments-menu-item" onclick="window.PhoneAPI.showToast('恋爱家规模块开发中...')"><i class="ph-fill ph-scroll"></i> 恋爱家规</div>
            </div>

            <div style="padding-bottom: 80px;">
                ${bottomHtml}
            </div>
        `;
        
        this.bindLongPresses();
    },

    openReader() {
        const readerEl = document.getElementById('app-reader');
        if (readerEl) {
            readerEl.classList.add('open');
            this.initReaderSwipe();
            this.bindReaderSelection();
            
            this.showBookshelf();
            if (window.PhoneEngine && window.PhoneEngine.renderBookshelf) {
                window.PhoneEngine.renderBookshelf();
            }
        }
    },

    closeReader() {
        const readerEl = document.getElementById('app-reader');
        if (readerEl) {
            readerEl.classList.remove('open');
            if (window.PhoneEngine && window.PhoneEngine._proactiveTimer) {
                clearTimeout(window.PhoneEngine._proactiveTimer);
            }
        }
    },

    handleReaderBack() {
        const readingView = document.getElementById('reader-reading-view');
        if (readingView && readingView.style.display === 'block') {
            this.showBookshelf();
            if (window.PhoneEngine && window.PhoneEngine._proactiveTimer) {
                clearTimeout(window.PhoneEngine._proactiveTimer);
            }
        } else {
            this.closeReader();
        }
    },

    showBookshelf() {
        document.getElementById('reader-bookshelf-view').style.display = 'block';
        document.getElementById('reader-reading-view').style.display = 'none';
        document.getElementById('reader-footer').style.display = 'none';
        document.getElementById('reader-header-title').innerText = "共读书架";
        document.getElementById('btn-add-book').style.display = 'block';
        
        if (window.PhoneEngine && window.PhoneEngine._proactiveTimer) {
            clearTimeout(window.PhoneEngine._proactiveTimer);
        }
    },

    showReadingView(title) {
        document.getElementById('reader-bookshelf-view').style.display = 'none';
        document.getElementById('reader-reading-view').style.display = 'block';
        document.getElementById('reader-footer').style.display = 'flex';
        document.getElementById('reader-header-title').innerText = title || "阅读中";
        document.getElementById('btn-add-book').style.display = 'none';
    },

    initReaderSwipe() {
        const area = document.getElementById('reader-reading-view');
        if (!area || this._readerSwipeBound) return;
        
        let startX = 0; let startY = 0;
        
        area.addEventListener('touchstart', (e) => {
            if (e.changedTouches[0]) {
                startX = e.changedTouches[0].screenX;
                startY = e.changedTouches[0].screenY;
            }
        }, { passive: true });
        
        area.addEventListener('touchend', (e) => {
            if (!e.changedTouches[0]) return;
            const endX = e.changedTouches[0].screenX;
            const endY = e.changedTouches[0].screenY;
            const diffX = endX - startX;
            const diffY = endY - startY;
            
            if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    if (window.PhoneEngine && window.PhoneEngine.prevPage) window.PhoneEngine.prevPage();
                } else {
                    if (window.PhoneEngine && window.PhoneEngine.nextPage) window.PhoneEngine.nextPage();
                }
            }
        });
        this._readerSwipeBound = true;
    },

    bindReaderSelection() {
        const area = document.getElementById('reader-page-container');
        const menu = document.getElementById('highlight-menu');
        if (!area || !menu || this._selectionBound) return;

        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection();
            const readerEl = document.getElementById('app-reader');
            if (!readerEl || !readerEl.classList.contains('open')) return;

            if (selection.toString().trim().length > 0 && area.contains(selection.anchorNode)) {
                menu.style.display = 'flex';
            } else {
                menu.style.display = 'none';
            }
        });
        this._selectionBound = true;
    }
};
