import { Config } from '../phone_config.js';
import { PhoneAPI } from '../phone_api.js';
import { PhoneUI } from '../phone_ui.js';

export const ReaderEngine = {
    _proactiveTimer: null,
    _activeThreadCommentId: null,

    importBook(event) {
        const file = event.target.files[0];
        if (!file) return;

        const title = file.name.replace('.txt', '');
        const bookId = 'book_' + Date.now();
        const headerTitle = document.getElementById('reader-header-title');
        if (headerTitle) headerTitle.innerText = '解析中...';
        PhoneAPI.showToast('📚 正在解析并存入书架...');

        const processText = async (text) => {
            try {
                const blob = new Blob([text], { type: 'text/plain' });
                await window.PhoneAPI.LocalDB.set(bookId, blob);

                let bookshelf = JSON.parse(localStorage.getItem('reader_bookshelf') || '[]');
                bookshelf.push({ id: bookId, title, offsets: [0], currentIndex: 0, lastRead: Date.now() });
                localStorage.setItem('reader_bookshelf', JSON.stringify(bookshelf));
                PhoneAPI.showToast('✅ 导入成功！');
                this.renderBookshelf();
            } catch (err) {
                PhoneAPI.showToast('⚠️ 导入失败：' + err.message);
            }
        };

        const reader = new FileReader();
        reader.onload = (e) => {
            let text = e.target.result;
            if (text.indexOf('\uFFFD') !== -1 && text.indexOf('\uFFFD') < 1000) {
                const readerGBK = new FileReader();
                readerGBK.onload = (e2) => { processText(e2.target.result); };
                readerGBK.readAsText(file, 'gbk');
            } else {
                processText(text);
            }
        };
        reader.readAsText(file, 'utf-8');
        event.target.value = '';
    },

    renderBookshelf() {
        const listEl = document.getElementById('bookshelf-list');
        if (!listEl) return;
        const headerTitle = document.getElementById('reader-header-title');
        if (headerTitle) headerTitle.innerText = '共读书架';
        const bookshelf = JSON.parse(localStorage.getItem('reader_bookshelf') || '[]').sort((a, b) => b.lastRead - a.lastRead);

        let html = `
            <div class="book-wrap" onclick="window.PhoneEngine.openNotebook()">
                <div class="book-cover-3d notebook-special">
                    <div style="display:flex; flex-direction:column; align-items:center;">
                        <i class="ph-fill ph-bookmarks" style="font-size: 24px; margin-bottom: 8px;"></i>
                        我的摘录本
                    </div>
                </div>
                <div class="book-title-ui" style="color: var(--primary-color);">高光与吐槽</div>
            </div>
        `;

        if (bookshelf.length === 0) {
            html += '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-sub); margin-top: 50px;"><i class="ph-fill ph-books" style="font-size: 48px; margin-bottom: 10px;"></i><br>暂无书籍</div>';
        } else {
            bookshelf.forEach(book => {
                const progress = book.offsets && book.offsets.length > 1 ? `已读 ${book.currentIndex + 1} 页` : '未读';
                html += `
                <div class="book-wrap" onclick="window.PhoneEngine.openBook('${book.id}')">
                    <div class="book-del-btn" onclick="event.stopPropagation(); window.PhoneEngine.deleteBook('${book.id}')"><i class="ph ph-x"></i></div>
                    <div class="book-cover-3d">${this.escapeHtml(book.title).substring(0, 8)}</div>
                    <div class="book-title-ui">${this.escapeHtml(book.title)}</div>
                    <div class="book-progress-ui">${progress}</div>
                </div>`;
            });
        }
        listEl.innerHTML = html;
    },

    openNotebook() {
        if (window.PhoneUI && window.PhoneUI.showReadingView) window.PhoneUI.showReadingView('我的摘录本');
        const footer = document.getElementById('reader-footer');
        if (footer) footer.style.display = 'none';
        const readingView = document.getElementById('reader-reading-view');
        if (readingView) readingView.style.overflowY = 'auto';
        const container = document.getElementById('reader-page-container');
        if (!container) return;
        const notebook = JSON.parse(localStorage.getItem('reader_notebook') || '[]');
        const charName = localStorage.getItem('char_name') || 'TA';

        if (notebook.length === 0) {
            container.innerHTML = '<div style="text-align:center; margin-top:100px; color:var(--text-sub);"><i class="ph-fill ph-highlighter-circle" style="font-size:48px; margin-bottom:10px;"></i><br>还没有摘录和段评呢。</div>';
            return;
        }

        let html = '<div style="padding-bottom: 40px;">';
        [...notebook].reverse().forEach(item => {
            if (item.type === 'highlight') {
                html += `<div style="margin-bottom: 20px; padding: 15px; background: var(--card-bg); border-radius: 14px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.05);"><div style="font-size:12px; color:var(--text-sub); margin-bottom:7px;">${this.escapeHtml(item.bookTitle)}</div><div style="font-size:16px; line-height:1.8; color:var(--text-main);">${this.escapeHtml(item.quote)}</div></div>`;
            } else {
                let threadHtml = '';
                if (Array.isArray(item.thread)) {
                    item.thread.forEach(msg => {
                        const isTa = msg.sender === 'ta';
                        threadHtml += `<div style="margin-top:6px; font-size:13px; line-height:1.5; color:${isTa ? 'var(--primary-color)' : 'var(--text-main)'};"><b>${isTa ? charName : '我'}：</b>${this.escapeHtml(msg.text || msg.comment || '')}</div>`;
                    });
                } else {
                    threadHtml = `<div style="margin-top:6px; font-size:13px; line-height:1.5; color:var(--primary-color);"><b>${charName}：</b>${this.escapeHtml(item.comment || '')}</div>`;
                }
                html += `<div style="margin-bottom: 20px; padding: 15px; background: var(--card-bg); border-radius: 14px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.05);"><div style="font-size:12px; color:var(--text-sub); margin-bottom:7px;">${this.escapeHtml(item.bookTitle)}</div><div style="font-size:14px; color:var(--text-main); line-height:1.7;">${this.escapeHtml(item.quote)}</div>${threadHtml}</div>`;
            }
        });
        html += '</div>';
        container.innerHTML = html;
        clearTimeout(this._proactiveTimer);
    },

    async openBook(bookId) {
        const bookshelf = JSON.parse(localStorage.getItem('reader_bookshelf') || '[]');
        const book = bookshelf.find(b => b.id === bookId);
        if (!book) return;
        PhoneAPI.showToast('📖 正在打开书本...');
        try {
            const blob = await window.PhoneAPI.LocalDB.get(bookId);
            if (!blob) throw new Error('找不到书籍正文文件');
            const text = await blob.text();
            book.lastRead = Date.now();
            localStorage.setItem('reader_bookshelf', JSON.stringify(bookshelf));
            if (!window.Config) window.Config = {};
            window.Config.readerConfig = { id: book.id, title: book.title, text, offsets: book.offsets || [0], currentIndex: book.currentIndex || 0 };
            if (window.PhoneUI && window.PhoneUI.showReadingView) window.PhoneUI.showReadingView(book.title);
            const readingView = document.getElementById('reader-reading-view');
            if (readingView) readingView.style.overflowY = 'hidden';
            this.renderCurrentPage();
        } catch (e) {
            PhoneAPI.showToast('打开失败：' + e.message);
        }
    },

    deleteBook(bookId) {
        if (!confirm('确定要从书架移除这本书吗？相关的段评和进度也会被删除！')) return;
        let bookshelf = JSON.parse(localStorage.getItem('reader_bookshelf') || '[]');
        bookshelf = bookshelf.filter(b => b.id !== bookId);
        localStorage.setItem('reader_bookshelf', JSON.stringify(bookshelf));
        localStorage.removeItem(`book_comments_${bookId}`);
        localStorage.removeItem(`book_highlights_${bookId}`);
        if (window.PhoneAPI && window.PhoneAPI.LocalDB) window.PhoneAPI.LocalDB.delete(bookId);
        this.renderBookshelf();
    },

    calculatePageEnd(text, startOffset, bookId) {
        const measureDiv = document.createElement('div');
        measureDiv.style.cssText = 'position:absolute; visibility:hidden; width:calc(100% - 40px); padding: 0; font-size:18px; line-height:1.8; text-align:justify; word-break:break-word; z-index:-100;';
        document.body.appendChild(measureDiv);
        const container = document.getElementById('reader-content-area') || document.getElementById('reader-reading-view');
        const maxHeight = container && container.clientHeight > 100 ? container.clientHeight - 100 : window.innerHeight - 180;
        const maxChars = Math.min(1200, text.length - startOffset);
        let low = 1; let high = maxChars; let best = low;

        const formatForMeasure = (str) => {
            const comments = JSON.parse(localStorage.getItem(`book_comments_${bookId}`) || '[]');
            const highlights = JSON.parse(localStorage.getItem(`book_highlights_${bookId}`) || '[]');
            let paragraphs = str.split('\n').filter(p => p.trim());
            return paragraphs.map(p => {
                let pText = p;
                highlights.forEach(h => { if (pText.includes(h)) pText = pText.replace(h, `<span class="highlight-text">${h}</span>`); });
                comments.forEach(c => {
                    if (pText.includes(c.quote)) {
                        pText = pText.replace(c.quote, `<span class="highlight-text">${c.quote}</span>`) + '<span class="comment-badge"><i class="ph-fill ph-chat-circle-dots"></i> 1</span>';
                    }
                });
                return `<p style="margin-bottom: 1em; text-indent: 2em;">${pText}</p>`;
            }).join('');
        };

        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            let testStr = text.substring(startOffset, startOffset + mid);
            measureDiv.innerHTML = formatForMeasure(testStr);
            if (measureDiv.clientHeight <= maxHeight) { best = mid; low = mid + 1; } else { high = mid - 1; }
        }
        document.body.removeChild(measureDiv);

        let finalOffset = startOffset + best;
        if (finalOffset < text.length) {
            const punctuations = ['。', '！', '？', '”', '…', '，', '、', '\n', '”'];
            for (let i = 0; i < 50; i++) {
                let char = text.charAt(finalOffset - i - 1);
                if (punctuations.includes(char)) { finalOffset = finalOffset - i; break; }
            }
        }
        return finalOffset;
    },

    renderCurrentPage() {
        clearTimeout(this._proactiveTimer);
        const config = window.Config?.readerConfig;
        if (!config || !config.text) return;
        const pageContainer = document.getElementById('reader-page-container');
        if (!pageContainer) return;
        if (config.currentIndex < 0) config.currentIndex = 0;
        let startOffset = config.offsets[config.currentIndex];
        if (config.currentIndex === config.offsets.length - 1 && startOffset < config.text.length) {
            const nextOffset = this.calculatePageEnd(config.text, startOffset, config.id);
            if (nextOffset > startOffset) {
                config.offsets.push(nextOffset);
                this._saveBookProgress(config);
            }
        }
        const endOffset = config.offsets[config.currentIndex + 1] || config.text.length;
        const pageText = config.text.substring(startOffset, endOffset);
        const comments = JSON.parse(localStorage.getItem(`book_comments_${config.id}`) || '[]');
        const highlights = JSON.parse(localStorage.getItem(`book_highlights_${config.id}`) || '[]');
        let html = '';
        pageText.split('\n').filter(p => p.trim()).forEach(p => {
            let pText = p;
            let matchedComments = [];
            highlights.forEach(h => { if (pText.includes(h)) pText = pText.replace(h, `<span class="highlight-text">${h}</span>`); });
            comments.forEach(c => {
                if (pText.includes(c.quote)) {
                    pText = pText.replace(c.quote, `<span class="highlight-text">${c.quote}</span>`);
                    matchedComments.push(c);
                }
            });
            let badgesHtml = '';
            matchedComments.forEach(c => {
                const count = (c.thread && c.thread.length) || 1;
                badgesHtml += `<span class="comment-badge" onclick="event.stopPropagation(); window.PhoneEngine.openThreadDrawer('${c.id}')"><i class="ph-fill ph-chat-circle-dots"></i> ${count}</span>`;
            });
            html += `<p style="margin-bottom: 1em; text-indent: 2em; position: relative;">${pText}${badgesHtml}</p>`;
        });
        pageContainer.innerHTML = html;
        const progress = Math.min(100, Math.round((endOffset / config.text.length) * 100));
        const progressEl = document.getElementById('reader-progress');
        if (progressEl) progressEl.innerText = `已读 ${progress}%`;
        this._saveBookProgress(config);
        const menu = document.getElementById('highlight-menu');
        const bubble = document.getElementById('companion-bubble');
        if (menu) menu.style.display = 'none';
        if (bubble) { bubble.style.opacity = '0'; bubble.style.transform = 'translateY(20px)'; }
        this._proactiveTimer = setTimeout(() => { this._triggerProactiveCompanion(); }, 10000);
    },

    _saveBookProgress(config) {
        let bookshelf = JSON.parse(localStorage.getItem('reader_bookshelf') || '[]');
        const idx = bookshelf.findIndex(b => b.id === config.id);
        if (idx !== -1) {
            bookshelf[idx].offsets = config.offsets;
            bookshelf[idx].currentIndex = config.currentIndex;
            localStorage.setItem('reader_bookshelf', JSON.stringify(bookshelf));
        }
    },

    prevPage() {
        if (!window.Config?.readerConfig) return;
        if (window.Config.readerConfig.currentIndex > 0) {
            window.Config.readerConfig.currentIndex--;
            this.renderCurrentPage();
        } else { PhoneAPI.showToast('已经是第一页啦'); }
    },

    nextPage() {
        if (!window.Config?.readerConfig) return;
        const config = window.Config.readerConfig;
        const currentEndOffset = config.offsets[config.currentIndex + 1] || config.text.length;
        if (currentEndOffset < config.text.length) {
            config.currentIndex++;
            this.renderCurrentPage();
        } else { PhoneAPI.showToast('全书完！'); }
    },

    _saveToNotebook(bookTitle, quote, comment, type, thread = null) {
        let notebook = JSON.parse(localStorage.getItem('reader_notebook') || '[]');
        notebook.push({ bookTitle, quote, comment, type, thread, date: Date.now() });
        localStorage.setItem('reader_notebook', JSON.stringify(notebook));
    },

    saveHighlight() {
        const selection = window.getSelection();
        let text = selection.toString().trim();
        if (!text) return;
        text = text.split('\n')[0].trim();
        if (text.length > 60) text = text.substring(0, 60);
        const menu = document.getElementById('highlight-menu');
        if (menu) menu.style.display = 'none';
        selection.removeAllRanges();
        const config = window.Config?.readerConfig;
        if (!config) return;
        let highlights = JSON.parse(localStorage.getItem(`book_highlights_${config.id}`) || '[]');
        if (!highlights.includes(text)) {
            highlights.push(text);
            localStorage.setItem(`book_highlights_${config.id}`, JSON.stringify(highlights));
            this._saveToNotebook(config.title, text, '', 'highlight');
            PhoneAPI.showToast('🖍️ 已划线并收录至摘录本！');
            this.renderCurrentPage();
        }
    },

    async discussHighlight() {
        const selection = window.getSelection();
        let text = selection.toString().trim();
        if (!text) return;
        text = text.split('\n')[0].trim();
        if (text.length > 60) text = text.substring(0, 60);
        const menu = document.getElementById('highlight-menu');
        if (menu) menu.style.display = 'none';
        selection.removeAllRanges();
        const bubble = document.getElementById('companion-bubble');
        const bubbleText = document.getElementById('companion-bubble-text');
        const companionName = document.getElementById('companion-name');
        if (!bubble || !bubbleText || !companionName) return;
        const charName = localStorage.getItem('char_name') || 'TA';
        companionName.innerText = charName;
        bubbleText.innerHTML = '<i class="ph-fill ph-spinner spin-anim"></i> 正在思考...';
        bubble.style.opacity = '1'; bubble.style.transform = 'translateY(0)';
        const config = window.Config?.readerConfig;
        if (!config) return;
        try {
            const persona = localStorage.getItem('char_persona') || '';
            const myName = localStorage.getItem('my_name') || '我';
            const stablePrompt = `你扮演${charName}。以下是你的核心人设：\n${persona}\n\n【系统指令】：你和${myName}正在一起看小说《${config.title}》。`;
            const dynamicPrompt = `就像你正趴在${myName}肩膀上一起看书，在TA耳边轻声说话。必须非常简短，在 20-50 字以内。`;
            let systemContent = [{ type: 'text', text: stablePrompt, cache_control: { type: 'ephemeral' } }, { type: 'text', text: dynamicPrompt }];
            let messages = [{ role: 'system', content: systemContent }, { role: 'user', content: `${myName}对书里的这段话很感兴趣，划了重点：\n“${text}”\n\n请针对这句话给出你的反应或吐槽。` }];
            let rawReply = '';
            try {
                rawReply = await PhoneAPI.chatWithAI(messages);
            } catch (err) {
                if (err.message.includes('content must be a string') || err.message.includes('cache_control')) {
                    messages[0].content = stablePrompt + '\n' + dynamicPrompt;
                    rawReply = await PhoneAPI.chatWithAI(messages);
                } else { throw err; }
            }
            const finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            bubbleText.innerText = finalReply;
            const commentId = 'c_' + Date.now();
            let comments = JSON.parse(localStorage.getItem(`book_comments_${config.id}`) || '[]');
            comments.push({ id: commentId, quote: text, comment: finalReply, thread: [{ sender: 'ta', text: finalReply, time: Date.now() }] });
            localStorage.setItem(`book_comments_${config.id}`, JSON.stringify(comments));
            this._saveToNotebook(config.title, text, finalReply, 'comment', [{ sender: 'ta', text: finalReply }]);
            this.renderCurrentPage();
            setTimeout(() => {
                bubble.style.opacity = '0'; bubble.style.transform = 'translateY(20px)';
            }, 6000);
        } catch (e) {
            bubbleText.innerText = '“唔……有点走神了，没看清。”';
            setTimeout(() => {
                bubble.style.opacity = '0'; bubble.style.transform = 'translateY(20px)';
            }, 3000);
        }
    },

    openThreadDrawer(commentId) {
        const config = window.Config?.readerConfig;
        if (!config) return;
        let comments = JSON.parse(localStorage.getItem(`book_comments_${config.id}`) || '[]');
        const target = comments.find(c => c.id === commentId);
        if (!target) return;
        this._activeThreadCommentId = commentId;
        const drawerBg = document.getElementById('para-drawer-bg');
        const drawer = document.getElementById('para-comment-drawer');
        const quoteBox = document.getElementById('para-drawer-quote');
        if (quoteBox) quoteBox.innerText = `“${target.quote}”`;
        this.renderThreadChat(target);
        if (drawerBg) drawerBg.classList.add('show');
        if (drawer) drawer.classList.add('open');
    },

    closeThreadDrawer() {
        const drawerBg = document.getElementById('para-drawer-bg');
        const drawer = document.getElementById('para-comment-drawer');
        if (drawerBg) drawerBg.classList.remove('show');
        if (drawer) drawer.classList.remove('open');
        this._activeThreadCommentId = null;
    },

    renderThreadChat(commentObj) {
        const chatList = document.getElementById('para-drawer-chat');
        if (!chatList) return;
        const charName = localStorage.getItem('char_name') || 'TA';
        const myName = localStorage.getItem('my_name') || '我';
        const thread = commentObj.thread || [{ sender: 'ta', text: commentObj.comment }];
        let html = '';
        thread.forEach(msg => {
            const isMe = msg.sender === 'me';
            const name = isMe ? myName : charName;
            const align = isMe ? 'flex-end' : 'flex-start';
            const bubbleBg = isMe ? 'linear-gradient(135deg, #9dccff, #6fa8dc)' : 'var(--card-bg)';
            const textColor = isMe ? '#fff' : 'var(--text-main)';
            html += `
                <div style="display:flex; flex-direction:column; align-items:${align}; max-width:85%; align-self:${align};">
                    <span style="font-size:11px; color:var(--text-sub); margin-bottom:4px;">${name}</span>
                    <div style="background:${bubbleBg}; color:${textColor}; padding:10px 14px; border-radius:16px; font-size:14px; line-height:1.6; word-break:break-word; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        ${this.escapeHtml(msg.text)}
                    </div>
                </div>
            `;
        });
        chatList.innerHTML = html;
        setTimeout(() => { chatList.scrollTop = chatList.scrollHeight; }, 50);
    },

    async sendThreadReply() {
        const input = document.getElementById('para-thread-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        const config = window.Config?.readerConfig;
        if (!config || !this._activeThreadCommentId) return;
        let comments = JSON.parse(localStorage.getItem(`book_comments_${config.id}`) || '[]');
        const target = comments.find(c => c.id === this._activeThreadCommentId);
        if (!target) return;
        if (!Array.isArray(target.thread)) target.thread = [{ sender: 'ta', text: target.comment }];
        target.thread.push({ sender: 'me', text, time: Date.now() });
        input.value = '';
        this.renderThreadChat(target);
        const chatList = document.getElementById('para-drawer-chat');
        const typingEl = document.createElement('div');
        typingEl.id = 'thread-typing';
        typingEl.style.cssText = 'font-size:12px; color:var(--text-sub); align-self:flex-start; margin-top:5px;';
        typingEl.innerText = `${localStorage.getItem('char_name') || 'TA'} 正在输入...`;
        if (chatList) chatList.appendChild(typingEl);
        try {
            const charName = localStorage.getItem('char_name') || 'TA';
            const persona = localStorage.getItem('char_persona') || '';
            const myName = localStorage.getItem('my_name') || '我';
            const stablePrompt = `你扮演${charName}。以下是你的核心人设：\n${persona}\n\n【系统指令】：你和${myName}正在看小说《${config.title}》。`;
            let threadHistory = target.thread.map(m => `${m.sender === 'me' ? myName : charName}: ${m.text}`).join('\n');
            let messages = [{ role: 'system', content: [{ type: 'text', text: stablePrompt, cache_control: { type: 'ephemeral' } }, { type: 'text', text: '请针对上下文顺着话题回复用户。' }] }, { role: 'user', content: `以下是你们的讨论历史：\n${threadHistory}\n\n请回复${myName}最后说的话。` }];
            let rawReply = '';
            try {
                rawReply = await PhoneAPI.chatWithAI(messages);
            } catch (err) {
                if (err.message.includes('content must be a string') || err.message.includes('cache_control')) {
                    messages[0].content = stablePrompt + '\n请针对上下文顺着话题回复用户。';
                    rawReply = await PhoneAPI.chatWithAI(messages);
                } else { throw err; }
            }
            const finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            target.thread.push({ sender: 'ta', text: finalReply, time: Date.now() });
            localStorage.setItem(`book_comments_${config.id}`, JSON.stringify(comments));
            const tEl = document.getElementById('thread-typing');
            if (tEl) tEl.remove();
            this.renderThreadChat(target);
            this.renderCurrentPage();
        } catch (e) {
            const tEl = document.getElementById('thread-typing');
            if (tEl) tEl.remove();
            PhoneAPI.showToast('回复失败：' + e.message);
        }
    },

    async _triggerProactiveCompanion() {
        const lastTime = localStorage.getItem('reader_last_proactive') || 0;
        if (Date.now() - lastTime < 5 * 60 * 1000) return;
        const config = window.Config?.readerConfig;
        if (!config || !config.text) return;
        const startOffset = config.offsets[config.currentIndex];
        const endOffset = config.offsets[config.currentIndex + 1] || config.text.length;
        let pageText = config.text.substring(startOffset, endOffset).trim();
        if (pageText.length < 50) return;
        if (pageText.length > 300) pageText = '...' + pageText.substring(pageText.length - 300);
        try {
            const charName = localStorage.getItem('char_name') || 'TA';
            const persona = localStorage.getItem('char_persona') || '';
            const myName = localStorage.getItem('my_name') || '我';
            const stablePrompt = `你扮演${charName}。以下是你的核心人设：\n${persona}\n\n【系统指令】：你和${myName}正在一起看小说《${config.title}》。`;
            const dynamicPrompt = `用户目前正在阅读这一页的内容：\n“${pageText}”\n\n如果这一页有明显的剧情冲突或趣味点，请简短吐槽。`;
            let systemContent = [{ type: 'text', text: stablePrompt, cache_control: { type: 'ephemeral' } }, { type: 'text', text: dynamicPrompt }];
            let messages = [{ role: 'system', content: systemContent }, { role: 'user', content: '请根据上述规则决定是否吐槽。' }];
            let rawReply = '';
            try {
                rawReply = await PhoneAPI.chatWithAI(messages);
            } catch (err) {
                if (err.message.includes('content must be a string') || err.message.includes('cache_control')) {
                    messages[0].content = stablePrompt + '\n' + dynamicPrompt;
                    rawReply = await PhoneAPI.chatWithAI(messages);
                } else { throw err; }
            }
            const finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            if (finalReply === 'PASS' || finalReply.includes('PASS')) {
                localStorage.setItem('reader_last_proactive', Date.now());
                return;
            }
            localStorage.setItem('reader_last_proactive', Date.now());
            const bubble = document.getElementById('companion-bubble');
            const bubbleText = document.getElementById('companion-bubble-text');
            const companionName = document.getElementById('companion-name');
            if (bubble && bubbleText && companionName) {
                companionName.innerText = charName;
                bubbleText.innerText = finalReply;
                bubble.style.opacity = '1'; bubble.style.transform = 'translateY(0)'; bubble.style.pointerEvents = 'auto';
                bubble.onclick = () => {
                    const firstPara = pageText.split('\n').filter(p => p.trim())[0];
                    const quote = firstPara.length > 50 ? firstPara.substring(0, 50) + '...' : firstPara;
                    const commentId = 'c_' + Date.now();
                    let comments = JSON.parse(localStorage.getItem(`book_comments_${config.id}`) || '[]');
                    comments.push({ id: commentId, quote, comment: finalReply, thread: [{ sender: 'ta', text: finalReply, time: Date.now() }] });
                    localStorage.setItem(`book_comments_${config.id}`, JSON.stringify(comments));
                    this._saveToNotebook(config.title, quote, finalReply, 'comment', [{ sender: 'ta', text: finalReply }]);
                    this.renderCurrentPage();
                    bubble.style.opacity = '0'; bubble.style.transform = 'translateY(20px)'; bubble.style.pointerEvents = 'none';
                    PhoneAPI.showToast('✅ 已收录为段评，点击段尾 💬 即可对话！');
                };
                setTimeout(() => {
                    bubble.style.opacity = '0'; bubble.style.transform = 'translateY(20px)'; bubble.style.pointerEvents = 'none'; bubble.onclick = null;
                }, 8000);
            }
        } catch (e) {
            console.error('主动伴读请求失败', e);
        }
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
};

