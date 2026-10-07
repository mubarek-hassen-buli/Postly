import { create } from 'zustand';

interface DetailModalState {
  isDetailModalOpen: boolean;
  setDetailModalOpen: (open: boolean) => void;
}

export const useDetailModalStore = create<DetailModalState>((set) => ({
  isDetailModalOpen: false,
  setDetailModalOpen: (open: boolean) => set({ isDetailModalOpen: open }),
}));
