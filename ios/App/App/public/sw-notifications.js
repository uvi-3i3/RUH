self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const data = notification?.data || {};
  const action = event.action || 'open';
  notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({
            type: 'RUH_NOTIFICATION_ACTION',
            action,
            prayerId: data.prayerId || null,
            reminderId: data.reminderId || null,
          });
          return;
        }
      }
      if (self.clients.openWindow) {
        const suffix =
          action === 'mark_prayed' && data.prayerId
            ? `/?markPrayer=${encodeURIComponent(data.prayerId)}`
            : '/';
        return self.clients.openWindow(suffix);
      }
      return undefined;
    })
  );
});
