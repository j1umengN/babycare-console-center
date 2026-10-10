/* BabyCare Console Center · Service Worker
 * 策略：
 *  - 应用外壳（index.html / manifest / 图标）预缓存，离线可开
 *  - 导航请求：network-first，失败回退到缓存的 index.html（弱网/离线秒开）
 *  - 同源静态资源：cache-first
 *  - 跨域请求与同源数据接口（/rest/v1/ 云同步）：一律放行透传，不缓存
 * 升级时变更 CACHE 版本号即可清旧缓存
 */
const CACHE = 'anbaby-v3'; // 缓存代号（与应用版本号无关，仅用于清旧缓存）
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 跨域（外部 API 等）直接放行，不进缓存
  if (url.origin !== self.location.origin) return;
  // 自建后端的数据接口一律走网络：同步是「写后即读」，必须拿到最新数据，绝不缓存
  if (url.pathname.indexOf('/rest/v1/') === 0) return;
  // 导航：network-first，离线回退缓存外壳
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(r => { caches.open(CACHE).then(c => c.put('./index.html', r.clone())); return r; })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }
  // 同源静态：cache-first，缺失再网络并补缓存
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r && r.ok && (r.type === 'basic' || r.type === 'default')) {
        const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp));
      }
      return r;
    }).catch(() => hit))
  );
});

/* 点击通知：聚焦已打开的窗口，否则打开应用 */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
