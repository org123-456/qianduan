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
    async callAI(prompt) {
        console.log("发送给 AI 的 Prompt:\n", prompt);
        return new Promise((resolve) => {
            setTimeout(() => {
                let mockRes = {};
                if(prompt.includes("微信")) {
                    mockRes = { items: [ { title: "老妈", desc: "少吃点辣的", time: "10:00" }, { title: "工作群", desc: "收到", time: "11:30" } ] };
                } else if (prompt.includes("钱包")) {
                    mockRes = { items: [ { title: "地铁交通卡", desc: "-4.00", time: "09:15" }, { title: "海底捞火锅", desc: "-198.00", time: "12:30" } ] };
                } else if (prompt.includes("统一时间线")) {
                    mockRes = {
                        wechat: { items: [{title: "朋友", desc: "火锅好吃吗", time: "12:40"}] },
                        wallet: { items: [{title: "海底捞", desc: "-198.00", time: "12:30"}] }
                    };
                }
                resolve(JSON.stringify(mockRes));
            }, 1500); 
        });
    }
};

