import { create } from 'zustand';

interface BomState {
  bom: any[];
  titleBlock: any;
  printingDetails: any[];
  selectedItems: any[];
  setBom: (bom: any[]) => void;
  setTitleBlock: (titleBlock: any) => void;
  setPrintingDetails: (printingDetails: any[]) => void;

  setSelectedItems: (items: any[] | ((prev: any[]) => any[])) => void;
  toggleSelectedItem: (slNo: string) => void;
}

const useBomStore = create<BomState>((set, get) => ({
  bom: [],
  titleBlock: {},
  printingDetails: [],
  selectedItems: [],
  setBom: (bom) => set({ bom }),
  setTitleBlock: (titleBlock) => set({ titleBlock }),
  setPrintingDetails: (printingDetails) => set({ printingDetails }),

  setSelectedItems: (itemsOrFn) =>
    set((state) => ({
      selectedItems:
        typeof itemsOrFn === 'function'
          ? (itemsOrFn as (prev: any[]) => any[])(state.selectedItems)
          : itemsOrFn,
    })),
  toggleSelectedItem: (slNo) => {
    const { selectedItems } = get();
    const updated = selectedItems.includes(slNo)
      ? selectedItems.filter((item) => item !== slNo)
      : [...selectedItems, slNo];
    set({ selectedItems: updated });
  },
}));

export { useBomStore };
