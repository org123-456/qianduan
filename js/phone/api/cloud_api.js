const SUPABASE_URL = 'https://kkzztqbxjzskrsapiils.supabase.co';
const SUPABASE_KEY = 'sb_publishable_h1SIixE2PCM2hrjXvt1I4w_eKYSQCE0';

export const CloudAPI = {
    async syncToCloud() {
        if (window.PhoneAPI) window.PhoneAPI.showToast("☁️ 正在上传存档至 Supabase 数据库...");
        try {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                data[key] = localStorage.getItem(key);
            }
            const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };
            const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/phone_sync?id=eq.1&select=id`, { headers });
            const checkData = await checkRes.json();
            let saveRes;
            if (checkData && checkData.length > 0) {
                saveRes = await fetch(`${SUPABASE_URL}/rest/v1/phone_sync?id=eq.1`, { method: 'PATCH', headers: headers, body: JSON.stringify({ content: JSON.stringify(data) }) });
            } else {
                saveRes = await fetch(`${SUPABASE_URL}/rest/v1/phone_sync`, { method: 'POST', headers: { ...headers, 'Prefer': 'return=representation' }, body: JSON.stringify({ id: 1, content: JSON.stringify(data) }) });
            }
            if (!saveRes.ok) throw new Error(`[${saveRes.status}]`);
            if (window.PhoneAPI) window.PhoneAPI.showToast("🎉 成功同步至 Supabase！云端已安全归档！");
        } catch (err) { alert("Supabase 同步失败: " + err.message); }
    },
    
    async restoreFromCloud() {
        if (!confirm("⚠️ 确定要从 Supabase 恢复存档吗？这会覆盖本地当前的数据！")) return;
        if (window.PhoneAPI) window.PhoneAPI.showToast("📥 正在从 Supabase 拉取最新存档...");
        try {
            const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };
            const res = await fetch(`${SUPABASE_URL}/rest/v1/phone_sync?id=eq.1&select=content`, { headers });
            if (!res.ok) throw new Error(`[${res.status}]`);
            const rows = await res.json();
            if (!rows || rows.length === 0 || !rows[0].content) return alert("Supabase 云端还没有备份数据哦！");
            let data = rows[0].content;
            if (typeof data === 'string') { try { data = JSON.parse(data); } catch (e) {} }
            if (typeof data === 'object' && data !== null) {
                for (const key in data) {
                    let val = data[key];
                    if (typeof val === 'object' && val !== null) localStorage.setItem(key, JSON.stringify(val));
                    else localStorage.setItem(key, String(val));
                }
            }
            if (window.PhoneAPI) window.PhoneAPI.showToast("✨ 云端恢复成功！正在重新载入...");
            setTimeout(() => { window.location.reload(); }, 1200);
        } catch (err) { alert("Supabase 恢复失败: " + err.message); }
    },
    
    async exportData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); data[key] = localStorage.getItem(key); }
        const jsonStr = JSON.stringify(data, null, 2);
        const dateStr = new Date().toISOString().replace(/[:\-\sT]/g, '').slice(0, 14);
        const fileName = `ClaireClaude_Backup_${dateStr}.json`;
        try {
            const file = new File([jsonStr], fileName, { type: 'application/json' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file] });
                if (window.PhoneAPI) window.PhoneAPI.showToast("📦 备份已发送！");
                return;
            }
        } catch (err) {}
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
    },
    
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!confirm("⚠️ 警告：导入存档将覆盖当前手机里的所有记录！确定吗？")) { event.target.value = ''; return; }
                for (const key in data) {
                    let val = data[key];
                    if (typeof val === 'object' && val !== null) localStorage.setItem(key, JSON.stringify(val));
                    else localStorage.setItem(key, String(val));
                }
                if (window.PhoneAPI) window.PhoneAPI.showToast("✨ 导入成功！正在重启...");
                setTimeout(() => { window.location.reload(); }, 1500);
            } catch (err) { alert("导入失败！"); }
            event.target.value = '';
        };
        reader.readAsText(file);
    }
};
