const nodemailer = require('nodemailer');

// 🌟 配置信息
const SUPABASE_URL = 'https://kkzztqbxjzskrsapiils.supabase.co';
const SUPABASE_KEY = 'sb_publishable_h1SIixE2PCM2hrjXvt1I4w_eKYSQCE0';
const TO_EMAIL = '1613764019@qq.com';

// 免费发信通道（使用系统的默认安全发信器）
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER || '1613764019@qq.com',
        pass: process.env.MAIL_PASS // 授权码稍后配置
    }
});

async function run() {
    console.log("⏰ 凌晨 3:30 闹钟响起，大侦探开始写日记...");

    // 1. 从 Supabase 读取最新存档
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

    const localData = JSON.parse(rows[0].content);
    const phoneData = JSON.parse(localData['phone_data'] || '{}');
    const roleId = Object.keys(phoneData)[0] || 'contact_1';

    // 获取昨天的日期（因为是凌晨3点写昨天一整天的事情）
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const y = yesterday.getFullYear();
    const m = String(yesterday.getMonth() + 1).padStart(2, '0');
    const d = String(yesterday.getDate()).padStart(2, '0');
    const targetDateStr = `${y}-${m}-${d}`;

    console.log(`正在为日期 [${targetDateStr}] 生成日记...`);

    // 整理聊天记录
    const wechatItems = (phoneData[roleId]?.wechat?.items || []).filter(i => i.date === targetDateStr).map(i => `[微信] ${i.sender === 'me' ? '我' : 'TA'}: ${i.content}`);
    const novelItems = (phoneData[roleId]?.novel?.items || []).filter(i => i.date === targetDateStr).map(i => `[线下] ${i.sender === 'me' ? '我' : 'TA'}: ${i.content}`);
    let historyText = [...wechatItems, ...novelItems].join('\n');

    if (!historyText) historyText = "(昨天你们没有太多交流，请以你的视角写一篇关于案件调查与想念的日常日记。)";

    // 获取模型配置
    const presets = JSON.parse(localData['ai_api_presets'] || '[]');
    const mainId = localData['main_engine_id'];
    const engine = presets.find(p => p.id === mainId) || presets[0];

    if (!engine) throw new Error("没有找到可用的大模型配置！");

    const systemPrompt = localData['system_prompt'] || '';
    const charPersona = localData['char_persona'] || '大侦探不死途，性格敏锐、傲娇、表面冷淡但极其护短。';

    const prompt = `你现在完全进入角色【大侦探不死途】。
【角色设定】：${charPersona}
【系统指令】：${systemPrompt}

【任务】：现在是现实时间的凌晨，万籁俱寂。请根据你们在【${targetDateStr}】这一整天的所有互动记录，用【第一人称（你的傲娇侦探视角）】写一篇今天的深夜日记。
要求：
1. 字数在 150-250 字左右。
2. 语言极具你个人的文学色彩、侦探思维和傲娇性格，表面嫌弃但字里行间都是在意。
3. 必须是一篇真实的日记正文，严禁输出任何分析过程、不要包含 markdown 标记或任何 Emoji！
4. 写完日记后，在日记最末尾另起一行，以【亲笔留言】：为开头，写一句给她的简短留言（督促她好好吃早饭或者傲娇吐槽）。

互动记录：
${historyText}`;

    // 呼叫大模型
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
    let reply = aiData.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // 拆分日记和留言
    let diaryContent = reply;
    let noteToUser = "卷宗整理完了，日记锁在抽屉里了不准偷看。醒了记得回消息。";
    if (reply.includes("【亲笔留言】：")) {
        const parts = reply.split("【亲笔留言】：");
        diaryContent = parts[0].trim();
        noteToUser = parts[1].trim();
    }

    // 2. 存回 Supabase
    let diaries = JSON.parse(localData['char_diaries'] || '{}');
    diaries[targetDateStr] = diaryContent;
    localData['char_diaries'] = JSON.stringify(diaries);

    await fetch(`${SUPABASE_URL}/rest/v1/phone_sync?id=eq.1`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ content: JSON.stringify(localData) })
    });
    console.log("✅ 日记已成功存入 Supabase！");

    // 3. 发送邮件弹窗通知
    if (process.env.MAIL_PASS) {
        await transporter.sendMail({
            from: `"大侦探不死途" <${process.env.MAIL_USER || '1613764019@qq.com'}>`,
            to: TO_EMAIL,
            subject: `【大侦探不死途】昨天的日记写好了。`,
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
                        —— 来自凌晨 03:30 的云端记录。打开模拟器即可翻开日记本。
                    </p>
                </div>
            `
        });
        console.log("📧 邮件已成功寄送到你的邮箱！");
    }
}

run().catch(console.error);
