export const DiaryUI = {
    unlockDiary() {
        const cover = document.getElementById('diary-book-cover');
        const coverView = document.getElementById('diary-cover-view');
        const insideView = document.getElementById('diary-inside-view');
        if (cover && coverView && insideView) { cover.classList.add('opened'); coverView.classList.add('opened'); insideView.classList.add('opened'); }
        if (window.Config) { window.Config.diaryPageIndex = -1; }
        this.renderDiaryPage();
    },

    touchStartX: 0, touchStartY: 0,
    
    handleSwipeStart(e) { 
        if (e?.changedTouches?.[0]) { 
            this.touchStartX = e.changedTouches[0].screenX; 
            this.touchStartY = e.changedTouches[0].screenY; 
        } 
    },
    
    handleSwipeEnd(e) {
        if (!e?.changedTouches?.[0]) return;
        const touchEndX = e.changedTouches[0].screenX; const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - this.touchStartX; const diffY = touchEndY - this.touchStartY;
        if (Math.abs(diffY) > Math.abs(diffX)) return;
        if (Math.abs(diffX) > 50) { 
            e.stopPropagation(); 
            if (diffX > 50) this.turnDiaryPage(-1); 
            else if (diffX < -50) this.turnDiaryPage(1); 
        }
    },

    turnDiaryPage(direction) {
        let newIndex = (window.Config?.diaryPageIndex ?? -1) + direction;
        if (newIndex < -1) newIndex = -1;
        if (window.Config) window.Config.diaryPageIndex = newIndex;
        this.renderDiaryPage();
    },

    renderDiaryPage() {
        const contentAreaEl = document.getElementById('diary-content-area');
        if (!contentAreaEl) return;
        const currentIndex = window.Config?.diaryPageIndex ?? -1;

        if (currentIndex === -1) {
            const quote = localStorage.getItem('diary_quote') || '“时间会磨平一切痕迹，\n除了我为你写下的字。”';
            const formattedQuote = quote.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
            contentAreaEl.innerHTML = `<div class="notebook-scroll-area" style="display:flex;justify-content:center;align-items:center;height:100%;min-height:300px;"><div class="notebook-empty" style="text-align:center;"><i class="ph-fill ph-feather" style="font-size:48px;color:rgba(0,0,0,0.3);margin-bottom:30px;display:inline-block;"></i><div style="font-family:'Long Cang','Kaiti',cursive;font-size:32px;color:rgba(0,0,0,0.6);text-shadow:1px 1px 2px rgba(255,255,255,0.5);line-height:1.8;padding:0 20px;white-space:pre-wrap;">${formattedQuote}</div></div></div><div class="page-turner"><div class="page-btn" style="opacity:0.3;pointer-events:none;"><i class="ph ph-caret-left"></i></div><div class="page-btn" onclick="window.PhoneUI.turnDiaryPage(1)"><i class="ph ph-caret-right"></i></div></div>`;
            return;
        }

        const startDateStr = localStorage.getItem('diary_start_date') || '2026-09-15';
        let startDate;
        if (startDateStr) { 
            const parts = startDateStr.split('-'); 
            startDate = new Date(parts[0], parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)); 
        } else { 
            startDate = new Date(); 
        }
        const targetDate = new Date(startDate); 
        targetDate.setDate(startDate.getDate() + currentIndex);

        const y = targetDate.getFullYear(); const m = String(targetDate.getMonth() + 1).padStart(2, '0'); const d = String(targetDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`; const weekDays = ['日', '一', '二', '三', '四', '五', '六']; const weekStr = '星期' + weekDays[targetDate.getDay()];
        const displayDate = `${y}年${m}月${d}日`;
        const diaries = window.PhoneAPI ? window.PhoneAPI.getDiaries() : {};
        let content = diaries[dateStr];

        let html = `<div class="notebook-scroll-area" style="overflow-y:auto; height:100%; padding:80px 15px 60px 15px; display:flex; flex-direction:column;"><div class="notebook-header" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(80,130,180,.35);padding-bottom:10px;margin-bottom:15px;flex-shrink:0;"><div class="notebook-date-wrap"><span class="notebook-date" style="font-weight:bold;font-size:18px;">${displayDate}</span><span class="notebook-week" style="margin-left:8px;font-size:13px;color:var(--text-sub);">${weekStr}</span></div><div style="display:flex;align-items:center;gap:12px;">${content ? `<i class="ph ph-arrows-clockwise" onclick="if(confirm('确定要让大侦探重写这页日记吗？')){ if(window.PhoneEngine) window.PhoneEngine.generateDiary('${dateStr}'); }" style="font-size:20px;color:var(--text-sub);cursor:pointer;transition:0.2s;"></i>` : ''}<div class="notebook-mood">☁️</div></div></div>`;

        if (content) {
            content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<思维链>[\s\S]*?<\/思维链>/gi, '').trim();
            html += `<div class="notebook-content" style="flex:1; font-family:'Long Cang','Kaiti',cursive;font-size:22px;line-height:2.15rem;color:#2c2c2c;white-space:pre-wrap;word-break:break-word; margin:0; padding-bottom: 40px;">${this.escapeHtml(content)}</div></div>`;
        } else {
            html += `<div class="notebook-empty" style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center;"><p style="margin-bottom:20px;color:var(--text-sub);font-size:14px;">这一页还是空白的...</p><button class="btn-refresh" onclick="if(window.PhoneEngine) window.PhoneEngine.generateDiary('${dateStr}')" style="width:auto;padding:10px 20px;background:rgba(0,0,0,0.6);border-radius:8px;font-family:sans-serif;font-size:14px;color:#fff;border:none;cursor:pointer;"><i class="ph-fill ph-magic-wand"></i> 偷偷写日记</button></div></div>`;
        }

        html += `<div class="page-turner" style="position:absolute;bottom:15px;left:0;right:0;display:flex;justify-content:space-between;padding:0 25px;pointer-events:none;"><div class="page-btn" onclick="window.PhoneUI.turnDiaryPage(-1)" style="pointer-events:auto;cursor:pointer;background:rgba(255,255,255,0.8);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.1);"><i class="ph ph-caret-left"></i></div><div class="page-btn" onclick="window.PhoneUI.turnDiaryPage(1)" style="pointer-events:auto;cursor:pointer;background:rgba(255,255,255,0.8);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.1);"><i class="ph ph-caret-right"></i></div></div>`;
        contentAreaEl.innerHTML = html;
    },

    initStarrySea() {
        const bgEl = document.getElementById('starry-sea-bg');
        const bubblesEl = document.getElementById('floating-bubbles');
        const fragmentsContainer = document.getElementById('memory-fragments-container');
        if (!bgEl || !bubblesEl || !fragmentsContainer) return;
        setTimeout(() => { bgEl.classList.add('show'); bubblesEl.classList.add('show'); }, 100);

        let starsHtml = '';
        for (let i = 0; i < 50; i++) {
            const size = Math.random() * 3 + 1; const top = Math.random() * 100; const left = Math.random() * 100; const delay = Math.random() * 5; const duration = Math.random() * 3 + 2;
            starsHtml += `<div class="star" style="width:${size}px;height:${size}px;top:${top}%;left:${left}%;animation-delay:${delay}s;animation-duration:${duration}s;"></div>`;
        }
        bgEl.innerHTML = starsHtml;

        const validMemories = window.PhoneAPI ? window.PhoneAPI.getFavorites() : [];
        fragmentsContainer.innerHTML = '';
        if (validMemories.length === 0) {
            const frag = document.createElement('div'); frag.className = 'memory-fragment'; frag.style.cssText = 'top:50%; left:50%; animation-delay:0s;';
            frag.onclick = () => this.openBlindBox("星海空空如也...快去聊天记录里长按消息，点击【手动摘录】或【AI提炼】来收集星星吧！", "系统提示", "星海", "me");
            fragmentsContainer.appendChild(frag);
        } else {
            const shuffled = [...validMemories].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 12);
            selected.forEach(mem => {
                const top = 15 + Math.random() * 65; const left = 10 + Math.random() * 80; const delay = Math.random() * 2; const safeContent = String(mem.content || '');
                const frag = document.createElement('div'); frag.className = 'memory-fragment'; frag.style.cssText = `top:${top}%; left:${left}%; animation-delay:${delay}s;`;
                frag.onclick = () => this.openBlindBox(safeContent, mem.time, mem.source, mem.sender);
                fragmentsContainer.appendChild(frag);
            });
        }
    },

    openBlindBox(content, time, source, sender) {
        const modal = document.getElementById('blindbox-modal');
        const bg = document.getElementById('blindbox-bg');
        const textEl = document.getElementById('blindbox-text');
        const metaEl = document.getElementById('blindbox-meta');
        if (!modal || !bg || !textEl || !metaEl) return;
        const myName = localStorage.getItem('my_name') || '我'; const charName = localStorage.getItem('char_name') || 'TA';
        const senderName = sender === 'me' ? myName : charName;
        let parsed = window.marked ? window.marked.parse(content || '') : (content || '');
        textEl.innerHTML = `“${parsed}”`; metaEl.innerHTML = `${this.escapeHtml(time || '某时')} · ${this.escapeHtml(source || '')} · ${this.escapeHtml(senderName)}`;
        bg.classList.add('show'); modal.classList.add('show');
    },

    closeBlindBox() {
        const bg = document.getElementById('blindbox-bg');
        const modal = document.getElementById('blindbox-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    }
};
