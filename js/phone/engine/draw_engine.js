/**
 * 🎨 专属绘画引擎 (DrawEngine)
 * 路径: qianduan/js/phone/engine/draw_engine.js
 */
export const DrawEngine = {
    getDrawConfig() {
        return {
            url: localStorage.getItem('img_api_url') || '',
            key: localStorage.getItem('img_api_key') || '',
            model: localStorage.getItem('img_api_model') || 'dall-e-3'
        };
    },

    /**
     * 核心生图方法
     * @param {string} promptText 提示词 (英文效果最佳)
     * @param {object} options 可选参数 { size: '1024x1024' }
     * @returns {Promise<string>} 图片直链或 Base64
     */
    async generateImage(promptText, options = {}) {
        const config = this.getDrawConfig();
        const size = options.size || "1024x1024";

        if (config.url && config.key) {
            let baseUrl = config.url.replace(/\/$/, '');
            let endpoint = baseUrl;
            if (!endpoint.endsWith('/images/generations')) {
                endpoint = endpoint.endsWith('/v1')
                    ? `${endpoint}/images/generations`
                    : `${endpoint}/v1/images/generations`;
            }

            try {
                if (window.PhoneAPI) window.PhoneAPI.showToast("🎨 正在调用自建引擎绘图...");

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.key}`
                    },
                    body: JSON.stringify({
                        prompt: promptText,
                        model: config.model,
                        n: 1,
                        size: size
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    const imgUrl = data.data?.[0]?.url || 
                        (data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : null);
                    if (imgUrl) return imgUrl;
                } else {
                    const errText = await res.text();
                    console.error("[DrawEngine] 自建绘图报错:", res.status, errText);
                    if (window.PhoneAPI) window.PhoneAPI.showToast(`⚠️ 绘图报错(${res.status})，启用保底`);
                }
            } catch (err) {
                console.error("[DrawEngine] 自建绘图网络异常:", err);
                if (window.PhoneAPI) window.PhoneAPI.showToast("⚠️ 绘图网络异常，启用保底");
            }
        }

        // 默认保底引擎 (pollinations.ai 免费服务)
        return this.getFallbackImage(promptText);
    },

    getFallbackImage(promptText) {
        return `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=512&height=512&nologo=true`;
    },

    // 🧪 测试自建 API 连通性
    async testDrawImage() {
        const config = this.getDrawConfig();
        if (!config.url || !config.key) {
            alert("⚠️ 请先在设置里填写【接口地址】和【API Key】！");
            return;
        }

        const testPrompt = "a cute little cat drinking coffee in a cafe, warm sunlight";
        const resultUrl = await this.generateImage(testPrompt);

        if (resultUrl) {
            if (resultUrl.includes('pollinations.ai')) {
                alert("❌ 自建 API 连接失败，已退回免费保底引擎！\n\n请检查：\n1. 接口地址末尾是否正确 (建议写到 /v1)\n2. Key 是否有效或欠费\n3. 模型名称是否在中转站存在 (如 GPT-Image-2 / dall-e-3)");
            } else {
                alert("🎉 恭喜！自建绘图 API 响应成功！已成功出图！");
            }
        }
    }
};
