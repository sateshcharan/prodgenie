import { create } from 'zustand';

interface JobCardState {
  jobCardNumber: string;
  scheduleDate: Date;
  poNumber: string;
  productionQty: number;
  rmBoardSize: { length: number; width: number };
  setJobCardNumber: (jobCardNumber: string) => void;
  setScheduleDate: (scheduleDate: Date) => void;
  setPoNumber: (poNumber: string) => void;
  setProductionQty: (productionQty: number) => void;
  setRmBoardSize: (rmBoardSize: { length: number; width: number }) => void;
}

const useJobCardStore = create<JobCardState>((set) => ({
  jobCardNumber: '',
  scheduleDate: new Date(),
  poNumber: '',
  productionQty: 0,
  rmBoardSize: { length: 0, width: 0 },
  setJobCardNumber: (jobCardNumber: string) => set({ jobCardNumber }),
  setScheduleDate: (scheduleDate: Date) => set({ scheduleDate }),
  setPoNumber: (poNumber: string) => set({ poNumber }),
  setProductionQty: (productionQty: number) => set({ productionQty }),
  setRmBoardSize: (rmBoardSize: { length: number; width: number }) =>
    set({ rmBoardSize }),
}));

export { useJobCardStore };
