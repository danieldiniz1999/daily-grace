// Service worker do Daily Grace: guarda no aparelho os arquivos "pesados"
// e gerencia notificações push.
const CACHE = "dg-static-v1";

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


// Só guardamos conteúdo estático. Nada de HTML, API ou dados do usuário.
function isCacheable(url) {
  if (url.origin === self.location.origin) {
    return (
      url.pathname.startsWith("/bible/") ||
      url.pathname.startsWith("/_build/assets/") ||
      /\.(png|jpg|jpeg|webp|avif|svg|woff2?|css|js)$/.test(url.pathname)
    );
  }
  return url.hostname === "fonts.gstatic.com" || url.hostname === "fonts.googleapis.com";
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
        // Entrega o que já está salvo e atualiza em segundo plano.
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
