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
        context += `【当前设备时间】\n${now.getHours()}:${now.getMinutes()}\n\n`;

        // 🌟 注入高中课表动态感知逻辑
        const scheduleRaw = localStorage.getItem('class_schedule');
        if (scheduleRaw) {
            try {
                const schedule = JSON.parse(scheduleRaw);
                const day = now.getDay() === 0 ? 7 : now.getDay();
                const todayClasses = schedule[day] || [];
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
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

                if (currentClass) {
                    context += `【课表动态】今天是星期${['日','一','二','三','四','五','六'][now.getDay()]}，时间 ${currentTime}。用户按计划正在上 [${currentClass.name}] 课 (时间:${currentClass.start}-${currentClass.end})。请在聊天中自然体现，不要生硬提及。\n\n`;
                } else if (nextClass) {
                    context += `【课表动态】今天是星期${['日','一','二','三','四','五','六'][now.getDay()]}，时间 ${currentTime}。用户目前处于课间或休息，下一节课是 [${nextClass.name}] (${nextClass.start}开始)。\n\n`;
                } else if (todayClasses.length > 0 && currentTime > todayClasses[todayClasses.length-1].end) {
                    context += `【课表动态】今天是星期${['日','一','二','三','四','五','六'][now.getDay()]}，时间 ${currentTime}。用户今天的课程已经全部结束。\n\n`;
                }
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
