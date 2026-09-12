// 🌟 核心修复：改为“网络优先”策略，不再死死抱住旧缓存！
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // 每次都优先去网络（GitHub）获取最新代码，如果断网了才用缓存
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
