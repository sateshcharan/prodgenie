import axios from 'axios';
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

import { apiRoutes } from '@prodgenie/libs/constant';

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
  workspaceUsage: any[];
  jobCardStats: any[];
  totalJobCards: number;
  realtimeChannel: any;

  setWorkspaces: (workspaces: Workspace[]) => void;
  setWorkspaceUsers: (users: User[]) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setActiveWorkspaceRole: (role: string | null) => void;
  setWorkspaceEvents: (events: any[]) => void;
  setJobCardStats: (stats: any[]) => void;
  setTotalJobCards: (total: number) => void;
  setWorkspaceUsage: (usage: any[]) => void;

  fetchWorkspaceUsers: (workspaceId: string) => Promise<void>;
  fetchWorkspaceEvents: (workspaceId: string) => Promise<void>;
  subscribeToEvents: (workspaceId: string) => void;

  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  workspaceUsers: [],
  activeWorkspace: null,
  activeWorkspaceRole: null,
  workspaceEvents: [],
  workspaceUsage: [],
  jobCardStats: [],
  totalJobCards: 0,
  realtimeChannel: null,

  setWorkspaces: (workspaces) => set({ workspaces }),
  setWorkspaceUsers: (workspaceUsers) => set({ workspaceUsers }),
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
  setActiveWorkspaceRole: (activeWorkspaceRole) => set({ activeWorkspaceRole }),
  setWorkspaceEvents: (workspaceEvents) => set({ workspaceEvents }),
  setJobCardStats: (jobCardStats) => set({ jobCardStats }),
  setTotalJobCards: (totalJobCards) => set({ totalJobCards }),
  setWorkspaceUsage: (workspaceUsage) => set({ workspaceUsage }),

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

  // Subscribe to realtime events
  subscribeToEvents: (workspaceId: string) => {
    const prevChannel = get().realtimeChannel;

    if (prevChannel) {
      supabaseAnon.removeChannel(prevChannel);
    }

    const channel = supabaseAnon
      .channel(`event:${workspaceId}`, { config: { private: true } })
      .on('broadcast', { event: '*' }, (payload) => {
        const newEvent = payload.payload?.record;
        const oldEvent = payload.payload?.old_record;
        const op = payload.payload?.operation;

        // console.log(payload);

        set((state) => {
          let updated = [...state.workspaceEvents];

          // --- DELETE MUST RUN EVEN IF newEvent IS NULL ---
          if (op === 'DELETE') {
            updated = updated.filter((e) => e.id !== oldEvent?.id);
            return {
              workspaceEvents: updated,
              totalJobCards: updated.filter(
                (e) =>
                  e.type === 'jobcard_generation' && e.status === 'completed'
              ).length,
            };
          }

          // --- INSERT OR UPDATE  ---
          if (op === 'INSERT') {
            updated.unshift(newEvent);
          } else if (op === 'UPDATE') {
            updated = updated.map((e) => (e.id === newEvent.id ? newEvent : e));
          }

          // --- Recompute jobcard count ---
          const totalJobCards = updated.filter(
            (e) => e.type === 'jobcard_generation' && e.status === 'completed'
          ).length;

          // --- UPDATE activeWorkspace.credits ---
          let activeWorkspace = state.activeWorkspace;

          if (
            activeWorkspace &&
            newEvent.workspaceId === activeWorkspace.id &&
            typeof newEvent.balanceAfter === 'number'
          ) {
            activeWorkspace = {
              ...activeWorkspace,
              credits: newEvent.balanceAfter,
            };
          }

          return {
            workspaceEvents: updated,
            totalJobCards,
            activeWorkspace,
          };
        });
      })
      .subscribe((status) => {
        // console.log('channel status', status);
      });

    set({ realtimeChannel: channel });
  },

  // Reset store
  reset: () => {
    const channel = get().realtimeChannel;
    if (channel) {
      supabaseAnon.removeChannel(channel);
    }

    set({
      workspaces: [],
      workspaceUsers: [],
      activeWorkspace: null,
      activeWorkspaceRole: null,
      workspaceEvents: [],
      workspaceUsage: [],
      jobCardStats: [],
      totalJobCards: 0,
      realtimeChannel: null,
    });
  },
}));
