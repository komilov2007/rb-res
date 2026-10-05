"use client";

import { useSyncExternalStore } from "react";

import { isClick } from "@/utils/click";

// isClick() never changes for the lifetime of the page, so there is
// nothing to subscribe to.
const subscribe = () => () => {};

// Server snapshot: isClick() reads window, so it is always false during
// SSR. Returning that explicitly is what lets React hydrate against the
// server markup and then settle on the real value, instead of the markup
// mismatching.
const getServerSnapshot = () => false;

// Render-safe companion to isClick(): components that only *render*
// differently inside the Click superapp read this hook, while non-render
// logic (payload building, click handlers, effects) keeps calling isClick()
// directly as rb-shop does.
export const useIsClick = () =>
  useSyncExternalStore(subscribe, isClick, getServerSnapshot);
