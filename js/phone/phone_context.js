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

        let snapshots = "";
        const rolePhoneData = Config.phoneData[contactId] || {};
        for (const appId in rolePhoneData) {
            if (appId !== currentAppId && rolePhoneData[appId]) {
                const appName = PHONE_APPS[appId].name;
                snapshots += `[${appName}已有数据]: ${JSON.stringify(rolePhoneData[appId])}\n`;
            }
        }
        if (snapshots) {
            context += `【已有手机数据 (必须保持事件一致性)】\n${snapshots}\n\n`;
        }

        return context;
    }
};

