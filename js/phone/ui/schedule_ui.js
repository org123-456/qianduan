export const ScheduleUI = {
    currentScheduleDay: 1,
    editingIndex: -1, // -1 表示新增，>=0 表示编辑

    getDefaultSchedule() {
        return {
            "1": [{name: "早读", start: "07:30", end: "08:00"}, {name: "语文", start: "08:10", end: "08:50"}, {name: "数学", start: "09:00", end: "09:40"}],
            "2": [], "3": [], "4": [], "5": [], "6": [], "7": []
        };
    },

    getScheduleData() {
        const data = localStorage.getItem('class_schedule');
        return data ? JSON.parse(data) : this.getDefaultSchedule();
    },

    saveScheduleData(data) {
        localStorage.setItem('class_schedule', JSON.stringify(data));
        this.renderSchedule();
    },

    switchScheduleTab(day) {
        this.currentScheduleDay = day;
        this.renderSchedule();
    },

    renderSchedule() {
        const tabsEl = document.getElementById('schedule-tabs');
        const listEl = document.getElementById('schedule-list-area');
        if (!tabsEl || !listEl) return;

        const days = ['一', '二', '三', '四', '五', '六', '日'];
        let tabsHtml = '';
        for (let i = 1; i <= 7; i++) {
            tabsHtml += `<div class="vault-tab ${this.currentScheduleDay === i ? 'active' : ''}" onclick="window.PhoneUI.switchScheduleTab(${i})" style="min-width: 50px;">周${days[i-1]}</div>`;
        }
        tabsEl.innerHTML = tabsHtml;

        const data = this.getScheduleData();
        const todayClasses = data[this.currentScheduleDay] || [];
        
        todayClasses.sort((a, b) => a.start.localeCompare(b.start));

        const now = new Date();
        const currentDay = now.getDay() === 0 ? 7 : now.getDay();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (todayClasses.length === 0) {
            listEl.innerHTML = '<div class="ev-empty">今天没有课哦，好好休息吧~</div>';
            return;
        }

        let listHtml = '';
        todayClasses.forEach((c, index) => {
            const isToday = this.currentScheduleDay === currentDay;
            const isCurrent = isToday && currentTime >= c.start && currentTime <= c.end;
            const isPast = isToday && currentTime > c.end;

            let statusColor = isCurrent ? 'var(--primary-color)' : (isPast ? 'var(--text-sub)' : 'var(--text-main)');
            let cardStyle = isCurrent ? 'border: 2px solid var(--primary-color); box-shadow: 0 4px 15px rgba(111,168,220,0.3);' : '';
            let dotAnim = isCurrent ? '<div class="typing-dot" style="margin-right: 5px;"></div>' : '';

            listHtml += `
                <div class="ev-card" style="margin-bottom: 0; flex-direction: row; align-items: center; justify-content: space-between; cursor: pointer; ${cardStyle}" onclick="window.PhoneUI.openScheduleModal(${index})">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="display: flex; flex-direction: column; align-items: center; color: ${statusColor}; font-family: monospace;">
                            <span style="font-size: 14px; font-weight: bold;">${c.start}</span>
                            <span style="font-size: 10px; opacity: 0.7;">${c.end}</span>
                        </div>
                        <div style="width: 2px; height: 30px; background: var(--border-color);"></div>
                        <div style="font-size: 16px; font-weight: bold; color: ${statusColor}; display: flex; align-items: center;">
                            ${dotAnim} ${this.escapeHtml(c.name)}
                        </div>
                    </div>
                    <i class="ph ph-pencil-simple" style="color: var(--text-sub);"></i>
                </div>
            `;
        });
        listEl.innerHTML = listHtml;
    },

    async importScheduleAI() {
        const text = await this.showCustomPrompt("✨ AI 智能排课", "请粘贴班级群里的课表文字（例如：上午1-4节语数英理...），AI会自动帮你整理好！");
        if (!text) return;
        
        if (window.PhoneAPI) window.PhoneAPI.showToast("AI 正在光速整理课表，请稍候...");
        
        try {
            const sysPrompt = `你是一个课表解析助手。用户会发给你一段课表文本。请你将其解析为严格的 JSON 格式。
规则：
1. 键必须是 "1" 到 "7" 的字符串，代表周一到周日。
2. 值是数组，数组里是对象，格式：{"name": "课程名", "start": "08:00", "end": "08:45"}。
3. 如果用户没有说明具体时间，请按高中常见作息推断（如早读7:30-8:00，上午4节，下午4节，晚自习等）。
4. 必须只输出合法的 JSON 字符串，不要有任何 Markdown 标记，不要有任何解释。`;
            
            const messages = [ { role: 'system', content: sysPrompt }, { role: 'user', content: text } ];
            const reply = await window.PhoneAPI.chatWithAI(messages);
            
            if (reply) {
                let cleanJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanJson);
                this.saveScheduleData(parsed);
                if (window.PhoneAPI) window.PhoneAPI.showToast("✅ 课表解析成功！");
            }
        } catch (error) {
            console.error(error);
            if (window.PhoneAPI) window.PhoneAPI.showToast("❌ 解析失败，请检查文本或稍后重试");
        }
    },

    // 打开编辑/新增弹窗
    openScheduleModal(index = -1) {
        this.editingIndex = index;
        const bg = document.getElementById('schedule-modal-bg');
        const modal = document.getElementById('schedule-modal');
        const titleEl = document.getElementById('schedule-modal-title');
        const inName = document.getElementById('sched-in-name');
        const inStart = document.getElementById('sched-in-start');
        const inEnd = document.getElementById('sched-in-end');
        const btnDel = document.getElementById('sched-btn-del');

        if (!bg || !modal) return;

        if (index >= 0) {
            // 编辑模式
            const data = this.getScheduleData();
            const c = data[this.currentScheduleDay][index];
            titleEl.innerHTML = '<i class="ph-fill ph-pencil-simple"></i> 编辑课程';
            inName.value = c.name;
            inStart.value = c.start;
            inEnd.value = c.end;
            btnDel.style.display = 'block'; // 显示删除按钮
        } else {
            // 新增模式
            titleEl.innerHTML = '<i class="ph-fill ph-plus-circle"></i> 添加课程';
            inName.value = '';
            inStart.value = '08:00';
            inEnd.value = '08:45';
            btnDel.style.display = 'none'; // 隐藏删除按钮
        }

        bg.classList.add('show');
        modal.classList.add('show');
    },

    closeScheduleModal() {
        const bg = document.getElementById('schedule-modal-bg');
        const modal = document.getElementById('schedule-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    saveScheduleItem() {
        const name = document.getElementById('sched-in-name').value.trim();
        const start = document.getElementById('sched-in-start').value;
        const end = document.getElementById('sched-in-end').value;

        if (!name || !start || !end) {
            if (window.PhoneAPI) window.PhoneAPI.showToast("请填写完整信息！");
            return;
        }
        if (start >= end) {
            if (window.PhoneAPI) window.PhoneAPI.showToast("结束时间必须晚于开始时间！");
            return;
        }

        const data = this.getScheduleData();
        if (!data[this.currentScheduleDay]) data[this.currentScheduleDay] = [];

        if (this.editingIndex >= 0) {
            // 更新
            data[this.currentScheduleDay][this.editingIndex] = { name, start, end };
            if (window.PhoneAPI) window.PhoneAPI.showToast("修改已保存");
        } else {
            // 新增
            data[this.currentScheduleDay].push({ name, start, end });
            if (window.PhoneAPI) window.PhoneAPI.showToast("添加成功");
        }

        this.saveScheduleData(data);
        this.closeScheduleModal();
    },

    deleteScheduleItem() {
        if (this.editingIndex < 0) return;
        const data = this.getScheduleData();
        data[this.currentScheduleDay].splice(this.editingIndex, 1);
        this.saveScheduleData(data);
        this.closeScheduleModal();
        if (window.PhoneAPI) window.PhoneAPI.showToast("课程已删除");
    }
};
