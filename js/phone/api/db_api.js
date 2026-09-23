export const LocalDB = {
    dbName: 'cc-assets', 
    storeName: 'img', 
    _db: null, 
    _urls: {},
    
    init() {
        return new Promise((res, rej) => {
            const r = indexedDB.open(this.dbName, 1);
            r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(this.storeName)) r.result.createObjectStore(this.storeName); };
            r.onsuccess = () => { this._db = r.result; res(this._db); };
            r.onerror = () => rej(r.error);
        });
    },
    
    async get(key) {
        if (!this._db) await this.init();
        return new Promise((res, rej) => {
            const r = this._db.transaction(this.storeName, 'readonly').objectStore(this.storeName).get(key);
            r.onsuccess = () => res(r.result || null);
            r.onerror = () => rej(r.error);
        });
    },
    
    async set(key, blob) {
        if (!this._db) await this.init();
        return new Promise((res, rej) => {
            const t = this._db.transaction(this.storeName, 'readwrite');
            t.objectStore(this.storeName).put(blob, key);
            t.oncomplete = () => res();
            t.onerror = () => rej(t.error);
        });
    },
    
    async delete(key) {
        if (!this._db) await this.init();
        return new Promise((res, rej) => {
            const t = this._db.transaction(this.storeName, 'readwrite');
            t.objectStore(this.storeName).delete(key);
            t.oncomplete = () => res();
            t.onerror = () => rej(t.error);
        });
    },
    
    shrink(file, maxW) {
        return new Promise((res, rej) => {
            const url = URL.createObjectURL(file);
            const im = new Image();
            im.onload = () => {
                URL.revokeObjectURL(url);
                let w = im.naturalWidth, h = im.naturalHeight;
                if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
                const c = document.createElement('canvas');
                c.width = w; c.height = h;
                c.getContext('2d').drawImage(im, 0, 0, w, h);
                c.toBlob(b => b ? res(b) : rej(new Error('压缩失败')), 'image/jpeg', 0.85);
            };
            im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('文件打不开')); };
            im.src = url;
        });
    },
    
    urlOf(key, blob) {
        if (this._urls[key]) URL.revokeObjectURL(this._urls[key]);
        this._urls[key] = URL.createObjectURL(blob);
        return this._urls[key];
    }
};
