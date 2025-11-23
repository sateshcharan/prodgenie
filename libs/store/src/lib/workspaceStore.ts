import axios from 'axios';
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

import { apiRoutes } from '@prodgenie/libs/constant';
// import { api } from '@prodgenie/libs/frontend-services';

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
  initRealtime: (workspaceId: string) => void;
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
        `${apiRoutes.workspace.base}${apiRoutes.workspace.getWorkspaceUsers}`,
        { params: { workspaceId } }
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
        `${apiRoutes.workspace.base}${apiRoutes.workspace.getWorkspaceEvents}`,
        { params: { workspaceId } }
      );
      set({ workspaceEvents: data.data });
    } catch (err) {
      console.error(err);
      set({ workspaceEvents: [] });
    }
  },

  // Initialize realtime channel for a workspace
  initRealtime: (workspaceId: string) => {
    // Unsubscribe previous channel (important!)
    const prevChannel = get().realtimeChannel;
    if (prevChannel) {
      supabaseAnon.removeChannel(prevChannel);
    }

    // Create new realtime channel
    const channel = supabaseAnon
      .channel(`events:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Event',
          // filter: `workspaceId=eq.${workspaceId}`,
        },
        async (_payload) => {
          // Re-fetch workspace events from backend
          // await get().fetchWorkspaceEvents(workspaceId);
        }
      )
      .subscribe();

    // Save reference to the channel
    set({ realtimeChannel: channel });

    // Initial load
    // get().fetchWorkspaceEvents(workspaceId);
  },
}));
