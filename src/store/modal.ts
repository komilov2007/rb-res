import { create } from "zustand";

type ModalName = "search" | null;

type ModalStoreProps = {
  activeModal: ModalName;
  openModal: (modal: Exclude<ModalName, null>) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalStoreProps>()((set) => ({
  activeModal: null,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}));
