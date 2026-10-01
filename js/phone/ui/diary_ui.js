export const DiaryUI = {
    currentDiaryBook: 'ta',
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
    renderDiaryShelfInline() {
        const taName = localStorage.getItem('char_name') || 'TA';
        return `
            <div class="diary-shelf-inline-container" style="margin-top: 40px; padding: 20px 10px 40px; border-top: 1px dashed rgba(0,0,0,0.15);">
                <div style="font-size: 13px; font-weight: bold; color: var(--primary-color); margin-bottom: 15px; text-align: center; letter-spacing: 1px;">
                    📖 双人日记架 · 选择一本打开
                </div>
                <div style="display: flex; justify-content: center; gap: 15px;">
                    <div onclick="window.PhoneUI.openDiaryBook('ta')" 
                         style="flex: 1; max-width: 150px; background: linear-gradient(145deg, #789bbc, #354f70); border-radius: 8px 14px 14px 8px; padding: 18px 10px; color: #fff; text-align: center; cursor: pointer; box-shadow: 0 8px 20px rgba(0,0,0,0.15); transition: 0.2s;">
                        <div style="font-family: 'Long Cang', cursive; font-size: 19px; font-weight: bold;">${this.escapeHtml(taName)}的日记</div>
                        <div style="font-size: 9px; opacity: 0.8; margin-top: 6px; letter-spacing: 1px;">HIS DIARY</div>
                    </div>
                    <div onclick="window.PhoneUI.openDiaryBook('mine')" 
                         style="flex: 1; max-width: 150px; background: linear-gradient(145deg, #d69aaa, #754d68); border-radius: 8px 14px 14px 8px; padding: 18px 10px; color: #fff; text-align: center; cursor: pointer; box-shadow: 0 8px 20px rgba(0,0,0,0.15); transition: 0.2s;">
                        <div style="font-family: 'Long Cang', cursive; font-size: 19px; font-weight: bold;">我的日记</div>
                        <div style="font-size: 9px; opacity: 0.8; margin-top: 6px; letter-spacing: 1px;">MY DIARY</div>
                    </div>
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
                    ${this.renderDiaryShelfInline()}
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

        const diaries = window.PhoneAPI ? window.PhoneAPI.getDiaries() : {};
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

        // 🌟 将书架直接附在日记正文下方
        html += `
                ${this.renderDiaryShelfInline()}
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

    getDiaries() {
        try {
            return JSON.parse(localStorage.getItem('diary_entries') || '{}');
        } catch (error) {
            return {};
        }
    },

    saveDiaries(diaries) {
        try {
            localStorage.setItem('diary_entries', JSON.stringify(diaries));
        } catch (error) {
            console.error('保存 TA 日记失败:', error);
        }
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
            this.saveDiaries(diaries);
            return clean;
        } catch (error) {
            console.error('自动生成 TA 日记失败:', error);
            if (!silent) window.PhoneAPI?.showToast?.(error.message || '日记生成失败');
            return null;
        }
    },

    async autoGenerateTodayDiary() {
        const dateStr = this.getTodayDate();
        const diaries = this.getDiaries();
        if (diaries[dateStr]) return;

        const content = await this.generateDiary(dateStr, { silent: true });
        if (content) {
            // 如果用户当前正停在今天这一页，生成完成后立即刷新。
            const startDateStr = localStorage.getItem('diary_start_date') || dateStr;
            const target = new Date(startDateStr);
            const today = new Date(dateStr);
            const diff = Math.floor((today - target) / 86400000);
            if (diff >= -1 && window.Config) {
                window.Config.diaryPageIndex = diff;
                this.renderDiaryPage();
            }
            window.PhoneAPI?.showToast?.('📖 TA 今天的日记已经偷偷写好了');
        }
    },

    regenerateDiary(dateStr) {
        if (!confirm('确定要让大侦探重写这页日记吗？')) return;
        this.generateDiary(dateStr);
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
                ${this.renderDiaryShelfInline()}
            </div>
        `;

        this.applyDiaryBackgrounds();
    },

    getMyDiaryEntries() {
        try {
            return JSON.parse(localStorage.getItem('my_diary_entries') || '{}');
        } catch (error) {
            return {};
        }
    },

    saveMyDiary() {
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

        localStorage.setItem('my_diary_entries', JSON.stringify(entries));
        if (window.PhoneAPI?.showToast) {
            window.PhoneAPI.showToast('我的日记已保存');
        }
    },

    clearMyDiary() {
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
