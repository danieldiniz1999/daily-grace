// Service worker do Daily Grace: guarda no aparelho os arquivos "pesados"
// e gerencia notificações push.
const CACHE = "dg-static-v2";

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {
    title: "Daily Grace",
    body: "Seu devocional está pronto!",
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/favicon.png",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Arquivos que são cacheados (conteúdo estático, bíblia, fontes)
function isCacheable(url) {
  if (url.origin === self.location.origin) {
    return (
      url.pathname.startsWith("/bible/") ||
      url.pathname.startsWith("/assets/") ||
      url.pathname.startsWith("/_build/assets/") ||
      /\.(png|jpg|jpeg|webp|avif|svg|woff2?|css|js)$/.test(url.pathname)
    );
  }
  return url.hostname === "fonts.gstatic.com" || url.hostname === "fonts.googleapis.com";
}

// Arquivos imutáveis nunca mudam: retorna do cache direto sem chamada de rede em segundo plano
function isImmutable(url) {
  if (url.origin === self.location.origin) {
    return (
      url.pathname.startsWith("/bible/") ||
      /[-_][a-zA-Z0-9]{6,}\.(js|css|woff2?|png|jpg|jpeg|webp|svg)$/.test(url.pathname)
    );
  }
  return url.hostname === "fonts.gstatic.com";
}

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (!isCacheable(url)) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      if (cached) {
        // Se for imutável, entrega do cache na hora com 0ms de latência
        if (isImmutable(url)) {
          return cached;
        }
        // Para arquivos mutáveis, entrega o que está salvo e atualiza em segundo plano
        void fetch(req)
          .then((res) => {
            if (res && res.ok) void cache.put(req, res.clone());
          })
          .catch(() => {});
        return cached;
      }
      const res = await fetch(req);
      if (res && res.ok) void cache.put(req, res.clone());
      return res;
    }),
  );
});
