"use client";

import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { toast } from "sonner";

import { postFcmToken } from "@/apis/firebase";
import { FIREBASE_VAPID_KEY, getFirebaseMessaging } from "@/configs/firebase";
import { useAuthStore } from "@/stores/auth";

const TOKEN_STORAGE_KEY = "rb-fcm-token";

// Logged-in user → ask notification permission, register the FCM token with
// the backend (only when it changed) and show foreground messages as toasts.
// Mirrors rb-webapp layout/hoc-firebase.tsx; silently does nothing where web
// push isn't supported (e.g. inside the Telegram webview).
const FirebaseProvider = () => {
  const customer = useAuthStore((state) => state.auth?.customer);

  useEffect(() => {
    if (!customer || typeof Notification === "undefined") return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const setup = async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging || cancelled) return;

      const permission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;
      if (permission !== "granted" || cancelled) return;

      try {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
        );
        const token = await getToken(messaging, {
          vapidKey: FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        const storedKey = `${TOKEN_STORAGE_KEY}-${customer}`;

        if (token && window.localStorage.getItem(storedKey) !== token) {
          await postFcmToken({ fb_token: token, customer });
          window.localStorage.setItem(storedKey, token);
        }
      } catch {
        // Token olinmasa ilova ishlashda davom etadi
      }

      if (cancelled) return;

      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? payload.data?.title;
        const body = payload.notification?.body ?? payload.data?.body;

        if (title || body) toast(title ?? body, title ? { description: body } : undefined);
      });
    };

    void setup();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [customer]);

  return null;
};

export default FirebaseProvider;
