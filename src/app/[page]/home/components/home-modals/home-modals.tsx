"use client";

import ModalScreen from "@/components/modal/modal-screen";
import { useModalStore } from "@/store/modal";
import SearchModalScreen from "./components/search-modal-screen";

const HomeModals = () => {
  const activeModal = useModalStore((state) => state.activeModal);
  const closeModal = useModalStore((state) => state.closeModal);

  if (!activeModal) return null;

  return (
    <ModalScreen onClose={closeModal}>
      <SearchModalScreen onClose={closeModal} />
    </ModalScreen>
  );
};

export default HomeModals;
