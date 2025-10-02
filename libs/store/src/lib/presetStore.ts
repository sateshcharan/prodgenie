import { create } from 'zustand';
import axios from 'axios';

import { apiRoutes } from '@prodgenie/libs/constant';

interface Preset {
  id: string;
  name: string;
  drawingId: string;
  values: any;
}

interface PresetStore {
  presets: Preset[];
  loading: boolean;
  fetchPresets: (drawingId: string) => Promise<void>;
  setPresets: (presets: Preset[]) => void;
  deletePreset: (presetId: string) => Promise<void>;
}

export const usePresetStore = create<PresetStore>((set, get) => ({
  presets: [],
  loading: false,

  fetchPresets: async (drawingId) => {
    set({ loading: true });
    try {
      const res = await axios.get(
        `${apiRoutes.workspace.base}/getWorkspaceConfig/preset.json`
      );
      const presets = res?.data?.data?.data ?? [];
      const filtered = presets.filter((p: any) => p.drawingId === drawingId);
      set({ presets: filtered });
    } catch (err) {
      console.error('Failed to fetch presets', err);
      set({ presets: [] });
    } finally {
      set({ loading: false });
    }
  },

  setPresets: (presets) => set({ presets }),

  deletePreset: async (presetId) => {
    const { presets } = get();
    const updated = presets.filter((p) => p.id !== presetId);
    await axios.patch(
      `${apiRoutes.workspace.base}/setWorkspaceConfig/preset.json`,
      updated
    );
    set({ presets: updated });
  },
}));
