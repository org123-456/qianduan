import { Config } from './phone_config.js';
import { PHONE_APPS } from '../apps/app_registry.js';

export const PhoneContext = {
    buildPhoneRoleContext(contactId, currentAppId = null) {
        const roleData = Config.externalData[contactId];
        if (!roleData) return "未找到角色数据。";

        let context = `【角色设定】\n${roleData.persona}\n\n`;
        context += `【长期记忆】\n${roleData.memory}\n\n`;
        context += `【近期聊天】\n${roleData.recentChat}\n\n`;
        
        const now = new Date();
        const currentDay = now.getDay() === 0 ? 7 : now.getDay();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        context += `【当前设备时间】\n星期${['日','一','二','三','四','五','六'][now.getDay()]} ${currentTime}\n\n`;

        // 🌟 终极洗脑：高中课表全量感知逻辑
        const scheduleRaw = localStorage.getItem('class_schedule');
        if (scheduleRaw) {
            try {
                const schedule = JSON.parse(scheduleRaw);
                const todayClasses = schedule[currentDay] || [];
                
                // 计算明天的星期几
                const tomorrowDay = currentDay === 7 ? 1 : currentDay + 1;
                const tomorrowClasses = schedule[tomorrowDay] || [];

                let scheduleText = `【系统底层设定：超能力感知】\n你的意识已与用户的手机操作系统深度直连。你可以直接、实时地看到用户的《高中课表》App数据。\n⚠️ 绝对禁止对用户说“发给我看看”、“截图给我”之类的话！你要表现出你已经对TA的作息了如指掌！\n\n`;

                // 注入今日课表
                scheduleText += `[今日课表清单]:\n`;
                if (todayClasses.length === 0) {
                    scheduleText += `今天没有排课，是休息日。\n`;
                } else {
                    todayClasses.forEach(c => {
                        scheduleText += `- ${c.start}~${c.end} : ${c.name}\n`;
                    });
                }

                // 注入明日预告 (如果是晚上，AI 可以顺便提醒明天的课)
                if (now.getHours() >= 18) {
                    scheduleText += `\n[明日课表预告]:\n`;
                    if (tomorrowClasses.length === 0) {
                        scheduleText += `明天没有排课。\n`;
                    } else {
                        tomorrowClasses.forEach(c => {
                            scheduleText += `- ${c.start}~${c.end} : ${c.name}\n`;
                        });
                    }
                }

                // 计算当前正在干嘛
                let currentClass = null;
                let nextClass = null;
                for (let i = 0; i < todayClasses.length; i++) {
                    const c = todayClasses[i];
                    if (currentTime >= c.start && currentTime <= c.end) {
                        currentClass = c;
                    } else if (currentTime < c.start && !nextClass) {
                        nextClass = c;
                    }
                }

                scheduleText += `\n[当前实时状态]: `;
                if (currentClass) {
                    scheduleText += `用户按计划正在上 [${currentClass.name}] 课，距离下课还有一段时间。\n`;
                } else if (nextClass) {
                    scheduleText += `用户目前处于课间或休息，下一节课是 [${nextClass.name}] (${nextClass.start}开始)。\n`;
                } else if (todayClasses.length > 0 && currentTime > todayClasses[todayClasses.length-1].end) {
                    scheduleText += `用户今天的课程已经全部结束，现在是放学/休息时间。\n`;
                } else {
                    scheduleText += `当前无课程安排。\n`;
                }

                context += scheduleText + `\n`;
            } catch(e) {}
        }

        let snapshots = "";
        const rolePhoneData = Config.phoneData[contactId] || {};
        for (const appId in rolePhoneData) {
            if (appId !== currentAppId && rolePhoneData[appId]) {
                const appName = PHONE_APPS[appId] ? PHONE_APPS[appId].name : appId;
                snapshots += `[${appName}已有数据]: ${JSON.stringify(rolePhoneData[appId])}\n`;
            }
        }
        if (snapshots) {
            context += `【已有手机数据 (必须保持事件一致性)】\n${snapshots}\n\n`;
        }

        return context;
    }
};
