export const PhoneAPI = {
    globalRules: `
【全局生成规则】
1. 必须符合角色人设和世界观。
2. 必须参考长期记忆和近期聊天。
3. 必须只返回合法的 JSON 格式，不要包含任何 markdown 标记(如 \`\`\`json )，不要任何解释。
`,
    
    cleanJSON(str) {
        try {
            let cleanStr = str.replace(/```json/gi, '').replace(/```/g, '').trim();
            return JSON.parse(cleanStr);
        } catch (e) {
            console.error("JSON 解析失败:", str);
            throw new Error("AI 返回的数据格式有误，请重试");
        }
    },

    // 模拟调用 AI (以后在这里换成真实的 API)
    async callAI(prompt) {
        console.log("发送给 AI 的 Prompt:\n", prompt);
        return new Promise((resolve) => {
            setTimeout(() => {
                let mockRes = {};
                if (prompt.includes("统一时间线")) {
                    // 模拟整机生成的数据，匹配最新的蓝白气泡格式！
                    mockRes = {
                        wechat: { 
                            items: [
                                { sender: "other", content: "宝宝，今天下雨了，记得带伞哦 ☔️", time: "08:30" },
                                { sender: "me", content: "知道啦，我已经出门咯！你也是！", time: "08:32" },
                                { sender: "other", content: "乖，晚上想吃什么？", time: "11:45" }
                            ] 
                        },
                        wallet: { 
                            items: [
                                { title: "楼下便利店 (买伞)", desc: "-25.00", time: "08:45" }
                            ] 
                        }
                    };
                }
                resolve(JSON.stringify(mockRes));
            }, 1500); 
        });
    }
};
