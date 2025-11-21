import axios from 'axios';
import { create } from 'zustand';

import { apiRoutes } from '@prodgenie/libs/constant';
// import { api } from '@prodgenie/libs/frontend-services';

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

  setWorkspaces: (workspaces: Workspace[]) => void;
  setWorkspaceUsers: (users: User[]) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setActiveWorkspaceRole: (role: string | null) => void;
  setWorkspaceEvents: (events: any[]) => void;

  fetchWorkspaceUsers: (workspaceId: string) => Promise<void>;
  fetchWorkspaceEvents: (workspaceId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  workspaceUsers: [],
  activeWorkspace: null,
  activeWorkspaceRole: null,
  workspaceEvents: [],

  setWorkspaces: (workspaces) => set({ workspaces }),
  setWorkspaceUsers: (workspaceUsers) => set({ workspaceUsers }),
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
  setActiveWorkspaceRole: (activeWorkspaceRole) => set({ activeWorkspaceRole }),
  setWorkspaceEvents: (workspaceEvents) => set({ workspaceEvents }),

  fetchWorkspaceUsers: async (workspaceId: string) => {
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
  fetchWorkspaceEvents: async (workspaceId: string) => {
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
}));
