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

        try {
            const db = await openDB();
            const saved = await get(db, 'full_phone_data');

            if (saved) {
                this.phoneData = typeof saved === 'string' ? JSON.parse(saved) : saved;
                // 迁移完成后删除旧的大 localStorage 副本，释放空间。
                try { localStorage.removeItem('phone_data'); } catch {}
            } else {
                // 第一次升级时，把旧聊天记录迁移到 IndexedDB。
                const legacy = localStorage.getItem('phone_data');
                if (legacy) {
                    try {
                        this.phoneData = JSON.parse(legacy) || {};
                        await put(db, 'full_phone_data', JSON.stringify(this.phoneData));
                        try { localStorage.removeItem('phone_data'); } catch {}
                    } catch {
                        this.phoneData = {};
                    }
                }
            }
        } catch (error) {
            // IndexedDB 暂时不可用时才回退到旧 localStorage。
            try {
                const legacy = localStorage.getItem('phone_data');
                this.phoneData = legacy ? (JSON.parse(legacy) || {}) : {};
            } catch {
                this.phoneData = {};
            }
        }

        if (!this.phoneData || typeof this.phoneData !== 'object') this.phoneData = {};
        this._phoneDataReady = true;
        return this.phoneData;
    }
};
