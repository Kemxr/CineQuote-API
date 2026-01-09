self.addEventListener('push', event => {
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    data = { title: 'Nouvelle citation', body: "Une nouvelle citation est disponible aujourd'hui." };
  }

  const title = data.title || 'Nouvelle citation';
  const options = {
    body: data.body || "Une nouvelle citation est disponible aujourd'hui.",
    icon: data.icon || '/DVD-192.jpg',
    badge: data.badge || '/DVD-192.jpg',
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});