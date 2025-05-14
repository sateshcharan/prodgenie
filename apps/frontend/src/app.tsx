import { createBrowserRouter } from 'react-router-dom';

import { publicRoutes, privateRoutes } from './routes';

const router: any = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
  {
    path: '*',
    element: <>404</>,
  },
]);

export default router;
