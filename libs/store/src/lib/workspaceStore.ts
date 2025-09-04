import { create } from 'zustand';

// import { apiRoutes } from '@prodgenie/libs/constant';
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
  activeWorkspace: Workspace | null;
  workspaceUsers: User[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setWorkspaceUsers: (users: User[]) => void;
  // fetchWorkspaceUsers: (workspaceId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  workspaceUsers: [],
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
  setWorkspaceUsers: (workspaceUsers) => set({ workspaceUsers }),
  // fetchWorkspaceUsers: async (workspaceId) => {
  //   try {
  //     const { data } = await api.get(
  //       `${apiRoutes.workspace.base}${apiRoutes.workspace.getWorkspaceUsers}`,
  //       { params: { workspaceId } }
  //     );
  //     setWorkspaceUsers({ workspaceUsers: data.users });
  //   } catch (err) {
  //     console.error(err);
  //     setWorkspaceUsers({ workspaceUsers: [] });
  //   }
  // },
}));
