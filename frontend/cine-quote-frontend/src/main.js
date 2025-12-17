import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '../router.js'

createApp(App).use(router).mount('#app')

if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
  const VAPID_PUBLIC_KEY = 'BKvszeeoOzdvxWsG_jHoAD5H-ttkrW6x5gTiDWHQmPNs7_SE3zEJXtEJUQh69WV1YrdcjxNq57mfNwuihwWn6Ag';

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  navigator.serviceWorker.register('/sw.js').then(async registration => {
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      return;
    }

    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (e) {
      console.error('Error sending push subscription to backend', e);
    }
  }).catch(err => {
    console.error('Service Worker registration failed', err);
  });
}
