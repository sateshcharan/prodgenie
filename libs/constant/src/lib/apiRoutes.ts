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
    rename: (fileType: string) => `/${fileType}`,
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

  payment: {
    base: '/api/payment',
    stripeSession: '/stripe/session',
    upiOrder: '/upi/order',
  },

  orgs: {
    base: '/api/orgs',
    check: '/check',
    getOrgUsers: '/getOrgUsers',
    getOrgHistory: '/getOrgHistory',
  },
};
