export const EchoVault = {
    getData() {
        const raw = localStorage.getItem('echovault_data');
        let parsed = raw ? JSON.parse(raw) : null;
        
        if (!parsed || (Object.keys(parsed.daily).length === 0 && Object.keys(parsed.permanent).length === 0)) {
            const defaultData = { daily: {}, permanent: {}, archive: {} };
            let oldVaultRaw = localStorage.getItem('memory_vault_entries');
            if (!oldVaultRaw) oldVaultRaw = localStorage.getItem('memory_vault_entries_backup');
            
            if (oldVaultRaw) {
                try {
                    const oldVault = JSON.parse(oldVaultRaw);
                    oldVault.forEach(item => {
                        if (item.isCore) {
                            const title = item.keywords || item.content.substring(0, 10) + '...';
                            defaultData.permanent[title] = { type: 'permanent', created: `${item.date} ${item.time}`, importance: 10, tags: item.source, hits: 0, content: item.content, comments: [] };
                        } else {
                            const dateStr = item.date || new Date().toISOString().split('T')[0];
                            if (defaultData.daily[dateStr]) defaultData.daily[dateStr].content += `\n\n---\n\n${item.content}`;
                            else defaultData.daily[dateStr] = { type: 'daily', created: `${item.date} ${item.time}`, importance: 5, tags: item.source, hits: 0, content: item.content, comments: [] };
                        }
                    });
                    localStorage.setItem('memory_vault_entries_backup', oldVaultRaw);
                    localStorage.removeItem('memory_vault_entries');
                    localStorage.setItem('echovault_data', JSON.stringify(defaultData));
                    console.log("✅ 成功从备份恢复记忆！");
                    return defaultData;
                } catch(e) { console.error("记忆恢复失败", e); }
            }
            return defaultData;
        }
        return parsed;
    },
    saveData(data) { localStorage.setItem('echovault_data', JSON.stringify(data)); },
    calculateScore(meta, daysOld) {
        const importance = parseInt(meta.importance) || 5;
        const hits = parseInt(meta.hits) || 0;
        const halfLife = Math.max(importance * 10, 1);
        const decay = Math.exp(-Math.LN2 / halfLife * daysOld);
        const bonus = 1 + 0.35 * Math.log(1 + hits);
        return parseFloat((importance * decay * bonus).toFixed(2));
    },
    write(content, type = 'daily', importance = 5, tags = '', title = '') {
        const data = this.getData();
        const now = new Date();
        const dateStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0]; 
        const created = now.toLocaleString('zh-CN', { hour12: false });
        if (type === 'daily') {
            if (data.daily[dateStr]) data.daily[dateStr].content += `\n\n---\n\n${content}`;
            else data.daily[dateStr] = { type: 'daily', created, importance, tags, hits: 0, content, comments: [] };
        } else if (type === 'permanent') {
            const key = title || content.substring(0, 10).replace(/\s/g, '_') + '_' + now.getHours() + now.getMinutes();
            data.permanent[key] = { type: 'permanent', created, importance, tags, hits: 0, content, comments: [] };
        }
        this.saveData(data);
        return true;
    },
    updateMemory(key, newContent) {
        const data = this.getData();
        let updated = false;
        if (data.permanent[key]) { data.permanent[key].content = newContent; updated = true; } 
        else if (data.daily[key]) { data.daily[key].content = newContent; updated = true; }
        if (updated) this.saveData(data);
        return updated;
    },
    deleteMemory(key) {
        const data = this.getData();
        let deleted = false;
        if (data.permanent[key]) { delete data.permanent[key]; deleted = true; }
        if (data.daily[key]) { delete data.daily[key]; deleted = true; }
        if (deleted) this.saveData(data);
        return deleted;
    },
    dream() {
        const data = this.getData();
        const dates = Object.keys(data.daily).sort((a, b) => new Date(b) - new Date(a));
        return dates.slice(0, 3).map(date => ({ date, ...data.daily[date] }));
    },
    remind() {
        const data = this.getData();
        const dates = Object.keys(data.daily);
        if (dates.length === 0) return null;
        const now = new Date();
        let scoredFiles = dates.map(date => {
            const meta = data.daily[date];
            const createdDate = new Date(meta.created.split(' ')[0]);
            const daysOld = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
            return { date, meta, score: this.calculateScore(meta, daysOld) };
        });
        scoredFiles.sort((a, b) => a.score - b.score);
        const poolSize = Math.max(1, Math.floor(scoredFiles.length / 3));
        const chosen = scoredFiles[Math.floor(Math.random() * poolSize)];
        this.incrementHits('daily', chosen.date);
        return chosen;
    },
    incrementHits(type, key) {
        const data = this.getData();
        if (data[type] && data[type][key]) { data[type][key].hits = (data[type][key].hits || 0) + 1; this.saveData(data); }
    },
    deleteItem(type, key) {
        const data = this.getData();
        if (data[type] && data[type][key]) { delete data[type][key]; this.saveData(data); }
    }
};
