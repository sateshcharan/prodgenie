import { create } from 'zustand';

type JobCardSection = {
  section: string;
  fields: any[];
  schema: string;
};

interface JobCardState {
  jobCardNumber: string;
  scheduleDate: Date;
  poNumber: string;
  productionQty: number;
  setJobCardNumber: (jobCardNumber: string) => void;
  setScheduleDate: (scheduleDate: Date) => void;
  setPoNumber: (poNumber: string) => void;
  setProductionQty: (productionQty: number) => void;
  jobCardData: JobCardSection[];
  setJobCardData: (data: JobCardSection[]) => void;
}

const useJobCardStore = create<JobCardState>((set) => ({
  jobCardNumber: '',
  scheduleDate: new Date(),
  poNumber: '',
  productionQty: 0,
  setJobCardNumber: (jobCardNumber: string) => set({ jobCardNumber }),
  setScheduleDate: (scheduleDate: Date) => set({ scheduleDate }),
  setPoNumber: (poNumber: string) => set({ poNumber }),
  setProductionQty: (productionQty: number) => set({ productionQty }),
  jobCardData: [],
  setJobCardData: (data) => set({ jobCardData: data }),
}));

export { useJobCardStore };
