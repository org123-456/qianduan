// 尝试从手机本地缓存读取历史聊天记录
const savedPhoneData = localStorage.getItem('phone_data');

export const Config = {
    currentContactId: 'role_001',
    currentAppId: 'wechat',
    externalData: {
        "role_001": { 
            name: "Claire & Claude", 
            persona: "", 
            memory: "",
            recentChat: ""
        }
    },
    // 如果有缓存就用缓存，如果没有就给个空壳
    phoneData: savedPhoneData ? JSON.parse(savedPhoneData) : {} 
};
