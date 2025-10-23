export const apiRoutes = {
  auth: {
    base: '/api/auth',
    signup: {
      email: '/signup/email',
    },
    login: {
      email: '/login/email',
    },
    continueWithProvider: (provider: string) =>
      `/continueWithProvider/${provider}`,
    logout: '/logout',
    resetPassword: '/resetPassword',
  },

  users: {
    base: '/api/users',
    create: '/createUser',
    delete: '/deleteUser',
    getProfile: '/getProfile',
    updateProfile: '/updateProfile',
  },

  workspace: {
    base: '/api/workspace',
    createWorkspace: '/createWorkspace',
    deleteWorkspace: '/deleteWorkspace',
    inviteUserToWorkspace: '/inviteUserToWorkspace',
    removeUserFromWorkspace: '/removeUserFromWorkspace',
    getWorkspaceUsers: '/getWorkspaceUsers',
    getWorkspaceEvents: '/getWorkspaceEvents',
    // getWorkspaceTransactions: '/getWorkspaceTransactions',
    check: '/check',
    updateUserRoleInWorkspace: '/updateUserRoleInWorkspace',
    getWorkspaceConfig: (configName: string) =>
      `/getWorkspaceConfig/${configName}`,
    setWorkspaceConfig: (configName: string) =>
      `/setWorkspaceConfig/${configName}`,
    updateWorkspaceConfig: (configName: string) =>
      `/updateWorkspaceConfig/${configName}`,
  },

  files: {
    base: '/api/files',
    list: (fileType: string) => `/${fileType}/list`,
    upload: (fileType: string) => `/${fileType}/upload`,
    delete: (fileType: string, fileId: string) => `/${fileType}/${fileId}`,
    duplicate: (fileType: string) => `/${fileType}/duplicate`,
    getById: (fileId: string) => `/getById/${fileId}`,
    getByName: (fileName: string) => `/getByName/${fileName}`,
    getFileData: (fileId: string) => `/getFileData/${fileId}`,
    setFileData: (fileId: string) => `/setFileData/${fileId}`,
    updateFileData: (fileId: string) => `/updateFileData/${fileId}`,
    rename: (fileType: string) => `/${fileType}`,
    update: (fileId: string) => `/${fileId}/update`,
    replace: (fileType: string, fileId: string) =>
      `/${fileType}/${fileId}/replace`,
  },

  thumbnail: {
    base: '/api/thumbnail',
    get: (fileId: string) => `/get/${fileId}`,
    set: (fileId: string) => `/set/${fileId}`,
    update: (fileId: string) => `/update/${fileId}`,
  },

  pdf: {
    base: '/api/pdf',
    parse: '/parse',
  },

  jobCard: {
    base: '/api/jobCard',
    generate: '/generate',
    getNumber: '/getNumber',
  },

  sequence: {
    base: '/api/sequence',
    sync: '/sync',
    getJobCardDataFromSequence: (sequence: string) =>
      `/getJobCardDataFromSequence/${sequence}`,
  },

  payment: {
    base: '/api/payment',
    stripeSession: '/stripe/session',
  },

  projectWide: {
    base: '/api/projectWide',
    getPlans: '/getPlans',
  },

  sse: {
    base: '/api/sse',
    stream: '/stream',
  },
};
