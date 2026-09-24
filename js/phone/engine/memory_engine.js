import { Config } from '../phone_config.js';
import { PhoneAPI } from '../phone_api.js';
import { PhoneUI } from '../phone_ui.js';

// ============================================================================
// 🌟 缝合进来的 3D 星海引擎 (免去手机端新建文件的烦恼)
// ============================================================================
class MemorySkyRenderer {
    constructor(options) {
        this.container = options.container;
        this.data = options.data || [];
        this.onNodeClick = options.onNodeClick || function() {};
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.stars = [];
        this.dust = [];
        this.angleX = 0.2;
        this.angleY = 0;
        this.focalLength = 300;
        
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.dragDist = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // 生成记忆星球
        this.data.forEach((mem, i) => {
            const arm = i % 2; 
            const distance = 40 + Math.random() * 150 + (i * 5);
            const angle = (distance / 40) + (arm * Math.PI);
            
            let color = '#ffffff';
            if (mem.type === 'diary') color = '#a78bfa';
            if (mem.type === 'moment') color = '#60a5fa';
            if (mem.type === 'chat') color = '#f4a261';

            this.stars.push({
                ...mem,
                x: Math.cos(angle) * distance,
                y: (Math.random() - 0.5) * 30,
                z: Math.sin(angle) * distance,
                size: 3 + Math.random() * 3,
                color: color,
                glow: Math.random() * 0.05
            });
        });

        // 生成背景星尘
        for(let i = 0; i < 200; i++) {
            const dist = Math.random() * 400;
            const ang = Math.random() * Math.PI * 2;
            this.dust.push({
                x: Math.cos(ang) * dist,
                y: (Math.random() - 0.5) * 200,
                z: Math.sin(ang) * dist,
                size: Math.random() * 1.5,
                color: `rgba(255, 255, 255, ${Math.random() * 0.6})`
            });
        }

        // 绑定触摸事件
        this.canvas.addEventListener('pointerdown', (e) => {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.dragDist = 0;
        });

        window.addEventListener('pointermove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.lastX;
            const deltaY = e.clientY - this.lastY;
            this.angleY -= deltaX * 0.005;
            this.angleX -= deltaY * 0.005;
            this.angleX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.angleX));
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.dragDist += Math.abs(deltaX) + Math.abs(deltaY);
        });

        window.addEventListener('pointerup', (e) => {
            this.isDragging = false;
            if (this.dragDist < 10) {
                this.checkClick(e.clientX, e.clientY);
            }
        });
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.width = this.container.clientWidth || window.innerWidth;
        this.height = this.container.clientHeight || window.innerHeight;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    project(x, y, z) {
        const cosX = Math.cos(this.angleX);
        const sinX = Math.sin(this.angleX);
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;

        const cosY = Math.cos(this.angleY);
        const sinY = Math.sin(this.angleY);
        const x2 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;

        const scale = this.focalLength / (this.focalLength + z2 + 300);
        return {
            x: this.centerX + x2 * scale,
            y: this.centerY + y1 * scale,
            scale: scale,
            z: z2
        };
    }

    checkClick(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = clientX - rect.left;
        const clickY = clientY - rect.top;

        const sortedStars = [...this.stars].sort((a, b) => {
            return this.project(a.x, a.y, a.z).z - this.project(b.x, b.y, b.z).z;
        });

        for (let star of sortedStars) {
            const p = this.project(star.x, star.y, star.z);
            if (p.scale < 0) continue; 
            
            const radius = star.size * p.scale * 3.0; // 点击热区
            const dist = Math.hypot(clickX - p.x, clickY - p.y);
            
            if (dist < Math.max(radius, 20)) {
                this.onNodeClick(star);
                break; 
            }
        }
    }

    render() {
        const loop = () => {
            if (!this.isDragging) this.angleY -= 0.001; // 自动旋转

            this.ctx.fillStyle = 'rgba(5, 5, 15, 0.3)'; // 拖尾背景
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.dust.forEach(p => {
                const proj = this.project(p.x, p.y, p.z);
                if (proj.scale > 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
                    this.ctx.fillStyle = p.color;
                    this.ctx.fill();
                }
            });

            const sortedStars = [...this.stars].sort((a, b) => {
                return this.project(b.x, b.y, b.z).z - this.project(a.x, a.y, a.z).z;
            });

            const time = Date.now();

            sortedStars.forEach(star => {
                const proj = this.project(star.x, star.y, star.z);
                if (proj.scale > 0) {
                    const currentSize = star.size * proj.scale;
                    const alpha = 0.6 + Math.sin(time * star.glow) * 0.4;

                    this.ctx.beginPath();
                    this.ctx.arc(proj.x, proj.y, currentSize, 0, Math.PI * 2);
                    this.ctx.shadowBlur = 15 * proj.scale;
                    this.ctx.shadowColor = star.color;
                    this.ctx.fillStyle = star.color;
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fill();
                    
                    this.ctx.globalAlpha = 1;
                    this.ctx.shadowBlur = 0;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(proj.x, proj.y, currentSize * 0.4, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fill();
                }
            });

            requestAnimationFrame(loop);
        };
        loop();
    }
}

