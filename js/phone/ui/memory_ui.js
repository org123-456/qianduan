export const MemoryUI = {
    vaultSearchQuery: '',

    enterStarrySea() {
        const cover = document.getElementById('memory-cover-view');
        const inside = document.getElementById('memory-inside-view');
        const bubbles = document.getElementById('floating-bubbles');
        if (cover && inside && bubbles) {
            cover.classList.add('dive-in');
            inside.classList.add('active');
            setTimeout(() => { bubbles.classList.add('show'); }, 300);
        }
        if (window.MemoryEngine && typeof window.MemoryEngine.initSky === 'function') {
            window.MemoryEngine.initSky();
        }
    },

    exitStarrySea() {
        const cover = document.getElementById('memory-cover-view');
        const inside = document.getElementById('memory-inside-view');
        const bubbles = document.getElementById('floating-bubbles');
        if (cover && inside && bubbles) {
            bubbles.classList.remove('show');
            inside.classList.remove('active');
            cover.classList.remove('dive-in');
        }
    },

    closeBlindBox() {
        const bg = document.getElementById('blindbox-bg');
        const modal = document.getElementById('blindbox-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    switchVaultTab(tab) {
        if (window.Config) window.Config.memoryVaultTab = tab;
        document.getElementById('tab-daily').classList.remove('active');
        document.getElementById('tab-permanent').classList.remove('active');
        document.getElementById('tab-' + tab).classList.add('active');
        this.updateVaultList(); 
    },

    handleVaultSearch(query) {
        this.vaultSearchQuery = query.toLowerCase();
        this.updateVaultList();
    },

    // 🌟 纯净记忆库界面：只有搜索框和记忆列表
    renderMemoryVault() {
        this.updateVaultList();
    },

    // Export only EchoVault data; do not touch chat history, settings, or IndexedDB assets.
    openSkyConsole() {
        // 🌟 极简操控台：直接弹出清爽的记忆管理与txt导出选项，砍掉容易出bug的花哨形态选项
        const modal = document.getElementById('sky-console-modal');
        if (modal) {
            modal.innerHTML = `
                <div style="font-weight:700;font-size:16px;color:#1e293b;margin-bottom:14px;text-align:center;">✨ 记忆手札管理</div>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    <button type="button" onclick="window.PhoneUI.exportMemoryVault();window.PhoneUI.closeSkyConsole();" style="padding:12px;background:#6366f1;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;">
                        📖 导出记忆手札 (.txt 文本)
                    </button>
                    <button type="button" onclick="window.PhoneUI.openApp('memory_vault','记忆库');window.PhoneUI.closeSkyConsole();" style="padding:12px;background:#f1f5f9;color:#334155;border:none;border-radius:12px;font-size:14px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;">
                        📜 查看心底记忆列表
                    </button>
                    <button type="button" onclick="window.PhoneUI.closeSkyConsole();" style="padding:10px;background:transparent;color:#94a3b8;border:none;font-size:13px;cursor:pointer;margin-top:4px;">
                        关闭
                    </button>
                </div>
            `;
        }
        const bg = document.getElementById('sky-console-bg');
        if (bg) { bg.style.zIndex = '9999'; bg.classList.add('show'); }
        if (modal) { modal.style.zIndex = '10000'; modal.classList.add('show'); }
    },

    closeSkyConsole() {
        const bg = document.getElementById('sky-console-bg');
        const modal = document.getElementById('sky-console-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    showMemoryStarDetail(node) {
        if (!node) return;
        let modalBg = document.getElementById('star-detail-bg');
        let modal = document.getElementById('star-detail-modal');

        if (!modalBg) {
            modalBg = document.createElement('div');
            modalBg.id = 'star-detail-bg';
            modalBg.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:99998;opacity:0;pointer-events:none;transition:opacity 0.25s ease;';
            document.body.appendChild(modalBg);
            modalBg.onclick = () => window.PhoneUI.closeMemoryStarDetail();
        }

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'star-detail-modal';
            modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.92);width:86%;max-width:340px;background:rgba(25,27,42,0.88);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.18);border-radius:24px;box-shadow:0 20px 50px rgba(0,0,0,0.65),0 0 30px rgba(167,139,250,0.18);z-index:99999;opacity:0;pointer-events:none;transition:all 0.28s cubic-bezier(0.16,1,0.3,1);padding:22px;box-sizing:border-box;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;';
            document.body.appendChild(modal);
        }

        const title = this.escapeHtml(node.title || '心底的记忆');
        const date = this.escapeHtml(node.date || '星历');
        const rawContent = (node.content || '暂无内容').replace(/---/g, '\n').trim();
        const contentHtml = this.escapeHtml(rawContent).replace(/\n/g, '<br style="margin-bottom:8px;">');

        modal.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:30px;height:30px;border-radius:10px;background:linear-gradient(135deg,rgba(167,139,250,0.35),rgba(196,181,253,0.1));display:flex;align-items:center;justify-content:center;color:#c4b5fd;font-size:16px;">
                        <i class="ph-fill ph-sparkle"></i>
                    </div>
                    <div>
                        <div style="font-size:14px;font-weight:700;color:#f3f4f6;letter-spacing:0.3px;">${title}</div>
                        <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px;">${date}</div>
                    </div>
                </div>
                <button onclick="window.PhoneUI.closeMemoryStarDetail()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.6);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:0.2s;">
                    ✕
                </button>
            </div>
            <div style="max-height:55vh;overflow-y:auto;font-size:13px;line-height:1.75;color:rgba(255,255,255,0.85);letter-spacing:0.4px;padding-right:4px;word-break:break-word;">
                ${contentHtml}
            </div>
            <div style="margin-top:18px;display:flex;justify-content:flex-end;">
                <button onclick="window.PhoneUI.closeMemoryStarDetail()" style="padding:8px 20px;border-radius:12px;background:linear-gradient(135deg,#8b5cf6,#a78bfa);border:none;color:#fff;font-size:12px;font-weight:600;cursor:pointer;box-shadow:0 4px 14px rgba(139,92,246,0.35);">
                    收起
                </button>
            </div>
        `;

        requestAnimationFrame(() => {
            modalBg.style.opacity = '1';
            modalBg.style.pointerEvents = 'auto';
            modal.style.opacity = '1';
            modal.style.pointerEvents = 'auto';
            modal.style.transform = 'translate(-50%,-50%) scale(1)';
        });
    },

    closeMemoryStarDetail() {
        const modalBg = document.getElementById('star-detail-bg');
        const modal = document.getElementById('star-detail-modal');
        if (modalBg) {
            modalBg.style.opacity = '0';
            modalBg.style.pointerEvents = 'none';
        }
        if (modal) {
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
            modal.style.transform = 'translate(-50%,-50%) scale(0.92)';
        }
    },

    handleStarSearch(query) {
        const box = document.getElementById('sky-search-results');
        if (!box) return;
        const data = window.PhoneAPI?.EchoVault?.getData?.() || {daily:{}, permanent:{}, archive:{}};
        const q = String(query || '').trim().toLowerCase();
        const found = [];
        ['daily', 'permanent', 'archive'].forEach(section => {
            Object.entries(data[section] || {}).forEach(([key, item]) => {
                const text = typeof item === 'string' ? item : String(item?.content || '');
                if (!q || key.toLowerCase().includes(q) || text.toLowerCase().includes(q)) {
                    found.push({section, key, text});
                }
            });
        });
        box.innerHTML = found.slice(0, 25).map(item =>
            '<button class="action-btn" style="text-align:left;white-space:normal" onclick="window.PhoneUI.openApp(\'memory_vault\', \'记忆库列表\');window.PhoneUI.closeSkyConsole();">' +
            this.escapeHtml(item.key) + '<div style="font-size:12px;margin-top:4px">' + this.escapeHtml(item.text.slice(0,100)) + '</div></button>'
        ).join('') || '<div class="ev-empty">没有找到匹配的记忆</div>';
    },

    focusGalaxy(mode) {
        if (mode === 'vault') {
            this.openApp('memory_vault', '记忆库列表');
            this.closeSkyConsole();
            return;
        }
        if (mode === 'fav') {
            window.alert('收藏星系暂未建立独立数据标记。');
        }
    },

    changeSkyShape(shape) {
        localStorage.setItem('memory_sky_shape', shape);
        if (window.MemoryEngine) {
            window.MemoryEngine.skyShape = shape;
            if (window.MemoryEngine.skyInstance?.setShape) {
                window.MemoryEngine.skyInstance.setShape(shape);
            } else {
                this.resetSkyView();
            }
        }
        this.closeSkyConsole();
        const names = { free: '自由星系', spiral: '恒星轨道', ring: '星环模式' };
        window.PhoneAPI?.showToast?.(`🌌 已切换为：${names[shape] || shape}`);
    },

    resetSkyView() {
        if (window.MemoryEngine?.skyInstance) {
            window.MemoryEngine.skyInstance.destroy();
            window.MemoryEngine.skyInstance = null;
        }
        window.MemoryEngine?.initSky?.();
    },

    openMemoryLog() {
        const bg = document.getElementById('memory-log-bg');
        const modal = document.getElementById('memory-log-modal');
        const list = document.getElementById('memory-log-list');
        let logs = [];
        try { logs = JSON.parse(localStorage.getItem('memory_logs') || '[]'); } catch (e) {}
        if (list) list.innerHTML = logs.length ? logs.slice().reverse().map(log =>
            '<div class="ev-card"><div class="ev-card-header"><span>' + this.escapeHtml(log.time || '') +
            '</span><span>' + this.escapeHtml(log.action || '') + '</span></div><div class="ev-body">' +
            this.escapeHtml(log.content || '') + '</div></div>'
        ).join('') : '<div class="ev-empty">暂时没有星海变动日志</div>';
        bg?.classList.add('show');
        modal?.classList.add('show');
    },

    closeMemoryLog() {
        document.getElementById('memory-log-bg')?.classList.remove('show');
        document.getElementById('memory-log-modal')?.classList.remove('show');
    },

    // 🌟 导出符合 LivingMemory 2.7.0 规范的专属 JSON 格式，供 AstrBot 导入
    exportLivingMemoryJson() {
        try {
            const data = window.PhoneAPI?.EchoVault?.getData?.();
            if (!data || typeof data !== 'object') throw new Error('当前记忆库不可用');

            const memories = [];

            const myName = localStorage.getItem('my_name') || '卿卿';
            const taName = localStorage.getItem('char_name') || '不死途';
            const participants = [myName, taName].filter(Boolean);

            // 1. 处理永久锚点（core 核心记忆，权重0.9，不硬编码session_id确保TG能全局调取）
            Object.entries(data.permanent || {}).forEach(([key, item]) => {
                const text = (typeof item === 'string' ? item : item?.content || '').replace(/---/g, '\n').trim();
                if (!text) return;
                const rawTags = (item?.tags || key || '永久记忆').split(/[,，\s]+/).filter(Boolean);
                memories.push({
                    content: text,
                    importance: 0.9,
                    topics: rawTags.length ? rawTags : ['核心记忆'],
                    key_facts: [key],
                    participants: participants,
                    memory_type: 'core',
                    original_id: 'ev_p_' + key,
                    metadata: {
                        source: 'echovault',
                        anchor_key: key
                    }
                });
            });

            // 2. 处理日常碎片（episodic 情节记忆，根据情绪动态调整权重）
            Object.entries(data.daily || {}).forEach(([dateKey, item]) => {
                const text = (item?.content || '').replace(/---/g, '\n').trim();
                if (!text) return;
                const rawTags = (item?.tags || '日常随笔').split(/[,，\s]+/).filter(Boolean);
                const valence = Number(item?.valence) || 0.6;
                const importance = Math.min(0.85, Math.max(0.4, Number((valence * 0.5 + 0.35).toFixed(2))));
                memories.push({
                    content: text,
                    importance: importance,
                    topics: rawTags.length ? rawTags : ['日常'],
                    key_facts: rawTags,
                    participants: participants,
                    memory_type: 'episodic',
                    original_id: 'ev_d_' + dateKey,
                    metadata: {
                        source: 'echovault',
                        record_date: dateKey
                    }
                });
            });

            if (memories.length === 0) {
                alert('当前记忆库没有任何记录可导出。');
                return;
            }

            // 完全遵循 LivingMemory 2.7.0 规范
            const payload = {
                format: "livingmemory",
                schema_version: 1,
                memories: memories
            };

            const jsonStr = JSON.stringify(payload, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const now = new Date();
            const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
            a.href = url;
            a.download = `livingmemory_vault_${stamp}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            window.PhoneAPI?.showToast?.(`✨ 成功导出 ${memories.length} 条 LivingMemory 格式记忆！`);
        } catch (err) {
            alert('导出失败：' + (err?.message || '未知错误'));
        }
    },

    exportMemoryVault() {
        try {
            const data = window.PhoneAPI?.EchoVault?.getData?.();
            if (!data || typeof data !== 'object') throw new Error('当前记忆库不可用');
            
            const myName = localStorage.getItem('my_name') || '卿卿';
            const taName = localStorage.getItem('char_name') || '不死途';
            const now = new Date();
            const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;

            let txt = `========================================\n`;
            txt += `      📖 《${taName}与${myName}的心底记忆手札》\n`;
            txt += `      导出时间：${dateStr}\n`;
            txt += `========================================\n\n`;

            // 1. 核心永久锚点
            txt += `【🌟 永恒锚点记忆】\n`;
            txt += `----------------------------------------\n`;
            const permKeys = Object.keys(data.permanent || {});
            if (permKeys.length === 0) {
                txt += `（暂无永久锚点）\n\n`;
            } else {
                permKeys.forEach((key, idx) => {
                    const item = data.permanent[key];
                    const content = (item?.content || String(item)).replace(/---/g, '\n').trim();
                    const tags = item?.tags ? ` [标签: ${item.tags}]` : '';
                    txt += `${idx + 1}. [${key}]${tags}\n${content}\n\n`;
                });
            }

            // 2. 日常碎片记录
            txt += `\n【📅 日常心境与陪伴碎片】\n`;
            txt += `----------------------------------------\n`;
            const dailyKeys = Object.keys(data.daily || {}).sort((a, b) => b.localeCompare(a));
            if (dailyKeys.length === 0) {
                txt += `（暂无日常记忆）\n\n`;
            } else {
                dailyKeys.forEach((date, idx) => {
                    const item = data.daily[date];
                    const content = (item?.content || '').replace(/---/g, '\n').trim();
                    const tags = item?.tags ? ` | 🏷️ ${item.tags}` : '';
                    txt += `【${date}${tags}】\n${content}\n\n`;
                });
            }

            txt += `========================================\n`;
            txt += `               手札记录完毕               \n`;
            txt += `========================================\n`;

            const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
            a.href = url;
            a.download = `${taName}与${myName}的记忆手札-${stamp}.txt`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            window.PhoneAPI?.showToast?.('✨ 记忆手札已导出为文本文件！');
        } catch (err) {
            alert('导出失败：' + (err?.message || '未知错误'));
        }
    },

    // 🌟 文本指纹清洗（去除标点和多余空格换行，用于内容级别去重判断）
    getMemoryFingerprint(text) {
        if (!text) return '';
        return String(text)
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
            .toLowerCase();
    },

    // 🌟 智能去重导入：支持前端旧备份与 LivingMemory JSON，只合并新增记忆！
    async importMemoryVault(event) {
        if (!event?.target?.files || !event.target.files.length) {
            let fileInput = document.getElementById('temp-memory-file-input');
            if (!fileInput) {
                fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.id = 'temp-memory-file-input';
                fileInput.accept = '.json,application/json';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
            }
            fileInput.onchange = (e) => this.importMemoryVault(e);
            fileInput.click();
            return;
        }

        const input = event.target;
        const file = input.files[0];
        if (!file) return;

        try {
            if (file.size > 20 * 1024 * 1024) throw new Error('文件超过 20MB，已停止导入');
            const text = await file.text();
            const payload = JSON.parse(text);

            const api = window.PhoneAPI;
            if (!api?.EchoVault?.getData || !api?.EchoVault?.saveData) throw new Error('记忆库存储接口不可用');
            
            const current = api.EchoVault.getData() || { daily: {}, permanent: {}, archive: {} };
            const merged = {
                daily: { ...(current.daily || {}) },
                permanent: { ...(current.permanent || {}) },
                archive: { ...(current.archive || {}) }
            };

            // 预先建立现有记忆的内容指纹库（防止内容相同但标题/ID不同）
            const existingDailyFps = new Set();
            const existingPermFps = new Set();

            Object.values(merged.daily || {}).forEach(item => {
                const fp = this.getMemoryFingerprint(item?.content || item);
                if (fp) existingDailyFps.add(fp);
            });
            Object.values(merged.permanent || {}).forEach(item => {
                const fp = this.getMemoryFingerprint(item?.content || item);
                if (fp) existingPermFps.add(fp);
            });

            let added = 0;
            let skipped = 0;

            // 情况 A：导入的是 LivingMemory 格式 JSON
            if (Array.isArray(payload.memories)) {
                payload.memories.forEach((m, idx) => {
                    const content = (m.content || '').trim();
                    if (!content) { skipped++; return; }

                    const fp = this.getMemoryFingerprint(content);
                    const isCore = m.memory_type === 'core';
                    const targetSection = isCore ? 'permanent' : 'daily';
                    const targetFpSet = isCore ? existingPermFps : existingDailyFps;

                    // 内容查重
                    if (targetFpSet.has(fp)) {
                        skipped++;
                        return;
                    }

                    if (isCore) {
                        const anchorKey = m.metadata?.anchor_key || m.key_facts?.[0] || `核心记忆_${Date.now()}_${idx}`;
                        if (merged.permanent[anchorKey]) {
                            skipped++;
                            return;
                        }
                        const tags = Array.isArray(m.topics) ? m.topics.join(', ') : (m.topics || '核心');
                        merged.permanent[anchorKey] = {
                            content: content,
                            tags: tags,
                            created: m.timestamp || new Date().toISOString()
                        };
                        targetFpSet.add(fp);
                        added++;
                    } else {
                        const now = new Date();
                        const timeOffset = idx * 1000;
                        const dateObj = new Date(now.getTime() - timeOffset);
                        const defaultDateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')} ${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}:${String(dateObj.getSeconds()).padStart(2,'0')}`;
                        
                        let dateKey = m.metadata?.record_date || defaultDateStr;
                        // 避免 key 碰撞
                        if (merged.daily[dateKey]) {
                            dateKey = `${dateKey}_${idx}`;
                        }
                        const tags = Array.isArray(m.topics) ? m.topics.join(', ') : (m.topics || '日常');
                        merged.daily[dateKey] = {
                            content: content,
                            tags: tags,
                            valence: (typeof m.importance === 'number') ? m.importance : 0.6
                        };
                        targetFpSet.add(fp);
                        added++;
                    }
                });
            } else {
                // 情况 B：常规备份 JSON (qianduan-memory-vault 或直接导出结构)
                const vault = payload?.format === 'qianduan-memory-vault' ? payload.vault : payload;
                if (!vault || typeof vault !== 'object' || Array.isArray(vault)) {
                    throw new Error('未识别的文件格式');
                }

                for (const section of ['daily', 'permanent', 'archive']) {
                    const targetFpSet = section === 'permanent' ? existingPermFps : existingDailyFps;
                    for (const [key, value] of Object.entries(vault[section] || {})) {
                        if (!key || !value) { skipped++; continue; }

                        // 键值相同去重
                        if (Object.prototype.hasOwnProperty.call(merged[section], key)) {
                            skipped++;
                            continue;
                        }

                        // 内容指纹去重
                        const itemContent = typeof value === 'string' ? value : value.content;
                        const fp = this.getMemoryFingerprint(itemContent);
                        if (fp && targetFpSet.has(fp)) {
                            skipped++;
                            continue;
                        }

                        merged[section][key] = value;
                        if (fp) targetFpSet.add(fp);
                        added++;
                    }
                }
            }

            if (added === 0) {
                alert(`💡 未发现新记忆：备份中的记忆均已存在，智能去重跳过了 ${skipped} 条重复记录。`);
                return;
            }

            // 保存合并并去重后的纯净数据
            api.EchoVault.saveData(merged);
            alert(`🎉 智能导入完成！\n\n✨ 成功新增：${added} 条新记忆\n🛡️ 智能去重：跳过 ${skipped} 条重复记忆`);
            this.updateVaultList();
            if (window.MemoryEngine && typeof window.MemoryEngine.initSky === 'function') {
                window.MemoryEngine.initSky();
            }
        } catch (err) {
            alert('❌ 导入失败：' + (err?.message || '请确认文件格式有效'));
        } finally {
            if (input) input.value = '';
        }
    },

    updateVaultList() {
        const listContainer = document.getElementById('vault-list-container');
        if (!listContainer || !window.PhoneAPI || !window.PhoneAPI.EchoVault) return;

        const data = window.PhoneAPI.EchoVault.getData();
        const tab = window.Config?.memoryVaultTab || 'daily';
        const query = this.vaultSearchQuery || '';
        
        let html = '';
        if (tab === 'daily') {
            let dates = Object.keys(data.daily).sort((a, b) => b.localeCompare(a));
            if (query) dates = dates.filter(d => d.includes(query) || (data.daily[d].tags||'').toLowerCase().includes(query) || data.daily[d].content.toLowerCase().includes(query));
            if (dates.length === 0) {
                html = '<div class="ev-empty"><i class="ph-fill ph-empty" style="font-size:48px;color:var(--border-color);"></i><br>暂无记忆</div>';
            } else {
                dates.forEach(date => {
                    const item = data.daily[date];
                    let content = item.content.replace(/---/g, '\n').trim();
                    html += `
                    <div class="ev-card">
                        <div class="ev-card-header">
                            <span><i class="ph-fill ph-calendar-blank"></i> ${date}</span>
                            <span><i class="ph-fill ph-tag"></i> ${this.escapeHtml(item.tags)}</span>
                        </div>
                        <div class="ev-body">${this.escapeHtml(content)}</div>
                        <div class="ev-card-footer">
                            <i class="ph-fill ph-share-network" onclick="window.PhoneUI.shareMemoryItem('${date}', 'daily')" title="发送到聊天"></i>
                            <i class="ph-fill ph-pencil-simple" onclick="window.PhoneUI.openEvEdit('${date}', 'daily')"></i>
                            <i class="ph-fill ph-trash" onclick="window.PhoneUI.deleteMemoryItem('${date}', 'daily')"></i>
                        </div>
                    </div>`;
                });
            }
        } else {
            let keys = Object.keys(data.permanent).sort((a, b) => {
                const timeA = data.permanent[a].created || '';
                const timeB = data.permanent[b].created || '';
                return timeB.localeCompare(timeA);
            });
            if (query) keys = keys.filter(k => k.toLowerCase().includes(query) || (data.permanent[k].tags||'').toLowerCase().includes(query) || data.permanent[k].content.toLowerCase().includes(query));
            if (keys.length === 0) {
                html = '<div class="ev-empty"><i class="ph-fill ph-empty" style="font-size:48px;color:var(--border-color);"></i><br>暂无记忆</div>';
            } else {
                keys.forEach(key => {
                    const item = data.permanent[key];
                    html += `
                    <div class="ev-card ev-permanent-card">
                        <div class="ev-card-header">
                            <span><i class="ph-fill ph-anchor"></i> ${this.escapeHtml(key)}</span>
                            <span><i class="ph-fill ph-tag"></i> ${this.escapeHtml(item.tags)}</span>
                        </div>
                        <div class="ev-body">${this.escapeHtml(item.content)}</div>
                        <div class="ev-card-footer">
                            <i class="ph-fill ph-share-network" onclick="window.PhoneUI.shareMemoryItem('${key}', 'permanent')" title="发送到聊天"></i>
                            <i class="ph-fill ph-pencil-simple" onclick="window.PhoneUI.openEvEdit('${key}', 'permanent')"></i>
                            <i class="ph-fill ph-trash" onclick="window.PhoneUI.deleteMemoryItem('${key}', 'permanent')"></i>
                        </div>
                    </div>`;
                });
            }
        }
        listContainer.innerHTML = html;
    },

    shareMemoryItem(key, type) {
        if (!window.PhoneAPI || !window.PhoneAPI.EchoVault) return;
        const data = window.PhoneAPI.EchoVault.getData();
        const item = data[type][key];
        if (!item) return;
        
        let content = item.content.replace(/---/g, ' ').trim();
        if (content.length > 40) content = content.substring(0, 40) + '...';

        const text = `> ✨ **记忆回溯**\n> 📅 ${type === 'daily' ? key.split(' ')[0] : '永久锚点'} | 🏷️ ${item.tags || '无'}\n> \n> _"${content}"_`;
        
        const input = document.getElementById('chat-input');
        if(input && window.PhoneEngine && window.PhoneEngine.sendChatMessage) {
            input.value = text;
            window.PhoneEngine.sendChatMessage();
            window.PhoneUI.closeApp();
            if(typeof switchTab === 'function') switchTab(2); 
        }
    },

    openEvEdit(key, type) {
        if (!window.PhoneAPI || !window.PhoneAPI.EchoVault) return;
        const data = window.PhoneAPI.EchoVault.getData();
        const item = data[type][key];
        if (!item) return;
        
        document.getElementById('ev-edit-date').innerText = key;
        document.getElementById('ev-edit-date').dataset.key = key;
        document.getElementById('ev-edit-date').dataset.type = type;
        document.getElementById('ev-edit-content').value = item.content;
        
        document.getElementById('ev-edit-bg').classList.add('show');
        document.getElementById('ev-edit-modal').classList.add('show');
    },

    closeEvEdit() {
        document.getElementById('ev-edit-bg').classList.remove('show');
        document.getElementById('ev-edit-modal').classList.remove('show');
    },

    saveEvEdit() {
        const key = document.getElementById('ev-edit-date').dataset.key;
        const type = document.getElementById('ev-edit-date').dataset.type;
        const content = document.getElementById('ev-edit-content').value.trim();
        if (!content) { window.PhoneAPI.showToast("内容不能为空哦"); return; }
        
        if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
            const data = window.PhoneAPI.EchoVault.getData();
            if (data[type] && data[type][key]) {
                data[type][key].content = content;
                window.PhoneAPI.EchoVault.saveData(data);
                window.PhoneAPI.showToast("✅ 修改已保存");
                this.closeEvEdit();
                this.updateVaultList(); 
                if(window.MemoryEngine && window.MemoryEngine.initSky) window.MemoryEngine.initSky();
            }
        }
    },

    deleteMemoryItem(key, type) {
        if (!confirm("确定要删除这条记忆吗？")) return;
        if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
            window.PhoneAPI.EchoVault.deleteItem(type, key);
            window.PhoneAPI.showToast("🗑️ 记忆已删除");
            this.updateVaultList(); 
            if(window.MemoryEngine && window.MemoryEngine.initSky) window.MemoryEngine.initSky();
        }
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
};

// 🌟 全局纯净挂载
if (typeof window !== 'undefined') {
    window.PhoneUI = window.PhoneUI || {};
    Object.assign(window.PhoneUI, MemoryUI);
    window.MemoryUI = MemoryUI;
    window.exportLivingMemoryJson = () => MemoryUI.exportLivingMemoryJson();
    window.exportMemoryVault = () => MemoryUI.exportMemoryVault();
    window.importMemoryVault = (e) => MemoryUI.importMemoryVault(e);
    window.closeSkyConsole = () => MemoryUI.closeSkyConsole();
    window.openSkyConsole = () => MemoryUI.openSkyConsole();
    window.focusGalaxy = (mode) => MemoryUI.focusGalaxy(mode);
    window.changeSkyShape = () => {};
    window.resetSkyView = () => MemoryUI.resetSkyView();
}
