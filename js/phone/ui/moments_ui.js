export const MomentsUI = {
    tempMomentImage: null, 

    switchMomentsTab(tab) {
        this.currentMomentsTab = tab;
        if (window.PhoneUI) window.PhoneUI.renderMoments();
        else this.renderMoments();
    },

    toggleLike(momentId) {
        const roleId = window.Config?.currentContactId || 'role_001';
        const moments = window.Config.phoneData[roleId].moments;
        const moment = moments.find(m => m.id === momentId);
        if (moment) {
            moment.likedByMe = !moment.likedByMe;
            localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
            if (window.PhoneUI) window.PhoneUI.renderMoments();
            else this.renderMoments();
        }
    },

    async addComment(momentId) {
        let text = '';
        if (window.PhoneUI && window.PhoneUI.showCustomPrompt) {
            text = await window.PhoneUI.showCustomPrompt('请输入评论内容：');
        } else {
            text = prompt('请输入评论内容：');
        }
        if (!text || !text.trim()) return;

        const roleId = window.Config?.currentContactId || 'role_001';
        const moments = window.Config.phoneData[roleId].moments;
        const moment = moments.find(m => m.id === momentId);
        
        if (moment) {
            const now = new Date();
            if (!moment.comments) moment.comments = [];
            moment.comments.push({
                author: 'me',
                content: text.trim(),
                time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
            });
            localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
            if (window.PhoneUI) window.PhoneUI.renderMoments();
            else this.renderMoments();
            if (window.PhoneAPI) window.PhoneAPI.showToast('评论成功！');
        }
    },

    deleteMoment(momentId) {
        if (!confirm("确定要删除这条动态吗？")) return;
        const roleId = window.Config?.currentContactId || 'role_001';
        let moments = window.Config.phoneData[roleId].moments;
        window.Config.phoneData[roleId].moments = moments.filter(m => m.id !== momentId);
        localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
        if (window.PhoneUI) window.PhoneUI.renderMoments();
        else this.renderMoments();
        if (window.PhoneAPI) window.PhoneAPI.showToast('动态已删除');
    },

    async checkPendingReplies() {
        const roleId = window.Config?.currentContactId || 'role_001';
        if (!window.Config.phoneData[roleId] || !window.Config.phoneData[roleId].moments) return;

        const moments = window.Config.phoneData[roleId].moments;
        const now = Date.now();
        let hasUpdates = false;

        const targetMoment = moments.find(m => 
            m.author === 'me' && m.pendingTaReply && 
            m.pendingTaReply.status === 'pending' && now >= m.pendingTaReply.dueAt
        );

        if (!targetMoment) return;
        
        try {
            const persona = localStorage.getItem('char_persona') || '';
            const myName = localStorage.getItem('my_name') || '我';
            const taName = localStorage.getItem('char_name') || 'TA';

            let sysPrompt = `你扮演${taName}，用户是${myName}。${persona}\n【任务】：用户刚发了一条朋友圈动态。请决定是否点赞和评论。\n【要求】：1. 必须返回严格JSON格式。2. 格式：{"like": true/false, "comment": "评论内容"}。3. 不想评论可留空。4. 评论要符合人设。\n`;
            let userContent = `[用户动态]：\n文字：${targetMoment.content}\n` + (targetMoment.image ? `(附带图片)\n` : '');

            const reply = await window.PhoneAPI.chatWithAI([
                { role: 'system', content: sysPrompt },
                { role: 'user', content: userContent }
            ]);
            
            const result = JSON.parse(reply.replace(/```json/g, '').replace(/```/g, '').trim());

            if (result.like) targetMoment.likedByTa = true;
            if (result.comment && result.comment.trim() !== '') {
                if (!targetMoment.comments) targetMoment.comments = [];
                targetMoment.comments.push({ author: 'ta', content: result.comment.trim(), time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}` });
            }
            targetMoment.pendingTaReply.status = 'done';
            hasUpdates = true;
        } catch (error) {
            targetMoment.pendingTaReply.dueAt = now + 2 * 60 * 1000; 
        }

        if (hasUpdates) {
            localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
            if (this.currentMomentsTab === 'feed') {
                if (window.PhoneUI) window.PhoneUI.renderMoments();
                else this.renderMoments();
            }
        }
    },

    // 🌟 核心修复：直接打开全屏阅读器，跳过底层书架
    openReaderFullscreen(bookId) {
        const readerEl = document.getElementById('app-reader');
        if (readerEl) {
            readerEl.classList.add('open');
            if (window.PhoneUI && window.PhoneUI.initReaderSwipe) window.PhoneUI.initReaderSwipe();
            if (window.PhoneUI && window.PhoneUI.bindReaderSelection) window.PhoneUI.bindReaderSelection();
            
            const shelf = document.getElementById('reader-bookshelf-view');
            if (shelf) shelf.style.display = 'none';
            
            if (bookId === 'notebook') {
                if (window.PhoneEngine && window.PhoneEngine.openNotebook) window.PhoneEngine.openNotebook();
            } else {
                if (window.PhoneEngine && window.PhoneEngine.openBook) window.PhoneEngine.openBook(bookId);
            }
        }
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
            this.checkPendingReplies();
            const roleId = window.Config?.currentContactId || 'role_001';
            if (!window.Config.phoneData[roleId]) window.Config.phoneData[roleId] = {};
            if (!window.Config.phoneData[roleId].moments) window.Config.phoneData[roleId].moments = [];
            const moments = window.Config.phoneData[roleId].moments;

            if (moments.length === 0) {
                bottomHtml = `<div style="text-align:center; color:var(--text-sub); padding:50px 0; font-size:14px;">还没有动态，点击右下角相机发一条吧~</div>`;
            } else {
                const sortedMoments = [...moments].sort((a, b) => b.timestamp - a.timestamp);
                sortedMoments.forEach(m => {
                    if (!m.id) m.id = 'm_' + Math.random().toString(36).substr(2, 9);
                    const isMe = m.author === 'me';
                    let commentsHtml = '';
                    if ((m.likedByTa && isMe) || (m.likedByMe && !isMe) || (m.comments && m.comments.length > 0)) {
                        commentsHtml += `<div class="moment-comments-area">`;
                        const likes = [];
                        if (m.likedByTa && isMe) likes.push(`<i class="ph-fill ph-heart" style="color:var(--danger-color); font-size:12px;"></i> <span class="c-name">${this.escapeHtml(taName)}</span>`);
                        if (m.likedByMe && !isMe) likes.push(`<i class="ph-fill ph-heart" style="color:var(--danger-color); font-size:12px;"></i> <span class="c-name">${this.escapeHtml(myName)}</span>`);
                        if (likes.length > 0) commentsHtml += `<div style="border-bottom: ${m.comments && m.comments.length > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none'}; padding-bottom: 4px; margin-bottom: 4px;">${likes.join(', ')}</div>`;
                        if (m.comments && m.comments.length > 0) {
                            m.comments.forEach(c => { commentsHtml += `<div class="comment-item"><span class="c-name">${this.escapeHtml(c.author === 'me' ? myName : taName)}:</span> ${this.escapeHtml(c.content)}</div>`; });
                        }
                        commentsHtml += `</div>`;
                    }
                    let pendingHint = (isMe && m.pendingTaReply && m.pendingTaReply.status === 'pending') ? `<span style="color: var(--primary-color); font-size: 10px; margin-left: 10px;">(TA 还没看到这条动态...)</span>` : '';
                    
                    bottomHtml += `
                        <div class="moment-card">
                            <img class="moment-avatar" src="${isMe ? myAvatar : taAvatar}">
                            <div class="moment-body">
                                <div class="moment-name">${this.escapeHtml(isMe ? myName : taName)}</div>
                                <div class="moment-text">${this.escapeHtml(m.content)}</div>
                                ${m.image ? `<img class="moment-img" src="${m.image}">` : ''}
                                <div class="moment-footer">
                                    <span>${m.time} ${pendingHint}</span>
                                    <div class="moment-actions">
                                        ${isMe ? `<i class="ph ph-trash" onclick="window.PhoneUI.deleteMoment('${m.id}')" style="margin-right: 10px;"></i>` : ''}
                                        <i class="${m.likedByMe ? 'ph-fill' : 'ph'} ph-heart" style="${m.likedByMe ? 'color:var(--danger-color);' : ''}" onclick="window.PhoneUI.toggleLike('${m.id}')"></i>
                                        <i class="ph ph-chat-circle" onclick="window.PhoneUI.addComment('${m.id}')"></i>
                                    </div>
                                </div>
                                ${commentsHtml}
                            </div>
                        </div>
                    `;
                });
            }
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
        } else if (currentTab === 'reader') {
            // 🌟 核心修复：手动读取缓存，绕开底层 ID 冲突！
            const books = JSON.parse(localStorage.getItem('reader_books') || '[]');
            let booksHtml = '';
            books.forEach(book => {
                booksHtml += `
                    <div class="book-wrap" onclick="window.PhoneUI.openReaderFullscreen('${book.id}')">
                        <div class="book-cover-3d" style="background: linear-gradient(135deg, ${book.color1 || '#8bc6ff'}, ${book.color2 || '#4f81bd'});">
                            <div class="book-cover-title">${this.escapeHtml(book.name)}</div>
                            <div class="book-delete-btn" onclick="event.stopPropagation(); window.PhoneEngine.deleteBook('${book.id}'); setTimeout(()=>window.PhoneUI.renderMoments(), 500);"><i class="ph ph-x"></i></div>
                        </div>
                        <div class="book-title-ui">${this.escapeHtml(book.name)}</div>
                        <div class="book-progress-ui">已读 ${book.progress || 0} 页</div>
                    </div>
                `;
            });

            bottomHtml = `
                <div style="padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div style="font-size: 14px; color: var(--text-sub);">点击书籍进入沉浸阅读</div>
                        <label for="book-upload-inline" style="cursor: pointer; color: var(--primary-color); font-size: 14px; background: var(--icon-bg); padding: 6px 12px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                            <i class="ph-fill ph-folder-plus"></i> 导入TXT
                        </label>
                        <input type="file" id="book-upload-inline" accept=".txt" style="display: none;" onchange="if(window.PhoneEngine) window.PhoneEngine.importBook(event); setTimeout(()=>window.PhoneUI.renderMoments(), 1000);">
                    </div>
                    <div class="bookshelf-grid">
                        <div class="book-wrap" onclick="window.PhoneUI.openReaderFullscreen('notebook')">
                            <div class="book-cover-3d notebook-special">
                                <i class="ph-fill ph-bookmarks" style="font-size: 24px; margin-bottom: 8px;"></i>
                                我的摘录本
                            </div>
                            <div class="book-title-ui" style="color: var(--primary-color);">高光与吐槽</div>
                        </div>
                        ${booksHtml}
                    </div>
                </div>
            `;
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
            
            <div style="height: 20px;"></div>
            
            <div class="moments-menu-bar">
                <div class="moments-menu-item ${currentTab === 'feed' ? 'active' : ''}" onclick="window.PhoneUI.switchMomentsTab('feed')"><i class="${currentTab === 'feed' ? 'ph-fill' : 'ph'} ph-camera"></i> 朋友圈</div>
                <div class="moments-menu-item ${currentTab === 'favorites' ? 'active' : ''}" onclick="window.PhoneUI.switchMomentsTab('favorites')"><i class="${currentTab === 'favorites' ? 'ph-fill' : 'ph'} ph-star"></i> 收藏夹</div>
                <div class="moments-menu-item ${currentTab === 'reader' ? 'active' : ''}" onclick="window.PhoneUI.switchMomentsTab('reader')"><i class="${currentTab === 'reader' ? 'ph-fill' : 'ph'} ph-book-open-text"></i> 书架</div>
                <div class="moments-menu-item" onclick="if(window.PhoneUI) window.PhoneUI.openApp('diary', '我们的日记')"><i class="ph-fill ph-book-bookmark"></i> 日记</div>
            </div>

            <div style="padding-bottom: 80px;">
                ${bottomHtml}
            </div>
        `;

        if (window.PhoneUI && window.PhoneUI.bindLongPresses) window.PhoneUI.bindLongPresses();
    },

    openPostModal() {
        const bg = document.getElementById('post-moment-bg');
        const modal = document.getElementById('post-moment-modal');
        const input = document.getElementById('post-moment-text');
        this.tempMomentImage = null; 
        this.updatePostImageUI();
        if (bg) bg.classList.add('show');
        if (modal) modal.classList.add('show');
        if (input) { input.value = ''; setTimeout(() => input.focus(), 100); }
    },

    closePostModal() {
        const bg = document.getElementById('post-moment-bg');
        const modal = document.getElementById('post-moment-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    triggerMomentImageUpload() {
        let fileInput = document.getElementById('moment-image-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'moment-image-input';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
        }
        fileInput.onchange = (e) => {
            const f = e.target.files && e.target.files[0];
            fileInput.value = '';
            if (!f) return;
            if (window.PhoneAPI) window.PhoneAPI.showToast('图片处理中...');
            const reader = new FileReader();
            reader.onload = (event) => {
                this.tempMomentImage = event.target.result; 
                this.updatePostImageUI(true);
            };
            reader.readAsDataURL(f);
        };
        fileInput.click();
    },

    updatePostImageUI(hasImage = false) {
        const textSpan = document.querySelector('#post-moment-modal span');
        if (textSpan) {
            textSpan.innerText = hasImage ? '✅ 已添加图片' : '添加图片 (暂未选择)';
            textSpan.style.color = hasImage ? 'var(--primary-color)' : 'var(--text-sub)';
        }
    },

    sendMoment() {
        const input = document.getElementById('post-moment-text');
        if (!input) return;
        const text = input.value.trim();
        if (!text && !this.tempMomentImage) { 
            if (window.PhoneAPI) window.PhoneAPI.showToast('总得写点什么或发张图吧！'); 
            return; 
        }

        const roleId = window.Config?.currentContactId || 'role_001';
        if (!window.Config.phoneData[roleId]) window.Config.phoneData[roleId] = {};
        if (!window.Config.phoneData[roleId].moments) window.Config.phoneData[roleId].moments = [];

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const delayMinutes = Math.floor(Math.random() * 3) + 1; 

        const newMoment = {
            id: 'm_' + Date.now(),
            author: 'me',
            content: text,
            image: this.tempMomentImage,
            time: timeStr,
            date: dateStr,
            timestamp: Date.now(),
            likedByTa: false,
            likedByMe: false,
            comments: [],
            pendingTaReply: { dueAt: Date.now() + delayMinutes * 60 * 1000, status: 'pending' }
        };

        window.Config.phoneData[roleId].moments.push(newMoment);
        localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));

        if (window.PhoneAPI && window.PhoneAPI.saveFavorite) {
            let memoryText = `发布了朋友圈动态："${text}"`;
            if (this.tempMomentImage) memoryText += ` (附带了一张照片)`;
            window.PhoneAPI.saveFavorite(memoryText, '朋友圈', 'me');
        }

        this.closePostModal();
        if (window.PhoneUI) window.PhoneUI.renderMoments();
        else this.renderMoments();
        if (window.PhoneAPI) window.PhoneAPI.showToast(`✅ 动态已发送！(TA 大概会在 ${delayMinutes} 分钟后看到)`);
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
};
