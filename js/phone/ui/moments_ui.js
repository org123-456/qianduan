export const MomentsUI = {
    tempMomentImage: null, 

    switchMomentsTab(tab) {
        this.currentMomentsTab = tab;
        this.renderMoments();
    },

    // 🌟 1. 点赞功能
    toggleLike(momentId) {
        const roleId = window.Config?.currentContactId || 'role_001';
        const moments = window.Config.phoneData[roleId].moments;
        const moment = moments.find(m => m.id === momentId);
        if (moment) {
            moment.likedByMe = !moment.likedByMe;
            localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
            this.renderMoments();
        }
    },

    // 🌟 2. 评论功能
    async addComment(momentId) {
        const text = await window.PhoneUI.showCustomPrompt('请输入评论内容：');
        if (!text || !text.trim()) return;

        const roleId = window.Config?.currentContactId || 'role_001';
        const moments = window.Config.phoneData[roleId].moments;
        const moment = moments.find(m => m.id === momentId);
        
        if (moment) {
            const now = new Date();
            moment.comments.push({
                author: 'me',
                content: text.trim(),
                time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
            });
            localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
            this.renderMoments();
            if (window.PhoneAPI) window.PhoneAPI.showToast('评论成功！');
        }
    },

    // 🌟 3. 删除功能
    deleteMoment(momentId) {
        if (!confirm("确定要删除这条动态吗？")) return;
        
        const roleId = window.Config?.currentContactId || 'role_001';
        let moments = window.Config.phoneData[roleId].moments;
        window.Config.phoneData[roleId].moments = moments.filter(m => m.id !== momentId);
        
        localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
        this.renderMoments();
        if (window.PhoneAPI) window.PhoneAPI.showToast('动态已删除');
    },

    // 🌟 惰性生成核心：检查有没有到期需要 AI 回复的动态
    async checkPendingReplies() {
        const roleId = window.Config?.currentContactId || 'role_001';
        if (!window.Config.phoneData[roleId] || !window.Config.phoneData[roleId].moments) return;

        const moments = window.Config.phoneData[roleId].moments;
        const now = Date.now();
        let hasUpdates = false;

        const targetMoment = moments.find(m => 
            m.author === 'me' && 
            m.pendingTaReply && 
            m.pendingTaReply.status === 'pending' && 
            now >= m.pendingTaReply.dueAt
        );

        if (!targetMoment) return;

        console.log("朋友圈：发现到期动态，开始静默生成回复...");
        
        try {
            const persona = localStorage.getItem('char_persona') || '';
            const myName = localStorage.getItem('my_name') || '我';
            const taName = localStorage.getItem('char_name') || 'TA';

            let sysPrompt = `你扮演${taName}，用户是${myName}。${persona}\n`;
            sysPrompt += `【任务】：用户刚发了一条朋友圈动态。请你根据动态内容，决定是否点赞和评论。\n`;
            sysPrompt += `【要求】：\n`;
            sysPrompt += `1. 必须返回严格的 JSON 格式，不要有任何其他文字！\n`;
            sysPrompt += `2. 格式：{"like": true/false, "comment": "你的评论内容"}\n`;
            sysPrompt += `3. 如果你不想评论，comment 可以留空字符串 ""。\n`;
            sysPrompt += `4. 评论要符合你的人设，就像真人在刷朋友圈一样，可以吐槽、关心、或者高冷。\n`;

            let userContent = `[用户的朋友圈动态]：\n文字内容：${targetMoment.content}\n`;
            if (targetMoment.image) {
                userContent += `(附带了一张图片)\n`;
            }

            const messages = [
                { role: 'system', content: sysPrompt },
                { role: 'user', content: userContent }
            ];

            const reply = await window.PhoneAPI.chatWithAI(messages);
            
            let cleanJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanJson);

            if (result.like) {
                targetMoment.likedByTa = true;
            }
            if (result.comment && result.comment.trim() !== '') {
                targetMoment.comments.push({
                    author: 'ta',
                    content: result.comment.trim(),
                    time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
                });
            }

            targetMoment.pendingTaReply.status = 'done';
            hasUpdates = true;

        } catch (error) {
            console.error("朋友圈静默回复失败:", error);
            targetMoment.pendingTaReply.dueAt = now + 2 * 60 * 1000; 
        }

        if (hasUpdates) {
            localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
            if (this.currentMomentsTab === 'feed') {
                this.renderMoments();
            }
        }
    },

    triggerCoverUpload() {
        let fileInput = document.getElementById('moment-cover-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'moment-cover-input';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
        }
        
        fileInput.onchange = (e) => {
            const f = e.target.files && e.target.files[0];
            fileInput.value = '';
            if (!f) return;
            
            if (window.PhoneAPI) window.PhoneAPI.showToast('封面上传中...');
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Str = event.target.result;
                localStorage.setItem('bg_moments_cover', base64Str);
                document.documentElement.style.setProperty('--bg-image-moments-cover', `url('${base64Str}')`);
                if (window.PhoneAPI) window.PhoneAPI.showToast('✨ 封面更换成功！');
            };
            reader.readAsDataURL(f);
        };
        fileInput.click();
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
                    const isMe = m.author === 'me';
                    const avatar = isMe ? myAvatar : taAvatar;
                    const name = isMe ? myName : taName;
                    
                    let imgHtml = '';
                    if (m.image) {
                        imgHtml = `<img class="moment-img" src="${m.image}">`;
                    }

                    let commentsHtml = '';
                    if ((m.likedByTa && isMe) || (m.likedByMe && !isMe) || (m.comments && m.comments.length > 0)) {
                        commentsHtml += `<div class="moment-comments-area">`;
                        
                        const likes = [];
                        if (m.likedByTa && isMe) likes.push(`<i class="ph-fill ph-heart" style="color:var(--danger-color); font-size:12px;"></i> <span class="c-name">${this.escapeHtml(taName)}</span>`);
                        if (m.likedByMe && !isMe) likes.push(`<i class="ph-fill ph-heart" style="color:var(--danger-color); font-size:12px;"></i> <span class="c-name">${this.escapeHtml(myName)}</span>`);
                        
                        if (likes.length > 0) {
                            commentsHtml += `<div style="border-bottom: ${m.comments && m.comments.length > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none'}; padding-bottom: 4px; margin-bottom: 4px;">${likes.join(', ')}</div>`;
                        }

                        if (m.comments && m.comments.length > 0) {
                            m.comments.forEach(c => {
                                const cName = c.author === 'me' ? myName : taName;
                                commentsHtml += `<div class="comment-item"><span class="c-name">${this.escapeHtml(cName)}:</span> ${this.escapeHtml(c.content)}</div>`;
                            });
                        }
                        commentsHtml += `</div>`;
                    }

                    let pendingHint = '';
                    if (isMe && m.pendingTaReply && m.pendingTaReply.status === 'pending') {
                        pendingHint = `<span style="color: var(--primary-color); font-size: 10px; margin-left: 10px;">(TA 还没看到这条动态...)</span>`;
                    }

                    // 🌟 渲染点赞、评论、删除按钮
                    bottomHtml += `
                        <div class="moment-card">
                            <img class="moment-avatar" src="${avatar}">
                            <div class="moment-body">
                                <div class="moment-name">${this.escapeHtml(name)}</div>
                                <div class="moment-text">${this.escapeHtml(m.content)}</div>
                                ${imgHtml}
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
        }

        contentEl.innerHTML = `
            <div class="moments-cover" style="position: relative;">
                <div onclick="window.PhoneUI.triggerCoverUpload()" style="position: absolute; top: 110px; right: 20px; background: rgba(0,0,0,0.4); color: white; padding: 6px 12px; border-radius: 12px; font-size: 12px; cursor: pointer; backdrop-filter: blur(5px); z-index: 10;">
                    <i class="ph-fill ph-camera"></i> 换封面
                </div>
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
                <div class="moments-menu-item ${currentTab === 'feed' ? 'active' : ''}" onclick="window.PhoneUI.switchMomentsTab('feed')"><i class="${currentTab === 'feed' ? 'ph-fill' : 'ph'} ph-camera"></i> 朋友圈动态</div>
                <div class="moments-menu-item ${currentTab === 'favorites' ? 'active' : ''}" onclick="window.PhoneUI.switchMomentsTab('favorites')"><i class="${currentTab === 'favorites' ? 'ph-fill' : 'ph'} ph-star"></i> 星海收藏夹</div>
                <div class="moments-menu-item" onclick="window.PhoneUI.openReader()"><i class="ph-fill ph-book-open-text"></i> 共读时光</div>
                <div class="moments-menu-item" onclick="window.PhoneUI.openApp('diary', '我们的日记')"><i class="ph-fill ph-book-bookmark"></i> 我们的日记</div>
            </div>

            <div style="padding-bottom: 80px;">
                ${bottomHtml}
            </div>
        `;
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
            pendingTaReply: {
                dueAt: Date.now() + delayMinutes * 60 * 1000, 
                status: 'pending'
            }
        };

        window.Config.phoneData[roleId].moments.push(newMoment);
        localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));

        // 🌟 联动核心：发朋友圈的同时，自动存入“星海记忆库”，聊天引擎会自动读取！
        if (window.PhoneAPI && window.PhoneAPI.saveFavorite) {
            let memoryText = `发布了朋友圈动态："${text}"`;
            if (this.tempMomentImage) memoryText += ` (附带了一张照片)`;
            window.PhoneAPI.saveFavorite(memoryText, '朋友圈', 'me');
        }

        this.closePostModal();
        this.renderMoments();
        
        if (window.PhoneAPI) window.PhoneAPI.showToast(`✅ 动态已发送！(TA 大概会在 ${delayMinutes} 分钟后看到)`);
    },

    openReader() {
        const readerEl = document.getElementById('app-reader');
        if (readerEl) {
            readerEl.classList.add('open');
            if (this.initReaderSwipe) this.initReaderSwipe();
            if (this.bindReaderSelection) this.bindReaderSelection();
            if (this.showBookshelf) this.showBookshelf();
            if (window.PhoneEngine && window.PhoneEngine.renderBookshelf) {
                window.PhoneEngine.renderBookshelf();
            }
        }
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};
