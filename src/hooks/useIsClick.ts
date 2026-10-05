"use client";

import { useSyncExternalStore } from "react";

import { isClick } from "@/utils/click";

const subscribe = () => () => {};

const getServerSnapshot = () => false;

export const useIsClick = () =>
  useSyncExternalStore(subscribe, isClick, getServerSnapshot);
