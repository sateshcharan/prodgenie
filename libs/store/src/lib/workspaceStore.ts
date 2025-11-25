import axios from 'axios';
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

import { apiRoutes } from '@prodgenie/libs/constant';
// import { api } from '@prodgenie/apps/web/src/utils/api';

const supabaseAnon = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

type Plan = {
  id: string;
  name: string;
  maxMembers: number;
  maxWorkspacesPerUser: number;
  createdAt: Date;
} | null;

type Workspace = {
  id: string;
  name: string;
  credits: number;
  createdAt: Date;
  planId?: string;
  plan?: Plan;
};

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  avatar?: string;
  type: string;
};

interface WorkspaceStore {
  workspaces: Workspace[];
  workspaceUsers: User[];
  activeWorkspace: Workspace | null;
  activeWorkspaceRole: string | null;
  workspaceEvents: any[];
  realtimeChannel: any;

  setWorkspaces: (workspaces: Workspace[]) => void;
  setWorkspaceUsers: (users: User[]) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setActiveWorkspaceRole: (role: string | null) => void;
  setWorkspaceEvents: (events: any[]) => void;

  fetchWorkspaceUsers: (workspaceId: string) => Promise<void>;
  fetchWorkspaceEvents: (workspaceId: string) => Promise<void>;
  subscribeToEvents: (workspaceId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  workspaceUsers: [],
  activeWorkspace: null,
  activeWorkspaceRole: null,
  workspaceEvents: [],
  realtimeChannel: null,

  setWorkspaces: (workspaces) => set({ workspaces }),
  setWorkspaceUsers: (workspaceUsers) => set({ workspaceUsers }),
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
  setActiveWorkspaceRole: (activeWorkspaceRole) => set({ activeWorkspaceRole }),
  setWorkspaceEvents: (workspaceEvents) => set({ workspaceEvents }),

  // Fetch users via backend API
  fetchWorkspaceUsers: async (workspaceId) => {
    try {
      const { data } = await axios.get(
        `${process.env.VITE_API_URL}${apiRoutes.workspace.base}${apiRoutes.workspace.getWorkspaceUsers}`,
        { params: { workspaceId }, withCredentials: true }
      );
      set({ workspaceUsers: data.data });
    } catch (err) {
      console.error(err);
      set({ workspaceUsers: [] });
    }
  },

  // Fetch events via backend API
  fetchWorkspaceEvents: async (workspaceId) => {
    try {
      const { data } = await axios.get(
        `${process.env.VITE_API_URL}${apiRoutes.workspace.base}${apiRoutes.workspace.getWorkspaceEvents}`,
        { params: { workspaceId }, withCredentials: true }
      );
      set({ workspaceEvents: data.data });
    } catch (err) {
      console.error(err);
      set({ workspaceEvents: [] });
    }
  },

  // subscribe to realtime events
  subscribeToEvents: (workspaceId: string) => {
    const prevChannel = get().realtimeChannel;

    if (prevChannel) {
      supabaseAnon.removeChannel(prevChannel);
    }

    const channel = supabaseAnon
      .channel(`workspace:${workspaceId}:events`, {
        config: {
          private: true,
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event',
          // filter: `workspaceId=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('EVENT', payload);

          set((state) => {
            const { eventType, new: newRow, old: oldRow } = payload;

            // --- DELETE HANDLING ---
            if (eventType === 'DELETE' && oldRow?.id) {
              return {
                workspaceEvents: state.workspaceEvents.filter(
                  (e) => e.id !== oldRow.id
                ),
              };
            }

            // --- INSERT / UPDATE (but newRow can still be null) ---
            // if (!newRow?.id) return {};

            // const existingIndex = state.workspaceEvents.findIndex(
            //   (e) => e.id === newRow.id
            // );

            // UPDATE
            // if (existingIndex !== -1) {
            //   const updatedEvents = [...state.workspaceEvents];
            //   updatedEvents[existingIndex] = newRow;
            //   return { workspaceEvents: updatedEvents };
            // }

            // INSERT
            return { workspaceEvents: [newRow, ...state.workspaceEvents] };
          });
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },
}));
