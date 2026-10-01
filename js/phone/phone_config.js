// 聊天记录优先从 IndexedDB 恢复，避免 localStorage 容量限制导致退出后丢记录。
export const Config = {
    currentContactId: 'role_001',
    currentAppId: 'wechat',
    externalData: {
        "role_001": { 
            name: "Claire & Claude", 
            persona: "", 
            memory: "",
            recentChat: ""
        }
    },
    phoneData: {},
    _phoneDataReady: false,

    async hydratePhoneData() {
        if (this._phoneDataReady) return this.phoneData;

        const openDB = () => new Promise((resolve, reject) => {
            const request = indexedDB.open('cc-assets', 1);
            request.onupgradeneeded = () => {
                if (!request.result.objectStoreNames.contains('img')) {
                    request.result.createObjectStore('img');
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            request.onblocked = () => reject(new Error('IndexedDB 被其他页面占用'));
        });

        const get = (db, key) => new Promise((resolve, reject) => {
            const request = db.transaction('img', 'readonly').objectStore('img').get(key);
            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => reject(request.error);
        });

        const put = (db, key, value) => new Promise((resolve, reject) => {
            const tx = db.transaction('img', 'readwrite');
            tx.objectStore('img').put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });

        const isUsablePhoneData = (data) => {
            if (!data || typeof data !== 'object') return false;
            return Object.values(data).some(v => {
                const items = v?.wechat?.items;
                return Array.isArray(items) && items.length > 0;
            });
        };

        const parseLegacy = (raw) => {
            if (!raw) return null;
            try {
                const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                return parsed && typeof parsed === 'object' ? parsed : null;
            } catch {
                return null;
            }
        };

        try {
            const db = await openDB();
            const saved = parseLegacy(await get(db, 'full_phone_data'));
            const legacy = parseLegacy(localStorage.getItem('phone_data'));

            // 恢复优先级：有实际聊天记录的数据 > 空壳数据。
            // 关键点：不再因为 IndexedDB 里存在一个空对象，就把旧聊天覆盖掉。
            if (isUsablePhoneData(saved) || !isUsablePhoneData(legacy)) {
                this.phoneData = saved || legacy || {};
            } else {
                this.phoneData = legacy;
            }

            // 如果发现旧 localStorage 比 IDB 更完整，把它重新写回 IDB。
            if (isUsablePhoneData(legacy) && !isUsablePhoneData(saved)) {
                await put(db, 'full_phone_data', JSON.stringify(legacy));
            }

            // 不再立刻删除 phone_data。
            // 它现在作为灾备副本保留，等确认 IDB 数据正常后再由后续版本安全清理。
            if (isUsablePhoneData(this.phoneData)) {
                console.log('✅ 本地聊天数据恢复成功', this.phoneData);
            } else {
                console.warn('⚠️ 未找到可用聊天记录；已保留所有旧存储，不执行清理');
            }
        } catch (error) {
            // IndexedDB 不可用时继续尝试旧 localStorage，而且绝不清除它。
            const legacy = parseLegacy(localStorage.getItem('phone_data'));
            this.phoneData = legacy || {};
            console.warn('⚠️ IndexedDB 恢复失败，已回退到 localStorage:', error);
        }

        if (!this.phoneData || typeof this.phoneData !== 'object') this.phoneData = {};
        this._phoneDataReady = true;
        return this.phoneData;
    }
};
