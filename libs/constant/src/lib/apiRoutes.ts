export const apiRoutes = {
  auth: {
    base: '/api/auth',
    signup: {
      owner: '/signup/owner',
      invite: '/signup/invite',
    },
    login: '/login',
    invite: {
      generate: '/invite/generate',
    },
  },

  files: {
    base: '/api/files',
    upload: (fileType: string) => `/${fileType}/upload`,
    list: (fileType: string) => `/${fileType}/list`,
    delete: (fileType: string, fileId: string) => `/${fileType}/${fileId}`,
    getById: (fileId: string) => `/getById/${fileId}`,
    getByName: (fileName: string) => `/getByName/${fileName}`,
    getFileData: (fileId: string) => `/getFileData/${fileId}`,
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

  users: {
    base: '/api/users',
    getProfile: (userId: string) => `/getProfile/${userId}`,
    create: '/createUser',
    update: (userId: string) => `/updateUser/${userId}`,
    list: (orgId: string) => `/listUsers/${orgId}`,
    delete: (userId: string) => `/deleteUser/${userId}`,
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
    upiOrder: '/upi/order',
  },

  workspace: {
    base: '/api/workspace',
    check: '/check',
    createNewWorkspace: '/createNewWorkspace',
    getWorkspaceUsers: '/getWorkspaceUsers',
    getWorkspaceHistory: '/getWorkspaceHistory',
    getWorkspaceConfig: (configName: string) =>
      `/getWorkspaceConfig/${configName}`,
  },

  projectWide: {
    base: '/api/projectWide',
    getPlans: '/getPlans',
  },
};