// ============================================================================
// 原有的 MemoryEngine 逻辑
// ============================================================================
export const MemoryEngine = {
    skyRenderer: null,

    // 🌟 初始化 3D 星海
    async initSky() {
        if (this.skyRenderer) return; // 避免重复加载

        const container = document.getElementById('starry-sea-bg');
        if (!container) return;

        // 1. 获取真实的记忆数据 (从 EchoVault 获取)
        let evData = { daily: {}, permanent: {} };
        if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
            evData = window.PhoneAPI.EchoVault.getData();
        }
        
        // 2. 转换为 3D 星海需要的节点格式
        const starNodes = [];
        let idCounter = 1;
        
        Object.keys(evData.daily).forEach(date => {
            starNodes.push({
                id: idCounter++,
                title: evData.daily[date].tags || '日常回忆',
                date: date,
                content: evData.daily[date].content,
                type: 'diary'
            });
        });

        Object.keys(evData.permanent).forEach(key => {
            starNodes.push({
                id: idCounter++,
                title: key,
                date: evData.permanent[key].created ? evData.permanent[key].created.split('T')[0] : '永久',
                content: evData.permanent[key].content,
                type: 'moment'
            });
        });

        if (starNodes.length === 0) {
            starNodes.push({ id: 1, title: '初次相遇', date: '2023-01-01', content: '我们的故事开始了...', type: 'chat' });
            starNodes.push({ id: 2, title: '星海守望', date: '2024-01-01', content: '等待新的回忆降临...', type: 'moment' });
        }

        // 3. 初始化 3D 引擎
        this.skyRenderer = new MemorySkyRenderer({
            container: container,
            data: starNodes,
            onNodeClick: (nodeData) => {
                // 点击星星时，弹出盲盒 UI 显示具体记忆
                const textEl = document.getElementById('blindbox-text');
                const metaEl = document.getElementById('blindbox-meta');
                if (textEl && metaEl) {
                    let content = nodeData.content.replace(/---/g, '').trim();
                    if (content.length > 100) content = content.substring(0, 100) + '...';
                    textEl.innerText = `“${content}”`;
                    metaEl.innerText = `${nodeData.date} · ${nodeData.title}`;
                }
                const bg = document.getElementById('blindbox-bg');
                const modal = document.getElementById('blindbox-modal');
                if (bg) bg.classList.add('show');
                if (modal) modal.classList.add('show');
            }
        });

        this.skyRenderer.render();
    },

    _scanKeywords(userText) {
        if (!userText) return '';
        const vault = PhoneAPI.getMemoryVault() || [];
        const triggeredMemories = [];
        vault.forEach(item => {
            if (item.keywords && typeof item.keywords === 'string') {
                const kws = item.keywords.split(',').map(k => k.trim()).filter(Boolean);
                if (kws.some(kw => userText.includes(kw))) triggeredMemories.push(`[${item.id}] ${item.source}: ${item.content}`);
            }
        });
        return triggeredMemories.length > 0 ? `\n【系统提示(关键词触发)】：用户刚才的话触动了你的某段记忆：\n${triggeredMemories.slice(0, 3).join('\n')}\n` : '';
    },

    async extractMemory(sourceApp) {
        PhoneAPI.showToast('🧠 正在提取并拆解记忆，请稍候...');
        const roleId = Config?.currentContactId;
        const items = Config?.phoneData?.[roleId]?.[sourceApp]?.items || [];
        const recentItems = items.filter(i => i.sender !== 'typing').slice(-80);
        if (recentItems.length === 0) return alert('没有足够的聊天记录来提取记忆！');
        const historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
        try {
            const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: `你是一个提取记忆的AI，请从下面聊天记录中抽取具体记忆，按“记忆正文###关键词1,关键词2|||...”的格式输出：\n\n${historyText}` }]);
            const rawText = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```.*?/g, '').replace(/```/g, '').trim();
            const summaryList = rawText.split('|||').map(s => s.trim()).filter(Boolean);
            const editText = summaryList.join('\n\n');
            const confirmText = await PhoneUI.showCustomPrompt('✨ AI 提取了记忆与关键词，请核对修改（格式：内容###关键词）：', editText);
            if (confirmText && confirmText.trim() !== '') {
                const finalItems = confirmText.split('\n').map(s => s.trim()).filter(Boolean);
                const vaultItems = finalItems.map(item => {
                    const parts = item.split('###');
                    return { content: parts[0].trim(), keywords: parts[1] ? parts[1].trim() : '' };
                });
                PhoneAPI.saveToMemoryVault(vaultItems, sourceApp === 'wechat' ? '线上微信' : '线下故事');
            }
        } catch (e) { alert('记忆提取失败：' + e.message); }
    },

    async washMemory(sourceApp) {
        if (window.PhoneEngine && window.PhoneEngine.closeMsgMenu) window.PhoneEngine.closeMsgMenu();
        if (!confirm('⚠️ 确定要进行【记忆洗地】吗？\nAI将把当前所有聊天记录拆解成多段长期记忆，随后【清空】当前聊天界面！')) return;
        PhoneAPI.showToast('🧹 正在进行记忆洗地，请稍候...');
        const roleId = Config?.currentContactId;
        const items = Config?.phoneData?.[roleId]?.[sourceApp]?.items || [];
        if (items.length === 0) return alert('当前没有聊天记录可以洗地！');
        const recentItems = items.filter(i => i.sender !== 'typing').slice(-80);
        const historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
        try {
            const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: `请把下面聊天记录整理成记忆碎片，用“记忆正文###关键词1,关键词2|||...”格式输出：\n\n${historyText}` }]);
            const rawText = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```.*?/g, '').replace(/```/g, '').trim();
            const summaryList = rawText.split('|||').map(s => s.trim()).filter(Boolean);
            const editText = summaryList.join('\n\n');
            const confirmText = await PhoneUI.showCustomPrompt('✨ 洗地记忆碎片如下，确认后将存入记忆库并清空界面：', editText);
            if (confirmText && confirmText.trim() !== '') {
                const finalItems = confirmText.split('\n').map(s => s.trim()).filter(Boolean);
                const vaultItems = finalItems.map(item => {
                    const parts = item.split('###');
                    return { content: parts[0].trim(), keywords: parts[1] ? parts[1].trim() : '' };
                });
                PhoneAPI.saveToMemoryVault(vaultItems, sourceApp === 'wechat' ? '线上微信' : '线下故事');
                Config.phoneData[roleId][sourceApp].items = [];
                localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
                if (sourceApp === 'novel') PhoneUI.renderNovelContent?.();
                else PhoneUI.renderAppContent?.('wechat');
                PhoneAPI.showToast('🧹 洗地完成！界面已清空，记忆已入库。');
            }
        } catch (e) { alert('洗地失败：' + e.message); }
    },

    async generateDiary(dateStr) {
        const contentAreaEl = document.getElementById('diary-content-area');
        if (!contentAreaEl) return;
        contentAreaEl.innerHTML = '<div class="notebook-empty"><i class="ph-fill ph-spinner spin-anim" style="font-size: 48px; color: rgba(0,0,0,0.5); margin-bottom: 15px;"></i><p>正在生成日记...</p></div>';
        try {
            const roleId = Config?.currentContactId;
            const wechatItems = (Config?.phoneData?.[roleId]?.wechat?.items || []).filter(i => i.date === dateStr).map(i => ({ ...i, source: '线上微信' }));
            const novelItems = (Config?.phoneData?.[roleId]?.novel?.items || []).filter(i => i.date === dateStr).map(i => ({ ...i, source: '线下故事' }));
            const recentItems = [...wechatItems, ...novelItems].sort((a, b) => (a.time || '').localeCompare(b.time || '')).slice(-80);
            const historyText = recentItems.map(item => `[${item.source}] ${item.time || ''} ${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
            const prompt = `根据以下聊天记录，写一篇符合角色设定与当天事件的个人日记。绝对禁止输出分析过程，直接输出日记正文：\n\n${historyText}`;
            const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: prompt }]);
            const finalDiary = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            PhoneAPI.saveDiary(dateStr, finalDiary);
            PhoneUI.renderDiaryPage();
            PhoneAPI.showToast('✨ 日记生成成功，已同步至 EchoVault！');
        } catch (error) {
            contentAreaEl.innerHTML = '<div class="notebook-empty"><i class="ph-fill ph-warning-circle" style="font-size: 48px; color: var(--danger-color); margin-bottom: 15px;"></i><p style="color: var(--danger-color);">日记生成失败！</p></div>';
        }
    }
};
