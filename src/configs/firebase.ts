import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

// Push notifications (FCM) — ported from rb-webapp src/firebase/firebase.ts.
// Config comes from NEXT_PUBLIC_FIREBASE_* (.env). Background messages are
// handled by public/firebase-messaging-sw.js.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAP_ID_KEY;

let messagingPromise: Promise<Messaging | null> | null = null;

// null when the environment can't do web push (SSR, Telegram in-app webview,
// iOS Safari outside a home-screen app, missing config).
export const getFirebaseMessaging = () => {
  if (typeof window === "undefined" || !firebaseConfig.apiKey) {
    return Promise.resolve(null);
  }

  messagingPromise ??= isSupported()
    .then((supported) => {
      if (!supported) return null;
      const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
      return getMessaging(app);
    })
    .catch(() => null);

  return messagingPromise;
};
