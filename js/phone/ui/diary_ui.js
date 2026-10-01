export const DiaryUI = {
    currentDiaryBook: 'ta',
    _diariesCache: null,
    _myDiariesCache: null,
    _diaryScheduleTimer: null,
    DIARY_GENERATE_HOUR: 3,
    touchStartX: 0,
    touchStartY: 0,

    renderDiaryShelf() {
        this.openDiaryBook('ta');
    },

    async openDiaryBook(type = 'ta') {
        this.currentDiaryBook = type;

        const coverView = document.getElementById('diary-cover-view');
        const insideView = document.getElementById('diary-inside-view');

        // 从“书架”选择一本后才真正翻开日记。
        if (coverView) coverView.classList.add('opened');
        if (insideView) insideView.classList.add('opened');

        if (window.Config) {
            window.Config.diaryPageIndex = -1;
        }

        if (type === 'mine') {
            this.renderMyDiary();
        } else {
            this.renderDiaryPage();
            // 进入 TA 的日记时自动检查今天有没有生成；忘记点“偷偷写日记”也没关系。
            this.autoGenerateTodayDiary();
        }

        this.bindDiarySwipe();
        this.applyDiaryBackgrounds();
    },

    unlockDiary(type = 'ta') {
        this.openDiaryBook(type);
    },

    bindDiarySwipe() {
        const insideView = document.getElementById('diary-inside-view');
        if (!insideView || insideView.dataset.swipeBound === 'true') return;

        insideView.dataset.swipeBound = 'true';

        insideView.addEventListener(
            'touchstart',
            event => this.handleSwipeStart(event),
            { passive: true }
        );

        insideView.addEventListener(
            'touchend',
            event => this.handleSwipeEnd(event),
            { passive: false }
        );
    },

    handleSwipeStart(event) {
        if (!event?.changedTouches?.[0]) return;
        this.touchStartX = event.changedTouches[0].screenX;
        this.touchStartY = event.changedTouches[0].screenY;
    },

    handleSwipeEnd(event) {
        if (!event?.changedTouches?.[0]) return;
        const endX = event.changedTouches[0].screenX;
        const endY = event.changedTouches[0].screenY;

        const diffX = endX - this.touchStartX;
        const diffY = endY - this.touchStartY;

        if (Math.abs(diffY) > Math.abs(diffX)) return;
        if (Math.abs(diffX) < 50) return;

        event.preventDefault();
        event.stopPropagation();

        if (diffX > 0) {
            this.turnDiaryPage(-1);
        } else {
            this.turnDiaryPage(1);
        }
    },

    turnDiaryPage(direction) {
        let newIndex = (window.Config?.diaryPageIndex ?? -1) + direction;
        if (newIndex < -1) newIndex = -1;
        if (window.Config) {
            window.Config.diaryPageIndex = newIndex;
        }
        this.renderDiaryPage();
    },

    // 🌟 双人书架：放在封面页，选择一本后再进入对应日记。
    showDiaryShelfInline() {
        const area = document.getElementById('moments-diary-inline');
        if (!area) return;
        area.innerHTML = this.renderDiaryShelfInline();
        if (window.PhoneUI?.bindLongPresses) window.PhoneUI.bindLongPresses();
    },

    async openDiaryInline(type = 'ta') {
        // 书架留在 Space；点进某一本后，进入原本的沉浸式全屏日记。
        this.openDiaryFullscreen(type);
    },

    openDiaryFullscreen(type = 'ta') {
        this.currentDiaryBook = type;

        const titleEl = document.getElementById('app-window-title');
        const winEl = document.getElementById('app-window');
        const contentEl = document.getElementById('app-window-content');
        if (!winEl || !contentEl) return;

        const taName = localStorage.getItem('char_name') || 'TA';
        const isMine = type === 'mine';
        const title = isMine ? '我的日记' : `${taName}的日记`;
        const subtitle = isMine ? 'MY DIARY' : 'HIS DIARY';

        if (window.Config) window.Config.currentAppId = 'diary';
        if (titleEl) titleEl.innerText = title;

        winEl.classList.add('open', 'fullscreen-mode');
        contentEl.style.padding = '0';
        contentEl.style.background = 'transparent';
        contentEl.style.display = 'block';
        contentEl.style.overflow = 'hidden';

        contentEl.innerHTML = `
            <div id="diary-cover-view" class="diary-cover-view">
                <div class="diary-book-cover long-pressable" data-img="bg_diary_cover" id="diary-book-cover" onclick="window.PhoneUI.openDiaryBook('${type}')">
                    <div class="diary-title">${this.escapeHtml(title)}</div>
                    <div style="font-size:11px;letter-spacing:4px;opacity:.72;margin-bottom:28px;">${subtitle}</div>
                    <div class="diary-hint">轻触封面，翻开这一页</div>
                </div>
                <div class="diary-back-btn" onclick="window.PhoneUI.closeApp()" aria-label="返回日记架">
                    <i class="ph ph-caret-left"></i>
                </div>
            </div>

            <div id="diary-inside-view" class="diary-inside-view">
                <div class="diary-back-btn" onclick="window.PhoneUI.showDiaryCover()" aria-label="返回封面">
                    <i class="ph ph-caret-left"></i>
                </div>
                <div id="diary-content-area" style="display:flex;flex-direction:column;min-height:100%;"></div>
            </div>
        `;

        this.showDiaryCover();
        this.bindDiarySwipe();
        this.applyDiaryBackgrounds();
    },

    showDiaryCover() {
        const coverView = document.getElementById('diary-cover-view');
        const insideView = document.getElementById('diary-inside-view');
        if (insideView) insideView.classList.remove('opened');
        if (coverView) coverView.classList.remove('opened');
        if (window.Config) window.Config.diaryPageIndex = -1;
    },

    async openDiaryInnerInline() {
        const area = document.getElementById('moments-diary-inline');
        if (!area) return;

        const type = this.currentDiaryBook || 'ta';
        area.innerHTML = `
            <div class="diary-inline-reader diary-inline-pages">
                <button class="diary-inline-back" onclick="window.PhoneUI.openDiaryInline('${type}')">
                    <i class="ph ph-caret-left"></i><span>封面</span>
                </button>
                <div id="diary-inline-content" class="diary-inline-content">
                    <div id="diary-content-area" style="display:flex;flex-direction:column;min-height:0;"></div>
                </div>
            </div>
        `;

        if (type === 'mine') {
            this.renderMyDiary();
        } else {
            if (window.Config) window.Config.diaryPageIndex = -1;
            this.renderDiaryPage();
            await this.autoGenerateTodayDiary();
        }

        this.applyDiaryBackgrounds();
    },

    renderDiaryShelfInline() {
        const taName = localStorage.getItem('char_name') || 'TA';
        return `
            <div class="diary-inline-shelf">
                <div class="diary-inline-intro">
                    <div class="diary-inline-kicker"><i class="ph-fill ph-book-bookmark"></i> OUR PRIVATE DIARY</div>
                    <div class="diary-inline-heading">藏在这里的两本小秘密</div>
                    <div class="diary-inline-desc">一本属于TA，一本属于你。想写的时候，就轻轻翻开。</div>
                </div>

                <div class="diary-inline-books">
                    <button class="diary-inline-book-card ta-book" onclick="window.PhoneUI.openDiaryInline('ta')">
                        <div class="diary-book-spine"></div>
                        <div class="diary-book-paper-edge"></div>
                        <div class="diary-book-card-icon"><i class="ph-fill ph-feather"></i></div>
                        <div class="diary-book-card-title">${this.escapeHtml(taName)}的日记</div>
                        <div class="diary-book-card-subtitle">HIS DIARY</div>
                        <div class="diary-book-card-hint">TA 的心里话 · 自动记录</div>
                    </button>

                    <button class="diary-inline-book-card mine-book" onclick="window.PhoneUI.openDiaryInline('mine')">
                        <div class="diary-book-spine"></div>
                        <div class="diary-book-paper-edge"></div>
                        <div class="diary-book-card-icon"><i class="ph-fill ph-heart"></i></div>
                        <div class="diary-book-card-title">我的日记</div>
                        <div class="diary-book-card-subtitle">MY DIARY</div>
                        <div class="diary-book-card-hint">写给自己的小角落</div>
                    </button>
                </div>

                <div class="diary-inline-footer">
                    <i class="ph ph-sparkle"></i>
                    <span>这里的每一页，都只属于你们两个</span>
                    <i class="ph ph-sparkle"></i>
                </div>
            </div>
        `;
    },

    renderDiaryPage() {
        const contentAreaEl = document.getElementById('diary-content-area');
        if (!contentAreaEl) return;

        const currentIndex = window.Config?.diaryPageIndex ?? -1;

        if (currentIndex === -1) {
            const quote = localStorage.getItem('diary_quote') || '“时间会磨平一切痕迹，\n除了我为你写下的字。”';
            const formattedQuote = this.escapeHtml(quote).replace(/\n/g, '<br>');

            contentAreaEl.innerHTML = `
                <div class="notebook-scroll-area diary-quote-page">
                    <div class="notebook-empty">
                        <i class="ph-fill ph-feather diary-quote-icon"></i>
                        <div class="diary-quote">${formattedQuote}</div>
                    </div>
                </div>

                <div class="page-turner">
                    <button class="page-btn page-btn-disabled" aria-label="上一页"><i class="ph ph-caret-left"></i></button>
                    <button class="page-btn" onclick="window.PhoneUI.turnDiaryPage(1)" aria-label="下一页"><i class="ph ph-caret-right"></i></button>
                </div>
            `;
            return;
        }

        const startDateStr = localStorage.getItem('diary_start_date') || '2026-09-15';
        const parts = startDateStr.split('-');
        const startDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + currentIndex);

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');

        const dateStr = `${year}-${month}-${day}`;
        const displayDate = `${year}年${month}月${day}日`;

        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekStr = `星期${weekDays[targetDate.getDay()]}`;

        // TA 日记由 DiaryUI 自己负责读写；不要从 PhoneAPI 取，否则生成成功后页面读不到。
        const diaries = this.getDiaries();
        let content = diaries?.[dateStr] || '';

        let html = `
            <div class="notebook-scroll-area">
                <div class="notebook-header">
                    <div class="notebook-date-wrap">
                        <span class="notebook-date">${displayDate}</span>
                        <span class="notebook-week">${weekStr}</span>
                    </div>

                    <div class="notebook-tools">
                        ${content ? `
                            <button class="notebook-icon-btn" onclick="window.PhoneUI.regenerateDiary('${dateStr}')" aria-label="重新生成">
                                <i class="ph ph-arrows-clockwise"></i>
                            </button>
                        ` : ''}
                        <div class="notebook-mood">☁️</div>
                    </div>
                </div>
        `;

        if (content) {
            content = String(content)
                .replace(/<think>[\s\S]*?<\/think>/gi, '')
                .replace(/<思维链>[\s\S]*?<\/思维链>/gi, '')
                .trim();

            html += `<div class="notebook-content">${this.escapeHtml(content)}</div>`;
        } else {
            html += `
                <div class="notebook-empty diary-empty-page" style="padding: 40px 0;">
                    <p>这一页还是空白的...</p>
                    <button class="diary-generate-btn" onclick="window.PhoneUI.generateDiary('${dateStr}')" style="margin-top: 15px;">
                        <i class="ph-fill ph-magic-wand"></i> 偷偷写日记
                    </button>
                </div>
            `;
        }

        html += `
            </div>

            <div class="page-turner">
                <button class="page-btn" onclick="window.PhoneUI.turnDiaryPage(-1)" aria-label="上一页">
                    <i class="ph ph-caret-left"></i>
                </button>
                <button class="page-btn" onclick="window.PhoneUI.turnDiaryPage(1)" aria-label="下一页">
                    <i class="ph ph-caret-right"></i>
                </button>
            </div>
        `;

        contentAreaEl.innerHTML = html;
    },

    async hydrateDiaries() {
        if (this._diariesCache) return this._diariesCache;
        let diaries = null;
        try {
            diaries = await window.PhoneAPI?.LocalDB?.get('diary_entries');
            if (typeof diaries === 'string') diaries = JSON.parse(diaries);
        } catch (e) {}
        if (!diaries || typeof diaries !== 'object') {
            try {
                diaries = JSON.parse(localStorage.getItem('diary_entries') || '{}');
            } catch (e) {
                diaries = {};
            }
            // 第一次升级：把旧日记迁进 IndexedDB。
            try {
                if (Object.keys(diaries).length && window.PhoneAPI?.LocalDB) {
                    await window.PhoneAPI.LocalDB.set('diary_entries', JSON.stringify(diaries));
                }
            } catch (e) {}
        }
        this._diariesCache = diaries || {};
        return this._diariesCache;
    },

    getDiaries() {
        if (this._diariesCache) return this._diariesCache;
        try {
            return JSON.parse(localStorage.getItem('diary_entries') || '{}');
        } catch (error) {
            return {};
        }
    },

    async saveDiaries(diaries) {
        this._diariesCache = diaries || {};
        try {
            if (window.PhoneAPI?.LocalDB) {
                await window.PhoneAPI.LocalDB.set('diary_entries', JSON.stringify(this._diariesCache));
            }
        } catch (error) {
            console.error('IndexedDB 保存 TA 日记失败:', error);
        }
        // 兼容旧版本；空间允许时仍保留一份小副本。
        try {
            localStorage.setItem('diary_entries', JSON.stringify(this._diariesCache));
        } catch (error) {}
    },

    getTodayDate() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    },

    async generateDiary(dateStr, { silent = false } = {}) {
        const diaries = this.getDiaries();
        if (diaries[dateStr]) return diaries[dateStr];

        if (!window.PhoneAPI?.chatWithAI) {
            if (!silent) window.PhoneAPI?.showToast?.('请先配置 AI 引擎');
            return null;
        }

        const roleId = window.Config?.currentContactId || 'role_001';
        const roleData = window.Config?.externalData?.[roleId] || {};
        const phoneData = window.Config?.phoneData?.[roleId] || {};
        const chatItems = phoneData?.wechat?.items || [];
        const recentChat = chatItems
            .filter(item => item && item.sender !== 'typing')
            .slice(-30)
            .map(item => `${item.sender === 'me' ? '我' : (roleData.name || 'TA')}: ${item.content || ''}`)
            .join('\\n');

        const prompt = `你正在写自己的私人日记。你就是角色“${roleData.name || 'TA'}”，不是在给用户写总结。

【角色设定】
${roleData.persona || '保持角色原本的性格和说话方式。'}

【长期记忆】
${roleData.memory || '暂无。'}

【最近发生的聊天】
${recentChat || '今天还没有聊天记录。'}

【日期】
${dateStr}

请写一篇今天的私人日记：
1. 只写角色自己真实会记下来的事情、感受和小心思。
2. 可以写今天和“我”的互动，也可以写自己的学习、生活、烦恼、期待。
3. 不要提“AI、模型、提示词、系统、日记生成”等幕后概念。
4. 不要编造明显违背角色设定的重大事件。
5. 使用第一人称，像真的写给自己看的日记。
6. 不要加标题，不要解释，直接输出日记正文，约 200～500 字。`;

        try {
            if (!silent) window.PhoneAPI?.showToast?.('🌙 TA 正在偷偷写今天的日记…');
            const content = await window.PhoneAPI.chatWithAI([{ role: 'system', content: prompt }]);
            const clean = String(content || '').trim();
            if (!clean) return null;

            diaries[dateStr] = clean;
            await this.saveDiaries(diaries);
            return clean;
        } catch (error) {
            console.error('自动生成 TA 日记失败:', error);
            if (!silent) window.PhoneAPI?.showToast?.(error.message || '日记生成失败');
            return null;
        }
    },

    getScheduledDiaryDate(now = new Date()) {
        // 每天凌晨 03:00 结算“昨天”，白天不会自动生成今天的日记。
        const cutoff = new Date(now);
        cutoff.setHours(this.DIARY_GENERATE_HOUR, 0, 0, 0);
        if (now < cutoff) {
            now = new Date(now);
            now.setDate(now.getDate() - 1);
        }
        const target = new Date(now);
        target.setDate(target.getDate() - 1);
        return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    },

    async generateScheduledDiary() {
        const dateStr = this.getScheduledDiaryDate();
        const diaries = await this.hydrateDiaries();
        if (diaries[dateStr]) return diaries[dateStr];

        const content = await this.generateDiary(dateStr, { silent: true });
        if (content) {
            window.PhoneAPI?.showToast?.(`📖 TA ${dateStr} 的日记已经写好了`);
            if (this.currentDiaryBook === 'ta' && document.getElementById('diary-content-area')) {
                const startDateStr = localStorage.getItem('diary_start_date') || dateStr;
                const target = new Date(startDateStr);
                const current = new Date(dateStr);
                const diff = Math.floor((current - target) / 86400000);
                if (window.Config && diff >= -1) {
                    window.Config.diaryPageIndex = diff;
                    this.renderDiaryPage();
                }
            }
        }
        return content;
    },

    scheduleDiaryGeneration() {
        if (this._diaryScheduleTimer) clearTimeout(this._diaryScheduleTimer);

        const now = new Date();
        const next = new Date(now);
        next.setHours(this.DIARY_GENERATE_HOUR, 0, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);

        const delay = next.getTime() - now.getTime();
        this._diaryScheduleTimer = setTimeout(async () => {
            try { await this.generateScheduledDiary(); } catch (e) { console.error('定时生成 TA 日记失败:', e); }
            this.scheduleDiaryGeneration();
        }, delay);

        // 如果 App 是在凌晨 03:00 之后才打开，立即补结算昨天。
        if (now.getHours() >= this.DIARY_GENERATE_HOUR) {
            this.generateScheduledDiary().catch(e => console.error('补结算 TA 日记失败:', e));
        }
    },

    async regenerateDiary(dateStr) {
        if (!confirm('确定要让大侦探重写这页日记吗？')) return;
        const diaries = this.getDiaries();
        delete diaries[dateStr];
        await this.saveDiaries(diaries);
        const content = await this.generateDiary(dateStr);
        if (content) this.renderDiaryPage();
    },

    renderMyDiary() {
        const contentAreaEl = document.getElementById('diary-content-area');
        if (!contentAreaEl) return;

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;

        const entries = this.getMyDiaryEntries();
        const current = entries[date] || { title: '', content: '' };

        contentAreaEl.innerHTML = `
            <div class="my-diary-page" style="padding-top: 60px;">
                <div class="my-diary-paper" style="margin-top: 0;">
                    <div class="my-diary-paper-heading">
                        <span>我的日记</span>
                        <span class="my-diary-date">${date}</span>
                    </div>

                    <input id="my-diary-title" class="my-diary-title-input" type="text" maxlength="80" value="${this.escapeAttribute(current.title)}" placeholder="今天的标题">
                    <textarea id="my-diary-content" class="my-diary-content-input" placeholder="写下今天想留下的话……">${this.escapeHtml(current.content)}</textarea>

                    <div class="my-diary-actions">
                        <button class="my-diary-save" onclick="window.PhoneUI.saveMyDiary()"><i class="ph ph-floppy-disk"></i> 保存日记</button>
                        <button class="my-diary-clear" onclick="window.PhoneUI.clearMyDiary()"><i class="ph ph-trash"></i> 清空</button>
                    </div>
                </div>
            </div>
        `;

        this.applyDiaryBackgrounds();
    },

    async hydrateMyDiaries() {
        if (this._myDiariesCache) return this._myDiariesCache;
        let entries = null;
        try {
            entries = await window.PhoneAPI?.LocalDB?.get('my_diary_entries');
            if (typeof entries === 'string') entries = JSON.parse(entries);
        } catch (e) {}
        if (!entries || typeof entries !== 'object') {
            try { entries = JSON.parse(localStorage.getItem('my_diary_entries') || '{}'); }
            catch (e) { entries = {}; }
            try {
                if (Object.keys(entries).length && window.PhoneAPI?.LocalDB) {
                    await window.PhoneAPI.LocalDB.set('my_diary_entries', JSON.stringify(entries));
                }
            } catch (e) {}
        }
        this._myDiariesCache = entries || {};
        return this._myDiariesCache;
    },

    getMyDiaryEntries() {
        if (this._myDiariesCache) return this._myDiariesCache;
        try {
            return JSON.parse(localStorage.getItem('my_diary_entries') || '{}');
        } catch (error) {
            return {};
        }
    },

    async saveMyDiary() {
        const titleEl = document.getElementById('my-diary-title');
        const contentEl = document.getElementById('my-diary-content');
        if (!titleEl || !contentEl) return;

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;

        const entries = this.getMyDiaryEntries();
        entries[date] = {
            title: titleEl.value.trim(),
            content: contentEl.value.trim(),
            updatedAt: Date.now()
        };

        this._myDiariesCache = entries;
        try { await window.PhoneAPI?.LocalDB?.set('my_diary_entries', JSON.stringify(entries)); } catch (e) {}
        try { localStorage.setItem('my_diary_entries', JSON.stringify(entries)); } catch (e) {}
        if (window.PhoneAPI?.showToast) {
            window.PhoneAPI.showToast('我的日记已保存');
        }
    },

    async clearMyDiary() {
        const titleEl = document.getElementById('my-diary-title');
        const contentEl = document.getElementById('my-diary-content');
        if (titleEl) titleEl.value = '';
        if (contentEl) contentEl.value = '';

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;

        const entries = this.getMyDiaryEntries();
        delete entries[date];

        localStorage.setItem('my_diary_entries', JSON.stringify(entries));
        if (window.PhoneAPI?.showToast) {
            window.PhoneAPI.showToast('今天的日记已清空');
        }
    },

    applyDiaryBackgrounds() {
        const taCover = localStorage.getItem('bg_diary_cover');
        const taPage = localStorage.getItem('bg_diary_page');
        const myPage = localStorage.getItem('my_diary_page');

        document.querySelectorAll('[data-img="bg_diary_cover"]').forEach(el => {
            if (taCover) el.style.backgroundImage = `url("${taCover}")`;
        });

        const taInside = document.querySelector('.diary-inside-view');
        if (taInside && taPage) {
            taInside.style.backgroundImage = `url("${taPage}")`;
        }

        const myPageEl = document.querySelector('.my-diary-page');
        if (myPageEl && myPage) {
            myPageEl.style.backgroundImage = `url("${myPage}")`;
        }
    },

    bindLongPresses() {
        const elements = document.querySelectorAll('.long-pressable');
        const fileInput = document.getElementById('global-file-input');
        if (!fileInput || !elements.length) return;

        let holdTimer = null;
        let pendingKey = null;

        elements.forEach(element => {
            if (element.dataset.bound === 'true') return;
            const key = element.dataset.img;
            if (!key) return;

            element.dataset.bound = 'true';

            const start = () => {
                element.classList.add('holding');
                clearTimeout(holdTimer);
                holdTimer = setTimeout(() => {
                    element.classList.remove('holding');
                    pendingKey = key;
                    fileInput.click();
                }, 500);
            };

            const cancel = () => {
                clearTimeout(holdTimer);
                element.classList.remove('holding');
            };

            element.addEventListener('touchstart', start, { passive: true });
            element.addEventListener('touchend', cancel);
            element.addEventListener('touchmove', cancel, { passive: true });
            element.addEventListener('mousedown', start);
            element.addEventListener('mouseup', cancel);
            element.addEventListener('mouseleave', cancel);
            element.addEventListener('contextmenu', event => event.preventDefault());
        });

        if (fileInput.dataset.diaryBound === 'true') return;
        fileInput.dataset.diaryBound = 'true';

        fileInput.addEventListener('change', async event => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file || !pendingKey) return;

            try {
                const localDB = window.PhoneAPI?.LocalDB;
                if (!localDB) return;

                const blob = await localDB.shrink(file, 800);
                await localDB.set(pendingKey, blob);
                const url = localDB.urlOf(pendingKey, blob);

                document.querySelectorAll(`[data-img="${pendingKey}"]`).forEach(element => {
                    element.style.backgroundImage = `url("${url}")`;
                    const image = element.querySelector('img');
                    if (image) image.src = url;
                });

                if (window.PhoneAPI?.showToast) {
                    window.PhoneAPI.showToast('封面更换成功');
                }
            } catch (error) {
                console.error('保存日记图片失败:', error);
            }
            pendingKey = null;
        });
    },

    escapeHtml(value) {
        if (!value) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    escapeAttribute(value) {
        return this.escapeHtml(value).replace(/\r/g, '').replace(/\n/g, '&#10;');
    }
};
