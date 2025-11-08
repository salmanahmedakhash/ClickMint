// This file must be in the public root folder.

// Using compat scripts for service worker as it's a common pattern for FCM
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCHdEG-jEIZFlv9aPm-ex8GH_VCN6-lNgk",
  authDomain: "earn-x-e06db.firebaseapp.com",
  projectId: "earn-x-e06db",
  storageBucket: "earn-x-e06db.firebasestorage.app",
  messagingSenderId: "309340784883",
  appId: "1:309340784883:web:bb7b416407b869c90a0f86",
  measurementId: "G-WKBL6LH27G"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  if (payload.notification) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico' // You can add a specific icon here
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});