import { Config } from './phone_config.js';
import { PhoneContext } from './phone_context.js';
import { PhoneAPI } from './phone_api.js';
import { PHONE_APPS } from '../apps/app_registry.js';
import { PhoneUI } from './phone_ui.js';

export const PhoneEngine = {
    async refreshSingleApp(appId = Config.currentAppId) {
        PhoneUI.showLoading(true);
        try {
            const app = PHONE_APPS[appId];
            const context = PhoneContext.buildPhoneRoleContext(Config.currentContactId, appId);
            const finalPrompt = context + PhoneAPI.globalRules + `\n【当前App专属规则】\n${app.prompt}`;
            
            const aiResponse = await PhoneAPI.callAI(finalPrompt);
            const jsonData = PhoneAPI.cleanJSON(aiResponse);
            
            if (!Config.phoneData[Config.currentContactId]) Config.phoneData[Config.currentContactId] = {};
            Config.phoneData[Config.currentContactId][appId] = jsonData;
            
            PhoneUI.renderAppContent(appId);
        } catch (e) {
            alert(e.message);
        } finally {
            PhoneUI.showLoading(false);
        }
    },

    async refreshWholePhone() {
        PhoneUI.showLoading(true);
        try {
            const context = PhoneContext.buildPhoneRoleContext(Config.currentContactId);
            const finalPrompt = context + PhoneAPI.globalRules + `
【整机生成特殊规则】
请先在内部构建一个统一的生活事件时间线。
然后让不同的 App 从同一条时间线中抽取对应的信息，确保跨 App 数据高度一致。
请一次性返回整部手机的 JSON，格式如下：
{
    "wechat": { ...微信的JSON... },
    "wallet": { ...钱包的JSON... }
}`;
            
            const aiResponse = await PhoneAPI.callAI(finalPrompt);
            const jsonData = PhoneAPI.cleanJSON(aiResponse);
            
            if (!Config.phoneData[Config.currentContactId]) Config.phoneData[Config.currentContactId] = {};
            for (let appId in jsonData) {
                if (PHONE_APPS[appId]) {
                    Config.phoneData[Config.currentContactId][appId] = jsonData[appId];
                }
            }
            alert("整机生成完毕！");
        } catch (e) {
            alert(e.message);
        } finally {
            PhoneUI.showLoading(false);
        }
    }
};

