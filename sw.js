// 这是一个最基础的 Service Worker
// 它的唯一作用就是欺骗 Edge/Chrome 浏览器，让它认为我们是一个真正的 App！

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // 啥也不干，直接放行所有网络请求
    e.respondWith(fetch(e.request));
});
