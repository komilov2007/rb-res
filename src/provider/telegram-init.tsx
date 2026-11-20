"use client";

import { useEffect } from "react";
import type { WebApp as TelegramWebApp } from "@twa-dev/types";

type Inset = { top: number; bottom: number; left: number; right: number };

// Fields added in Bot API 7.7–8.0 that @twa-dev/types 8.0.2 may not declare.
type ModernWebApp = TelegramWebApp & {
  isFullscreen?: boolean;
  safeAreaInset?: Inset;
  contentSafeAreaInset?: Inset;
  requestFullscreen?: () => void;
  disableVerticalSwipes?: () => void;
  onEvent: (event: string, cb: () => void) => void;
  offEvent: (event: string, cb: () => void) => void;
};

const MOBILE_PLATFORMS = new Set(["ios", "android", "android_x"]);
const WAIT_STEP_MS = 50;
const WAIT_LIMIT_MS = 5000;

const getWebApp = (): ModernWebApp | null => {
  const tg = (window as unknown as { Telegram?: { WebApp?: ModernWebApp } })
    .Telegram?.WebApp;

  // The script defines WebApp in any browser; initData is only set inside Telegram.
  return tg && tg.initData ? tg : null;
};

const setInsetVars = (prefix: string, inset?: Inset) => {
  const style = document.documentElement.style;
  (["top", "bottom", "left", "right"] as const).forEach((side) => {
    style.setProperty(`--tg-${prefix}-${side}`, `${inset?.[side] ?? 0}px`);
  });
};

const syncInsets = (tg: ModernWebApp) => {
  setInsetVars("safe-area-inset", tg.safeAreaInset);
  setInsetVars("content-safe-area-inset", tg.contentSafeAreaInset);
};

const setup = (tg: ModernWebApp) => {
  tg.ready();
  tg.expand();

  try {
    tg.setHeaderColor("#ffffff");
    tg.setBackgroundColor("#ffffff");
  } catch {
    // Older clients reject custom colors; keep their defaults.
  }

  // Stops the swipe-down gesture from collapsing the app while scrolling.
  if (tg.isVersionAtLeast("7.7")) tg.disableVerticalSwipes?.();

  // True fullscreen (no Telegram top bar) on phones; desktop stays windowed.
  if (
    tg.isVersionAtLeast("8.0") &&
    MOBILE_PLATFORMS.has(tg.platform) &&
    !tg.isFullscreen
  ) {
    try {
      tg.requestFullscreen?.();
    } catch {
      // Fullscreen unsupported on this client; expand() already applied.
    }
  }

  syncInsets(tg);
};

const TelegramInit = () => {
  useEffect(() => {
    let tg: ModernWebApp | null = null;
    let waited = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onChange = () => {
      if (!tg) return;
      syncInsets(tg);
      if (!tg.isExpanded) tg.expand();
    };

    const events = [
      "viewportChanged",
      "safeAreaChanged",
      "contentSafeAreaChanged",
      "fullscreenChanged",
    ];

    // telegram-web-app.js loads afterInteractive, so poll briefly for it.
    const init = () => {
      tg = getWebApp();
      if (tg) {
        setup(tg);
        events.forEach((event) => tg?.onEvent(event, onChange));
        return;
      }
      waited += WAIT_STEP_MS;
      if (waited < WAIT_LIMIT_MS) timer = setTimeout(init, WAIT_STEP_MS);
    };

    init();

    return () => {
      clearTimeout(timer);
      events.forEach((event) => tg?.offEvent(event, onChange));
    };
  }, []);

  return null;
};

export default TelegramInit;
