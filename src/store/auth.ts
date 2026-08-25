import { create } from "zustand";
import type { AuthProps } from "@/types/auth";
import { useCartStore } from "@/store/cart";
import { useLocationStore } from "@/store/location";

type AuthStoreProps = {
  auth?: AuthProps;
  hasAccess: boolean;
  loginModal: boolean;
  signupModal: boolean;
  profileModal: boolean;
  redirectLogin?: string;
  setAuth: (auth?: AuthProps) => void;
  setLoginModal: (loginModal: boolean, redirectLogin?: string) => () => void;
  setSignupModal: (signupModal: boolean) => () => void;
  setProfileModal: (profileModal: boolean) => () => void;
  logout: () => void;
};
export const useAuthStore = create<AuthStoreProps>()((set) => ({
  auth: undefined,
  hasAccess: false,
  loginModal: false,
  signupModal: false,
  profileModal: false,

  setAuth: (auth) => {
    set({ auth, hasAccess: Boolean(auth?.access) });
  },

  setLoginModal: (loginModal, redirectLogin) => () => {
    set({ loginModal, redirectLogin });
  },

  setSignupModal: (signupModal) => () => {
    set({ signupModal });
  },

  setProfileModal: (profileModal) => () => {
    set({ profileModal });
  },

  logout: () => {
    useCartStore.getState().clearCart();
    useLocationStore.getState().clearLocation();

    set({
      auth: undefined,
      hasAccess: false,
      profileModal: false,
      loginModal: false,
      signupModal: false,
    });
  },
}));
