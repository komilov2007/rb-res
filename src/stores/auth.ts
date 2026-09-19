import { create } from "zustand";
import type { AuthProps } from "@/types/auth";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useCartStore } from "@/stores/cart";
import { useLocationStore } from "@/stores/location";

type AuthStoreProps = {
  auth?: AuthProps;
  hasAccess: boolean;
  loginModal: boolean;
  signupModal: boolean;
  profileModal: boolean;
  profileModalVariant: "dropdown" | "center";
  redirectLogin?: string;
  setAuth: (auth?: AuthProps) => void;
  setLoginModal: (loginModal: boolean, redirectLogin?: string) => () => void;
  setSignupModal: (signupModal: boolean) => () => void;
  setProfileModal: (
    profileModal: boolean,
    variant?: "dropdown" | "center",
  ) => () => void;
  logout: () => void;
};
export const useAuthStore = create<AuthStoreProps>()((set) => ({
  auth: undefined,
  hasAccess: false,
  loginModal: false,
  signupModal: false,
  profileModal: false,
  profileModalVariant: "dropdown",

  setAuth: (auth) => {
    set({ auth, hasAccess: Boolean(auth?.access) });
  },

  setLoginModal: (loginModal, redirectLogin) => () => {
    set({ loginModal, redirectLogin });
  },

  setSignupModal: (signupModal) => () => {
    set({ signupModal });
  },

  setProfileModal: (profileModal, variant = "dropdown") => () => {
    set({ profileModal, profileModalVariant: variant });
  },

  logout: () => {
    useCartStore.getState().clearCart();
    useLocationStore.getState().clearLocation();
    // The header chip reads the delivery/pickup choice from here, so a
    // logged-out user starts without the previous user's selection.
    useBranchSelectionStore.getState().clearSelection();

    set({
      auth: undefined,
      hasAccess: false,
      profileModal: false,
      profileModalVariant: "dropdown",
      loginModal: false,
      signupModal: false,
    });
  },
}));

