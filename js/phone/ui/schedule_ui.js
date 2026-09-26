export const ScheduleUI = {
    currentScheduleDay: 1,

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
                <div class="ev-card" style="margin-bottom: 0; flex-direction: row; align-items: center; justify-content: space-between; cursor: pointer; ${cardStyle}" onclick="window.PhoneUI.editScheduleItemManual(${index})">
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

    async editScheduleItemManual(index) {
        const data = this.getScheduleData();
        const todayClasses = data[this.currentScheduleDay] || [];
        const c = todayClasses[index];
        if (!c) return;

        const newStr = await this.showCustomPrompt("编辑课程", `请按格式修改 (课程名,开始时间,结束时间)：\n(提示：删除请输入 DELETE)`, `${c.name},${c.start},${c.end}`);
        if (newStr) {
            if (newStr === 'DELETE') {
                todayClasses.splice(index, 1);
                data[this.currentScheduleDay] = todayClasses;
                this.saveScheduleData(data);
                if (window.PhoneAPI) window.PhoneAPI.showToast("已删除");
                return;
            }
            const parts = newStr.split(',');
            if (parts.length === 3) {
                todayClasses[index] = { name: parts[0].trim(), start: parts[1].trim(), end: parts[2].trim() };
                data[this.currentScheduleDay] = todayClasses;
                this.saveScheduleData(data);
            } else {
                if (window.PhoneAPI) window.PhoneAPI.showToast("格式错误，未保存");
            }
        }
    },

    async addScheduleItemManual() {
        const newStr = await this.showCustomPrompt("添加课程", `输入格式 (课程名,开始时间,结束时间)：`, `自习,19:00,20:00`);
        if (newStr && newStr !== 'DELETE') {
            const parts = newStr.split(',');
            if (parts.length === 3) {
                const data = this.getScheduleData();
                if (!data[this.currentScheduleDay]) data[this.currentScheduleDay] = [];
                data[this.currentScheduleDay].push({ name: parts[0].trim(), start: parts[1].trim(), end: parts[2].trim() });
                this.saveScheduleData(data);
            } else {
                if (window.PhoneAPI) window.PhoneAPI.showToast("格式错误");
            }
        }
    }
};
