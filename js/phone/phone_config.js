export const Config = {
    currentContactId: 'role_001',
    currentAppId: 'wechat',
    externalData: {
        "role_001": { 
            name: "Claire & Claude", 
            persona: "情侣日常", 
            memory: "今天下雨了。",
            recentChat: ""
        }
    },
    // 直接塞入写好的假数据，一打开就有气泡！
    phoneData: {
        "role_001": {
            "wechat": {
                "items": [
                    { "sender": "other", "content": "宝宝，今天下雨了，记得带伞哦 ☔️", "time": "08:30" },
                    { "sender": "me", "content": "知道啦，我已经出门咯！你也是！", "time": "08:32" },
                    { "sender": "other", "content": "乖，晚上想吃什么？", "time": "11:45" }
                ]
            },
            "wallet": {
                "items": [
                    { "title": "楼下便利店 (买伞)", "desc": "-25.00", "time": "08:45" }
                ]
            }
        }
    } 
};
