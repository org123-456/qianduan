export const DiaryUI = {
    currentDiaryBook: 'ta',
    touchStartX: 0,
    touchStartY: 0,

    renderDiaryShelf() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;

        const taName = localStorage.getItem('char_name') || '他的日记';

        contentEl.style.padding = '0';
        contentEl.style.overflow = 'hidden';

        contentEl.innerHTML = `
            <div class="diary-shelf">
                <div class="diary-shelf-header">
                    <button class="diary-shelf-back"
                            onclick="window.PhoneUI.closeApp()"
                            aria-label="返回">
                        <i class="ph ph-caret-left"></i>
                    </button>

                    <div class="diary-shelf-title">日记</div>
                </div>

                <div class="diary-books">
                    <div class="diary-book-item"
                         onclick="window.PhoneUI.openDiaryBook('ta')">
                        <div class="diary-shelf-book ta-shelf-book"
                             data-img="bg_diary_cover">
                            <div class="diary-shelf-book-title">
                                ${this.escapeHtml(taName)}的日记
                            </div>
                            <div class="diary-shelf-book-subtitle">
                                HIS DIARY
                            </div>
                            <div class="diary-shelf-book-hint">
                                点击打开
                            </div>
                        </div>
                    </div>

                    <div class="diary-book-item"
                         onclick="window.PhoneUI.openDiaryBook('mine')">
                        <div class="diary-shelf-book my-shelf-book"
                             data-img="my_diary_cover">
                            <div class="diary-shelf-book-title">
                                我的日记
                            </div>
                            <div class="diary-shelf-book-subtitle">
                                MY DIARY
                            </div>
                            <div class="diary-shelf-book-hint">
                                点击打开
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.applyDiaryBackgrounds();
        this.bindLongPresses();
    },

    openDiaryBook(type) {
        this.currentDiaryBook = type;

        if (type === 'mine') {
            this.renderMyDiary();
            return;
        }

        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;

        const diaryTitle = localStorage.getItem('diary_title') || 'His Diary';

        contentEl.style.padding = '0';
        contentEl.style.overflow = 'hidden';

        contentEl.innerHTML = `
            <div id="diary-cover-view" class="diary-cover-view">
                <div class="diary-book-cover long-pressable"
                     data-img="bg_diary_cover"
                     id="diary-book-cover"
                     onclick="window.PhoneUI.unlockDiary()">
                    <div class="diary-title">
                        ${this.escapeHtml(diaryTitle)}
                    </div>
                    <div class="diary-hint">
                        点击翻开日记
                    </div>
                </div>

                <div class="diary-back-btn"
                     onclick="window.PhoneUI.renderDiaryShelf()">
                    <i class="ph ph-caret-left"></i>
                </div>
            </div>

            <div id="diary-inside-view" class="diary-inside-view">
                <div class="diary-back-btn diary-inside-back"
                     onclick="window.PhoneUI.renderDiaryShelf()">
                    <i class="ph ph-caret-left"></i>
                </div>

                <div id="diary-content-area"></div>
            </div>
        `;

        this.applyDiaryBackgrounds();
        this.bindLongPresses();
        this.renderDiaryPage();
    },

    unlockDiary() {
        const cover = document.getElementById('diary-book-cover');
        const coverView = document.getElementById('diary-cover-view');
        const insideView = document.getElementById('diary-inside-view');

        if (cover) cover.classList.add('opened');
        if (coverView) coverView.classList.add('opened');
        if (insideView) insideView.classList.add('opened');

        if (window.Config) {
            window.Config.diaryPageIndex = -1;
        }

        this.renderDiaryPage();
        this.bindDiarySwipe();
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

    renderDiaryPage() {
        const contentAreaEl = document.getElementById('diary-content-area');
        if (!contentAreaEl) return;

        const currentIndex = window.Config?.diaryPageIndex ?? -1;

        if (currentIndex === -1) {
            const quote = localStorage.getItem('diary_quote') ||
                '“时间会磨平一切痕迹，\\n除了我为你写下的字。”';

            const formattedQuote = this.escapeHtml(quote)
                .replace(/\\n/g, '<br>')
                .replace(/\n/g, '<br>');

            contentAreaEl.innerHTML = `
                <div class="notebook-scroll-area diary-quote-page">
                    <div class="notebook-empty">
                        <i class="ph-fill ph-feather diary-quote-icon"></i>

                        <div class="diary-quote">
                            ${formattedQuote}
                        </div>
                    </div>
                </div>

                <div class="page-turner">
                    <button class="page-btn page-btn-disabled"
                            aria-label="上一页">
                        <i class="ph ph-caret-left"></i>
                    </button>

                    <button class="page-btn"
                            onclick="window.PhoneUI.turnDiaryPage(1)"
                            aria-label="下一页">
                        <i class="ph ph-caret-right"></i>
                    </button>
                </div>
            `;

            return;
        }

        const startDateStr =
            localStorage.getItem('diary_start_date') || '2026-09-15';

        const parts = startDateStr.split('-');
        const startDate = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + currentIndex);

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');

        const dateStr = `${year}-${month}-${day}`;
        const displayDate = `${year}年${month}月${day}日`;

        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekStr = `星期${weekDays[targetDate.getDay()]}`;

        const diaries = window.PhoneAPI
            ? window.PhoneAPI.getDiaries()
            : {};

        let content = diaries?.[dateStr] || '';

        let html = `
            <div class="notebook-scroll-area">
                <div class="notebook-header">
                    <div class="notebook-date-wrap">
                        <span class="notebook-date">
                            ${displayDate}
                        </span>

                        <span class="notebook-week">
                            ${weekStr}
                        </span>
                    </div>

                    <div class="notebook-tools">
                        ${
                            content
                                ? `
                                    <button class="notebook-icon-btn"
                                            onclick="window.PhoneUI.regenerateDiary('${dateStr}')"
                                            aria-label="重新生成">
                                        <i class="ph ph-arrows-clockwise"></i>
                                    </button>
                                `
                                : ''
                        }

                        <div class="notebook-mood">☁️</div>
                    </div>
                </div>
        `;

        if (content) {
            content = String(content)
                .replace(/

<think>

[\s\S]*?<\/think>/gi, '')
                .replace(/<思维链>[\s\S]*?<\/思维链>/gi, '')
                .trim();

            html += `
                <div class="notebook-content">
                    ${this.escapeHtml(content)}
                </div>
            `;
        } else {
            html += `
                <div class="notebook-empty diary-empty-page">
                    <p>这一页还是空白的...</p>

                    <button class="diary-generate-btn"
                            onclick="window.PhoneUI.generateDiary('${dateStr}')">
                        <i class="ph-fill ph-magic-wand"></i>
                        偷偷写日记
                    </button>
                </div>
            `;
        }

        html += `
            </div>

            <div class="page-turner">
                <button class="page-btn"
                        onclick="window.PhoneUI.turnDiaryPage(-1)"
                        aria-label="上一页">
                    <i class="ph ph-caret-left"></i>
                </button>

                <button class="page-btn"
                        onclick="window.PhoneUI.turnDiaryPage(1)"
                        aria-label="下一页">
                    <i class="ph ph-caret-right"></i>
                </button>
            </div>
        `;

        contentAreaEl.innerHTML = html;
    },

    generateDiary(dateStr) {
        if (
            window.PhoneEngine &&
            typeof window.PhoneEngine.generateDiary === 'function'
        ) {
            window.PhoneEngine.generateDiary(dateStr);
        }
    },

    regenerateDiary(dateStr) {
        if (!confirm('确定要让大侦探重写这页日记吗？')) return;
        this.generateDiary(dateStr);
    },

    renderMyDiary() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;

        const entries = this.getMyDiaryEntries();
        const current = entries[date] || {
            title: '',
            content: ''
        };

        contentEl.style.padding = '0';
        contentEl.style.overflow = 'hidden';

        contentEl.innerHTML = `
            <div class="my-diary-page">
                <button class="diary-back-btn my-diary-back"
                        onclick="window.PhoneUI.renderDiaryShelf()"
                        aria-label="返回书架">
                    <i class="ph ph-caret-left"></i>
                </button>

                <div class="my-diary-paper">
                    <div class="my-diary-paper-heading">
                        <span>我的日记</span>
                        <span class="my-diary-date">${date}</span>
                    </div>

                    <input
                        id="my-diary-title"
                        class="my-diary-title-input"
                        type="text"
                        maxlength="80"
                        value="${this.escapeAttribute(current.title)}"
                        placeholder="今天的标题">

                    <textarea
                        id="my-diary-content"
                        class="my-diary-content-input"
                        placeholder="写下今天想留下的话……">${this.escapeHtml(current.content)}</textarea>

                    <div class="my-diary-actions">
                        <button class="my-diary-save"
                                onclick="window.PhoneUI.saveMyDiary()">
                            <i class="ph ph-floppy-disk"></i>
                            保存日记
                        </button>

                        <button class="my-diary-clear"
                                onclick="window.PhoneUI.clearMyDiary()">
                            <i class="ph ph-trash"></i>
                            清空
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.applyDiaryBackgrounds();
    },

    getMyDiaryEntries() {
        try {
            return JSON.parse(
                localStorage.getItem('my_diary_entries') || '{}'
            );
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

        localStorage.setItem(
            'my_diary_entries',
            JSON.stringify(entries)
        );

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

        localStorage.setItem(
            'my_diary_entries',
            JSON.stringify(entries)
        );

        if (window.PhoneAPI?.showToast) {
            window.PhoneAPI.showToast('今天的日记已清空');
        }
    },

    applyDiaryBackgrounds() {
        const taCover = localStorage.getItem('bg_diary_cover');
        const taPage = localStorage.getItem('bg_diary_page');
        const myCover = localStorage.getItem('my_diary_cover');
        const myPage = localStorage.getItem('my_diary_page');

        document
            .querySelectorAll('[data-img="bg_diary_cover"]')
            .forEach(element => {
                if (taCover) {
                    element.style.backgroundImage =
                        `url("${taCover}")`;
                }
            });

        document
            .querySelectorAll('[data-img="my_diary_cover"]')
            .forEach(element => {
                if (myCover) {
                    element.style.backgroundImage =
                        `url("${myCover}")`;
                }
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

            element.addEventListener('touchstart', start, {
                passive: true
            });

            element.addEventListener('touchend', cancel);
            element.addEventListener('touchmove', cancel, {
                passive: true
            });

            element.addEventListener('mousedown', start);
            element.addEventListener('mouseup', cancel);
            element.addEventListener('mouseleave', cancel);

            element.addEventListener('contextmenu', event => {
                event.preventDefault();
            });
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

                document
                    .querySelectorAll(`[data-img="${pendingKey}"]`)
                    .forEach(element => {
                        element.style.backgroundImage =
                            `url("${url}")`;

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
        return this.escapeHtml(value)
            .replace(/\r/g, '')
            .replace(/\n/g, '&#10;');
    },

    initStarrySea() {
        const bgEl = document.getElementById('starry-sea-bg');
        const bubblesEl = document.getElementById('floating-bubbles');
        const fragmentsContainer =
            document.getElementById('memory-fragments-container');

        if (!bgEl || !bubblesEl || !fragmentsContainer) return;

        setTimeout(() => {
            bgEl.classList.add('show');
            bubblesEl.classList.add('show');
        }, 100);

        let starsHtml = '';

        for (let i = 0; i < 50; i++) {
            const size = Math.random() * 3 + 1;
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 3 + 2;

            starsHtml += `
                <div class="star"
                     style="
                        width:${size}px;
                        height:${size}px;
                        top:${top}%;
                        left:${left}%;
                        animation-delay:${delay}s;
                        animation-duration:${duration}s;
                     ">
                </div>
            `;
        }

        bgEl.innerHTML = starsHtml;

        const validMemories = window.PhoneAPI
            ? window.PhoneAPI.getFavorites()
            : [];

        fragmentsContainer.innerHTML = '';

        if (!validMemories.length) {
            const fragment = document.createElement('div');

            fragment.className = 'memory-fragment';
            fragment.style.cssText =
                'top:50%;left:50%;animation-delay:0s;';

            fragment.onclick = () => {
                this.openBlindBox(
                    '星海空空如也……快去聊天记录里长按消息，点击手动摘录或 AI 提炼来收集星星吧！',
                    '系统提示',
                    '星海',
                    'me'
                );
            };

            fragmentsContainer.appendChild(fragment);
            return;
        }

        const shuffled = [...validMemories]
            .sort(() => 0.5 - Math.random())
            .slice(0, 12);

        shuffled.forEach(memory => {
            const top = 15 + Math.random() * 65;
            const left = 10 + Math.random() * 80;
            const delay = Math.random() * 2;

            const fragment = document.createElement('div');

            fragment.className = 'memory-fragment';
            fragment.style.cssText = `
                top:${top}%;
                left:${left}%;
                animation-delay:${delay}s;
            `;

            fragment.onclick = () => {
                this.openBlindBox(
                    String(memory.content || ''),
                    memory.time,
                    memory.source,
                    memory.sender
                );
            };

            fragmentsContainer.appendChild(fragment);
        });
    },

    openBlindBox(content, time, source, sender) {
        const modal = document.getElementById('blindbox-modal');
        const bg = document.getElementById('blindbox-bg');
        const textEl = document.getElementById('blindbox-text');
        const metaEl = document.getElementById('blindbox-meta');

        if (!modal || !bg || !textEl || !metaEl) return;

        const myName = localStorage.getItem('my_name') || '我';
        const charName = localStorage.getItem('char_name') || 'TA';

        const senderName = sender === 'me'
            ? myName
            : charName;

        const parsed = window.marked
            ? window.marked.parse(content || '')
            : content || '';

        textEl.innerHTML = `“${parsed}”`;

        metaEl.innerHTML = `
            ${this.escapeHtml(time || '某时')}
            ·
            ${this.escapeHtml(source || '')}
            ·
            ${this.escapeHtml(senderName)}
        `;

        bg.classList.add('show');
        modal.classList.add('show');
    },

    closeBlindBox() {
        const bg = document.getElementById('blindbox-bg');
        const modal = document.getElementById('blindbox-modal');

        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    }
};
