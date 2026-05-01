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
  currentEvent: any;

  setWorkspaces: (workspaces: Workspace[]) => void;
  setWorkspaceUsers: (users: User[]) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setActiveWorkspaceRole: (role: string | null) => void;
  setWorkspaceEvents: (events: any[]) => void;
  setJobCardStats: (stats: any[]) => void;
  setTotalJobCards: (total: number) => void;
  setWorkspaceUsage: (usage: any[]) => void;
  setCurrentEvent: (event: any) => void;

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
  currentEvent: null,

  setWorkspaces: (workspaces) => set({ workspaces }),
  setWorkspaceUsers: (workspaceUsers) => set({ workspaceUsers }),
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
  setActiveWorkspaceRole: (activeWorkspaceRole) => set({ activeWorkspaceRole }),
  setWorkspaceEvents: (workspaceEvents) => set({ workspaceEvents }),
  setJobCardStats: (jobCardStats) => set({ jobCardStats }),
  setTotalJobCards: (totalJobCards) => set({ totalJobCards }),
  setWorkspaceUsage: (workspaceUsage) => set({ workspaceUsage }),
  setCurrentEvent: (currentEvent) => set({ currentEvent }),

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

  subscribeToEvents: async (workspaceId: string) => {
    const prevChannel = get().realtimeChannel;

    if (prevChannel) await supabaseAnon.removeChannel(prevChannel);

    const channel = supabaseAnon
      .channel(`event:${workspaceId}`, { config: { private: true } })
      .on('broadcast', { event: '*' }, (payload) => {
        const newEvent = payload.payload?.record;
        const oldEvent = payload.payload?.old_record;
        const op = payload.payload?.operation;

        // console.log(payload); // debug

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

          // recompute job card count
          const totalJobCards = updated.filter(
            (e) => e.type === 'jobcard_generation' && e.status === 'completed'
          ).length;

          // recompute workspace credits
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
        console.log('Realtime status:', status);

        // if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
        //   console.log('Reconnecting...');
        //   setTimeout(() => {
        //     get().subscribeToEvents(workspaceId);
        //   }, 1000);
        // }
      });

    set({ realtimeChannel: channel });
  },

  // subscribeToEvents: async (workspaceId: string) => {
  //   const currentChannel = get().realtimeChannel;

  //   // ✅ Prevent duplicate subscription
  //   if (currentChannel?.topic === `event:${workspaceId}`) {
  //     console.log('⚠️ Already subscribed to this workspace');
  //     return;
  //   }

  //   // ✅ Clean previous channel properly
  //   if (currentChannel) {
  //     console.log('🧹 Removing previous channel...');
  //     await supabaseAnon.removeChannel(currentChannel);
  //   }

  //   console.log('🚀 Subscribing to workspace:', workspaceId);

  //   const channel = supabaseAnon
  //     // .channel(`event:${workspaceId}`, { config: { private: true } })
  //     .channel(`event:${workspaceId}`)

  //     .on('broadcast', { event: '*' }, (payload) => {
  //       const newEvent = payload.payload?.record;
  //       const oldEvent = payload.payload?.old_record;
  //       const op = payload.payload?.operation;

  //       set((state) => {
  //         let updated = [...state.workspaceEvents];

  //         if (op === 'DELETE') {
  //           updated = updated.filter((e) => e.id !== oldEvent?.id);
  //         } else if (op === 'INSERT') {
  //           updated = [newEvent, ...updated];
  //         } else if (op === 'UPDATE') {
  //           updated = updated.map((e) => (e.id === newEvent.id ? newEvent : e));
  //         }

  //         const totalJobCards = updated.filter(
  //           (e) => e.type === 'jobcard_generation' && e.status === 'completed'
  //         ).length;

  //         let activeWorkspace = state.activeWorkspace;

  //         if (
  //           activeWorkspace &&
  //           newEvent?.workspaceId === activeWorkspace.id &&
  //           typeof newEvent?.balanceAfter === 'number'
  //         ) {
  //           activeWorkspace = {
  //             ...activeWorkspace,
  //             credits: newEvent.balanceAfter,
  //           };
  //         }

  //         return {
  //           workspaceEvents: updated,
  //           totalJobCards,
  //           activeWorkspace,
  //         };
  //       });
  //     })

  //     .subscribe((status) => {
  //       console.log('📶 Realtime status:', status);

  //       if (status === 'SUBSCRIBED') {
  //         console.log('✅ Successfully subscribed to realtime');
  //       }

  //       if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
  //         console.log('⚠️ Channel closed/error → reconnecting...');

  //         setTimeout(() => {
  //           get().subscribeToEvents(workspaceId);
  //         }, 1000);
  //       }
  //     });

  //   set({ realtimeChannel: channel });
  // },

  // Reset store
  reset: async () => {
    const channel = get().realtimeChannel;

    if (channel) {
      console.log('🧹 Cleaning up realtime channel...');
      await supabaseAnon.removeChannel(channel);
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
