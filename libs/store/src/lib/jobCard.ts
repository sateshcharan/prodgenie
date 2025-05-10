import { create } from 'zustand';

interface JobCardState {
  jobCardNumber: string;
  jobCardDate: Date;
  jobCardQty: number;
  setJobCardNumber: (jobCardNumber: string) => void;
  setJobCardDate: (jobCardDate: Date) => void;
  setJobCardQty: (jobCardQty: number) => void;
}

const useJobCardStore = create<JobCardState>((set) => ({
  jobCardNumber: '',
  jobCardDate: new Date(),
  jobCardQty: 0,
  setJobCardNumber: (jobCardNumber: string) => set({ jobCardNumber }),
  setJobCardDate: (jobCardDate: Date) => set({ jobCardDate }),
  setJobCardQty: (jobCardQty: number) => set({ jobCardQty }),
}));

export { useJobCardStore };
