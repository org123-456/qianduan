const nodemailer = require('nodemailer');

const SUPABASE_URL = 'https://kkzztqbxjzskrsapiils.supabase.co';
const SUPABASE_KEY = 'sb_publishable_h1SIixE2PCM2hrjXvt1I4w_eKYSQCE0';
const TO_EMAIL = '1613764019@qq.com';

const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER || '1613764019@qq.com',
        pass: process.env.MAIL_PASS
    }
});

async function run() {
    console.log("⏰ 开始执行深夜日记流程...");

    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/phone_sync?id=eq.1&select=content`, { headers });
    if (!res.ok) throw new Error("无法读取云端存档: " + res.statusText);

    const rows = await res.json();
    if (!rows || rows.length === 0 || !rows[0].content) {
        console.log("云端没有存档，任务结束");
        return;
    }

    let localData = typeof rows[0].content === 'string' ? JSON.parse(rows[0].content) : rows[0].content;

    let phoneData = localData['phone_data'];
    if (typeof phoneData === 'string') {
        try { phoneData = JSON.parse(phoneData); } catch(e) {}
    }
    phoneData = phoneData || {};

    const roleId = Object.keys(phoneData)[0] || 'contact_1';

    // 🌟 自动获取用户日记设定的基准日期
    const startDateStr = localData['diary_start_date'] || '2026-09-15';
    let targetDateStr = startDateStr;

    // 提取最近一天有聊天记录的日期，优先写那天
    const allItems = [
        ...(phoneData[roleId]?.wechat?.items || []),
        ...(phoneData[roleId]?.novel?.items || [])
    ];
    const availableDates = allItems.map(i => i.date).filter(Boolean);
    if (availableDates.length > 0) {
        targetDateStr = availableDates[availableDates.length - 1];
    }

    console.log(`目标日记日期设定为: [${targetDateStr}]`);

    const wechatItems = (phoneData[roleId]?.wechat?.items || []).filter(i => i.date === targetDateStr).map(i => `[微信] ${i.sender === 'me' ? '我' : 'TA'}: ${i.content}`);
    const novelItems = (phoneData[roleId]?.novel?.items || []).filter(i => i.date === targetDateStr).map(i => `[线下] ${i.sender === 'me' ? '我' : 'TA'}: ${i.content}`);
    let historyText = [...wechatItems, ...novelItems].join('\n');

    if (!historyText) {
        historyText = "(今天你们没有过多言语交流，请以你的视角写一篇关于日常调查与想念的日记。)";
    }

    let presets = localData['ai_api_presets'];
    if (typeof presets === 'string') {
        try { presets = JSON.parse(presets); } catch(e) {}
    }
    presets = presets || [];
    const mainId = localData['main_engine_id'];
    const engine = presets.find(p => p.id === mainId) || presets[0];

    if (!engine) throw new Error("未找到大模型配置！");

    const systemPrompt = localData['system_prompt'] || '';
    const charPersona = localData['char_persona'] || '大侦探不死途，性格敏锐、傲娇、表面冷淡但极其护短。';

    const prompt = `你现在完全进入角色【大侦探不死途】。
【角色设定】：${charPersona}
【系统指令】：${systemPrompt}

【任务】：请根据你们在【${targetDateStr}】的所有互动记录，用【第一人称（你的傲娇侦探视角）】写一篇深夜日记。
要求：
1. 字数在 150-250 字左右。
2. 语言极具侦探文学色彩与傲娇性格，表面嫌弃但字里行间都是在意。
3. 必须是一篇真实的日记正文，严禁输出任何思考分析过程、禁止输出思维链、禁止输出 markdown 标记或 Emoji！
4. 写完日记后另起一行，以【亲笔留言】：开头，写一句给她的傲娇简短留言。

互动记录：
${historyText}`;

    const endpoint = engine.url.endsWith('/chat/completions') ? engine.url : engine.url.replace(/\/$/, '') + '/chat/completions';
    const aiRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${engine.key}` },
        body: JSON.stringify({
            model: engine.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        })
    });

    const aiData = await aiRes.json();
    let reply = aiData.choices[0].message.content || '';

    // 🌟 彻底过滤中英文思维链和分析块
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '')
                 .replace(/<思维链>[\s\S]*?<\/思维链>/gi, '')
                 .replace(/```[\s\S]*?```/gi, '')
                 .trim();

    let diaryContent = reply;
    let noteToUser = "卷宗整理完了，日记锁在抽屉里了不准偷看。醒了记得回消息。";
    if (reply.includes("【亲笔留言】：")) {
        const parts = reply.split("【亲笔留言】：");
        diaryContent = parts[0].trim();
        noteToUser = parts[1].trim();
    }

    // 写入日记
    let diaries = localData['char_diaries'];
    if (typeof diaries === 'string') {
        try { diaries = JSON.parse(diaries); } catch(e) {}
    }
    diaries = diaries || {};
    diaries[targetDateStr] = diaryContent;
    localData['char_diaries'] = JSON.stringify(diaries);

    // 确保 phone_data 也是标准字符串存储
    if (typeof localData['phone_data'] !== 'string') {
        localData['phone_data'] = JSON.stringify(localData['phone_data']);
    }

    await fetch(`${SUPABASE_URL}/rest/v1/phone_sync?id=eq.1`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ content: JSON.stringify(localData) })
    });
    console.log(`✅ [${targetDateStr}] 日记已成功存入 Supabase！`);

    // 发邮件
    if (process.env.MAIL_PASS) {
        await transporter.sendMail({
            from: `"大侦探不死途" <${process.env.MAIL_USER || '1613764019@qq.com'}>`,
            to: TO_EMAIL,
            subject: `【大侦探不死途】${targetDateStr} 的日记写好了。`,
            html: `
                <div style="background:#f4f5f7; padding:25px; font-family:sans-serif; color:#333; border-radius:12px;">
                    <h3 style="color:#4a70a8; margin-top:0;">📋 卷宗与日记已归档（${targetDateStr}）</h3>
                    <p style="font-style:italic; background:#fff; padding:15px; border-left:4px solid #6b8bbd; border-radius:4px; line-height:1.6;">
                        ${diaryContent.replace(/\n/g, '<br>')}
                    </p>
                    <hr style="border:none; border-top:1px dashed #ccc; margin:20px 0;">
                    <p style="font-size:14px; color:#555;">
                        <strong>📮 他的留言：</strong><br>${noteToUser}
                    </p>
                    <p style="font-size:12px; color:#999; margin-bottom:0;">
                        —— 来自凌晨的云端记录。打开模拟器即可翻开日记本。
                    </p>
                </div>
            `
        });
        console.log("📧 邮件已寄出！");
    }
}

run().catch(console.error);
