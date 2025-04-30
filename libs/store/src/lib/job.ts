import { create } from 'zustand';

interface JobState {
  jobCardNumber: string;
  jobCardDate: string;
  productionQty: number;
  setField: (key: string, value: string | number) => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobCardNumber: '',
  jobCardDate: '',
  productionQty: 0,
  setField: (key, value) => set((state) => ({ ...state, [key]: value })),
}));
