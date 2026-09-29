/**
 * ⚙️ 专属系统设置与控制台 UI 模块
 */
export const SettingsUI = {
    switchSetTab(tabId) {
        ['basic', 'ai', 'draw', 'sys'].forEach(id => {
            const tab = document.getElementById('stab-' + id);
            const sec = document.getElementById('set-sec-' + id);
            if (tab) tab.classList.remove('active');
            if (sec) sec.classList.remove('active');
        });
        const activeTab = document.getElementById('stab-' + tabId);
        const activeSec = document.getElementById('set-sec-' + tabId);
        if (activeTab) activeTab.classList.add('active');
        if (activeSec) activeSec.classList.add('active');
    },

    saveDrawSettings() {
        const urlEl = document.getElementById('img-api-url');
        const keyEl = document.getElementById('img-api-key');
        const modelEl = document.getElementById('img-api-model');
        if (urlEl) localStorage.setItem('img_api_url', urlEl.value.trim());
        if (keyEl) localStorage.setItem('img_api_key', keyEl.value.trim());
        if (modelEl) localStorage.setItem('img_api_model', modelEl.value.trim());
        if (window.PhoneAPI) window.PhoneAPI.showToast("💾 绘画配置已成功保存！");
    },

    fillPresetData() {
        const select = document.getElementById('preset-delete-select');
        if (!select || !select.value) return;
        const presetId = select.value;
        const presets = JSON.parse(localStorage.getItem('ai_api_presets') || '[]');
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
            document.getElementById('preset-name').value = preset.name || '';
            document.getElementById('preset-url').value = preset.url || '';
            document.getElementById('preset-key').value = preset.key || '';
            document.getElementById('preset-model').value = preset.model || '';
            if (window.PhoneAPI) window.PhoneAPI.showToast('✏️ 已加载预设，修改后点击保存即可覆盖');
        }
    },

    openApiModal() {
        const bg = document.getElementById('api-modal-bg');
        const modal = document.getElementById('api-modal');
        if (!bg || !modal) return;
        if (window.PhoneAPI && window.PhoneAPI.refreshPresetDropdowns) {
            window.PhoneAPI.refreshPresetDropdowns();
        }
        bg.classList.add('show');
        modal.classList.add('show');
        this.renderApiModalContent();
    },

    closeApiModal() {
        const bg = document.getElementById('api-modal-bg');
        const modal = document.getElementById('api-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    async renderApiModalContent() {
        const modal = document.getElementById('api-modal');
        if (!modal) return;

        let tokenBoard = document.getElementById('api-token-board');
        if (!tokenBoard) {
            tokenBoard = document.createElement('div');
            tokenBoard.id = 'api-token-board';
            tokenBoard.style.cssText = 'margin-top: 15px; border-top: 1px dashed var(--border-color); padding-top: 12px;';
            modal.appendChild(tokenBoard);
        }

        const stats = window.PhoneAPI ? window.PhoneAPI.getTokenStats() : { totalCount: 0, totalCost: '0.0000', lastUsage: null, lastCost: '0.0000', pricePerM: 2.0 };
        let lastInfo = stats.lastUsage ? `入: ${stats.lastUsage.prompt} | 出: ${stats.lastUsage.completion} | 总: <b>${stats.lastUsage.total}</b> (约 ￥${stats.lastCost})` : '暂无调用记录';

        tokenBoard.innerHTML = `
            <div style="font-size: 13px; font-weight: bold; color: var(--primary-color); display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span><i class="ph-fill ph-wallet"></i> 实时账户与用量</span>
                <span style="font-size: 10px; color: var(--text-sub); cursor: pointer;" onclick="window.PhoneUI.editTokenPrice()">单价: ￥${stats.pricePerM}/1M ✎</span>
            </div>
            
            <div style="background: linear-gradient(135deg, rgba(167, 139, 250, 0.12), rgba(111, 168, 220, 0.12)); border: 1px solid var(--border-color); padding: 12px; border-radius: 12px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <div style="font-size: 11px; color: var(--text-sub);">中转站令牌状态</div>
                        <div id="remote-api-balance" style="font-size: 17px; font-weight: bold; color: var(--primary-color); font-family: monospace; margin-top: 3px;">
                            <span style="font-size: 12px; font-weight: normal; opacity: 0.7;"><i class="ph ph-spinner spin-anim"></i> 查询中...</span>
                        </div>
                    </div>
                    <button onclick="window.PhoneUI.renderApiModalContent()" style="background: var(--icon-bg); border: 1px solid var(--border-color); color: var(--text-main); font-size: 11px; padding: 4px 10px; border-radius: 8px; cursor: pointer;">
                        <i class="ph ph-arrows-clockwise"></i> 刷新
                    </button>
                </div>
            </div>

            <div style="background: var(--icon-bg); padding: 10px; border-radius: 10px; font-size: 11px; display: flex; flex-direction: column; gap: 5px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--text-sub);">本次累计消耗：</span>
                    <span style="font-weight: bold; color: var(--text-main); font-family: monospace;">${stats.totalCount.toLocaleString()} Tokens (约 ￥${stats.totalCost})</span>
                </div>
                <div style="border-top: 1px dashed var(--border-color); margin: 2px 0;"></div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--text-sub);">最近一次对话：</span>
                    <span style="color: var(--text-main); font-size: 10px;">${lastInfo}</span>
                </div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                <button onclick="if(window.PhoneAPI){window.PhoneAPI.resetTokenStats(); window.PhoneUI.renderApiModalContent();}" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-sub); font-size: 10px; padding: 3px 8px; border-radius: 6px; cursor: pointer;">清零本地统计</button>
            </div>
        `;

        if (window.PhoneAPI && window.PhoneAPI.queryRemoteBalance) {
            const res = await window.PhoneAPI.queryRemoteBalance();
            const balanceEl = document.getElementById('remote-api-balance');
            if (balanceEl) {
                if (res) {
                    balanceEl.innerHTML = res.isUnlimited ? `无限额度 <span style="font-size: 11px; color: var(--text-sub); font-weight: normal;">(已用 ￥${res.used})</span>` : `剩余 ￥${res.remaining} <span style="font-size: 11px; color: var(--text-sub); font-weight: normal;">(总 ￥${res.total})</span>`;
                } else {
                    balanceEl.innerHTML = `<span style="font-size: 11px; color: var(--text-sub); font-weight: normal;">未开放远程余额接口</span>`;
                }
            }
        }
    },

    async editTokenPrice() {
        const cur = localStorage.getItem('token_price_per_m') || '2.0';
        const price = await this.showCustomPrompt('每 100 万 Token 的综合估算价格(元)：', cur);
        if (price !== null && !isNaN(parseFloat(price))) {
            localStorage.setItem('token_price_per_m', parseFloat(price).toString());
            this.renderApiModalContent();
        }
    },

    renderSettings() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        const today = new Date();
        const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const currentColor = localStorage.getItem('app_color') || 'blue';
        const myAvatar = localStorage.getItem('my_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';

        const roleId = window.Config?.currentContactId || 'role_001';
        const allItems = window.Config?.phoneData?.[roleId]?.wechat?.items || [];
        const cleanItems = allItems.filter(i => i.sender !== 'typing' && i.content);
        const lastIdx = parseInt(localStorage.getItem('memory_last_summary_index') || '0', 10);
        const unsummarizedCount = Math.max(0, cleanItems.length - lastIdx);

        const curChatLimit = localStorage.getItem('context_chat_limit') || '60';
        const curVaultLimit = localStorage.getItem('context_vault_limit') || '15';
        const curThreshold = localStorage.getItem('memory_auto_threshold') || '8';

        contentEl.innerHTML = `
        <div class="settings-tabs">
            <div class="settings-tab active" id="stab-basic" onclick="window.PhoneUI.switchSetTab('basic')">基础/UI</div>
            <div class="settings-tab" id="stab-ai" onclick="window.PhoneUI.switchSetTab('ai')">大模型</div>
            <div class="settings-tab" id="stab-draw" onclick="window.PhoneUI.switchSetTab('draw')">绘画引擎</div>
            <div class="settings-tab" id="stab-sys" onclick="window.PhoneUI.switchSetTab('sys')">系统维护</div>
        </div>

        <div id="set-sec-basic" class="set-section active">
            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:15px;"><i class="ph-fill ph-user-circle"></i> 基础设定 (头像与名字)</h3>
                <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:20px; background: var(--icon-bg); padding: 15px; border-radius: 16px; border: 1px dashed var(--border-color);">
                    <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <img id="set-my-avatar" src="${myAvatar}" onclick="window.PhoneUI.triggerAvatarUpload('my_avatar')" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color); cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <span style="font-size:11px; color:var(--text-sub); font-weight:bold;">点击换图</span>
                    </div>
                    <i class="ph-fill ph-arrows-left-right" style="color:var(--border-color); font-size:24px;"></i>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <img id="set-ta-avatar" src="${taAvatar}" onclick="window.PhoneUI.triggerAvatarUpload('ta_avatar')" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color); cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <span style="font-size:11px; color:var(--text-sub); font-weight:bold;">点击换图</span>
                    </div>
                </div>
                <div style="display:flex;gap:10px;margin-bottom:10px;">
                    <div style="flex:1;"><label style="font-size:12px;color:var(--text-sub);">我的名字</label><input type="text" id="my-name" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
                    <div style="flex:1;"><label style="font-size:12px;color:var(--text-sub);">TA的名字</label><input type="text" id="char-name" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
                </div>
            </div>

            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-palette"></i> UI 主题装修</h3>
                <div class="engine-title"><i class="ph-fill ph-paint-brush"></i> 全局主题色</div>
                <div class="color-picker-container">
                    <div id="color-btn-blue" class="color-circle c-blue ${currentColor === 'blue' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('blue')" title="星河水"></div>
                    <div id="color-btn-purple" class="color-circle c-purple ${currentColor === 'purple' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('purple')" title="冰晶紫"></div>
                    <div id="color-btn-pink" class="color-circle c-pink ${currentColor === 'pink' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('pink')" title="薄雾粉"></div>
                    <div id="color-btn-gold" class="color-circle c-gold ${currentColor === 'gold' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('gold')" title="天光金"></div>
                </div>
                <div class="engine-title"><i class="ph-fill ph-heart" style="color:var(--danger-color);"></i> 恋爱纪念日</div>
                <div style="margin-bottom:15px;"><label style="font-size:11px;color:var(--text-sub);">相爱起始日 (用于首页天数计算)</label><input type="date" id="love-start-date" value="${localStorage.getItem('love_start_date') || defaultDate}" onchange="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
                <div class="engine-title"><i class="ph-fill ph-text-aa"></i> 日记本专属设置</div>
                <div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--danger-color);font-weight:bold;">日记起始日期</label><input type="date" id="diary-start-date" value="${defaultDate}" onchange="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
                <div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text-sub);">封面标题</label><input type="text" id="diary-title" placeholder="His Diary" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
            </div>
        </div>

        <div id="set-sec-ai" class="set-section">
            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-scroll"></i> 提示词与人设 (预设库)</h3>
                <div style="margin-bottom:15px;"><label style="font-size:12px;color:var(--text-main);font-weight:bold;">1. 系统指令 (防八股/核心规则)</label><textarea id="system-prompt" rows="4" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;resize:vertical;font-size:12px;margin-top:4px;"></textarea></div>
                <div style="margin-bottom:15px;"><label style="font-size:12px;color:var(--text-main);font-weight:bold;">2. 角色人设 (性格/背景/口吻)</label><textarea id="char-persona" rows="6" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;resize:vertical;font-size:12px;margin-top:4px;"></textarea></div>
            </div>

            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:15px;"><i class="ph-fill ph-sliders-horizontal"></i> 记忆与上下文调节</h3>
                <div style="background:var(--icon-bg); padding:12px; border-radius:12px; margin-bottom:15px; border:1px dashed var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1;">
                        <div style="font-size:12px; font-weight:bold;">未总结消息：<span style="color:var(--primary-color); font-size:16px;">${unsummarizedCount}</span> 条</div>
                    </div>
                    <button onclick="localStorage.setItem('memory_last_summary_index', cleanItems.length.toString()); PhoneUI.renderSettings(); PhoneUI.switchSetTab('ai'); PhoneAPI.showToast('✅ 历史旧账已全部清零！');" style="padding:6px 8px; font-size:11px; border-radius:8px; background:transparent; color:var(--text-sub); border:1px solid var(--border-color); cursor:pointer;">清零旧账</button>
                </div>
                <div style="margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;"><span style="font-weight:bold;">聊天上下文携带条数</span><span id="label-chat-limit" style="color:var(--primary-color); font-weight:bold;">${curChatLimit} 条</span></div>
                    <input type="range" min="10" max="200" step="5" value="${curChatLimit}" oninput="document.getElementById('label-chat-limit').innerText = this.value + ' 条'; localStorage.setItem('context_chat_limit', this.value);" style="width:100%;">
                </div>
                <div style="margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;"><span style="font-weight:bold;">长期记忆库加载数量</span><span id="label-vault-limit" style="color:var(--primary-color); font-weight:bold;">${curVaultLimit} 条</span></div>
                    <input type="range" min="5" max="60" step="1" value="${curVaultLimit}" oninput="document.getElementById('label-vault-limit').innerText = this.value + ' 条'; localStorage.setItem('context_vault_limit', this.value);" style="width:100%;">
                </div>
            </div>

            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-database"></i> 语言引擎预设 (文本模型)</h3>
                <div style="display:flex;gap:8px;align-items:center;margin-bottom:15px;"><select id="preset-delete-select" onchange="window.PhoneUI.fillPresetData()" style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--primary-color);"><option value="">-- 选择预设以编辑或删除 --</option></select><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.deletePreset()" style="width:auto;margin:0;background:transparent;color:var(--danger-color);border:1px solid var(--danger-color);padding:8px 12px;"><i class="ph ph-trash"></i></button></div>
                <div style="margin-bottom:10px;"><input type="text" id="preset-name" placeholder="起个名字 (如: 硅基-DeepSeek)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <div style="margin-bottom:10px;"><input type="text" id="preset-url" placeholder="接口地址 (Base URL)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <div style="margin-bottom:10px;"><input type="password" id="preset-key" placeholder="API Key (密钥)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <div style="margin-bottom:15px;"><input type="text" id="preset-model" placeholder="模型名称 (Model)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.savePreset()" style="margin-top:0;"><i class="ph ph-floppy-disk"></i> 保存 / 更新当前预设</button>
            </div>
        </div>

        <div id="set-sec-draw" class="set-section">
            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-image"></i> 绘画引擎配置 (DALL-E 格式)</h3>
                <div style="margin-bottom:10px;"><input type="text" id="img-api-url" placeholder="接口地址 (例如: https://dangao.iisbo.com/v1)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <div style="margin-bottom:10px;"><input type="password" id="img-api-key" placeholder="API Key (密钥)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <div style="margin-bottom:15px;"><input type="text" id="img-api-model" placeholder="模型名称 (例如: GPT-Image-2 或 dall-e-3)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-refresh" onclick="window.PhoneUI.saveDrawSettings()" style="flex:1; margin-top:0; background:var(--primary-color);"><i class="ph-fill ph-floppy-disk"></i> 💾 保存配置</button>
                    <button class="btn-refresh" onclick="if(window.PhoneEngine && window.PhoneEngine.testDrawImage) window.PhoneEngine.testDrawImage()" style="flex:1; margin-top:0; background:var(--icon-bg); color:var(--text-main); border:1px solid var(--border-color);"><i class="ph-fill ph-sparkle"></i> 🧪 测试连接</button>
                </div>
            </div>
        </div>

        <div id="set-sec-sys" class="set-section">
            <div class="card" style="border: 1px solid var(--primary-color);">
                <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-cloud-check"></i> Cloudflare 云端同步</h3>
                <div style="display:flex;gap:10px;"><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.syncToCloud()" style="flex:1;margin-top:0;background:linear-gradient(135deg, var(--primary-color), var(--secondary-color));"><i class="ph-fill ph-cloud-arrow-up"></i> 备份到云端</button><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.restoreFromCloud()" style="flex:1;margin-top:0;background:var(--icon-bg);color:var(--text-main);border:1px solid var(--border-color);"><i class="ph-fill ph-cloud-arrow-down"></i> 从云端拉取</button></div>
            </div>
            
            <!-- 🌟 补回：本地文件备份 (JSON) 导出/导入卡片 -->
            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:15px;"><i class="ph-fill ph-floppy-disk-back"></i> 本地文件备份 (JSON)</h3>
                <div style="display:flex;gap:10px;">
                    <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.exportData()" style="flex:1;margin-top:0;background:var(--secondary-color);"><i class="ph ph-export"></i> 导出文件</button>
                    <button class="btn-refresh" onclick="document.getElementById('import-file').click()" style="flex:1;margin-top:0;background:#2a9d8f;"><i class="ph ph-import"></i> 导入文件</button>
                    <input type="file" id="import-file" style="display:none" accept=".json" onchange="if(window.PhoneAPI) window.PhoneAPI.importData(event)">
                </div>
            </div>

            <div class="card">
                <h3 style="color:var(--danger-color);margin-bottom:15px;"><i class="ph-fill ph-warning-circle"></i> 系统维护</h3>
                <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.forceUpdate()" style="background:#f4a261;margin-top:0;margin-bottom:10px;"><i class="ph ph-arrows-clockwise"></i> 强制更新系统</button>
                <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.clearChat()" style="background:var(--danger-color);margin-top:0;"><i class="ph ph-trash"></i> 清空记录</button>
            </div>
        </div>
        `;

        setTimeout(() => {
            if (window.PhoneUI && window.PhoneUI.bindLongPresses) window.PhoneUI.bindLongPresses();
            if (window.PhoneAPI) {
                if (window.PhoneAPI.loadSettings) window.PhoneAPI.loadSettings();
                if (window.PhoneAPI.refreshPresetDropdowns) window.PhoneAPI.refreshPresetDropdowns();
            }
        }, 50);
    }
};
