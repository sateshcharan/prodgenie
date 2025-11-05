import { createBrowserRouter } from 'react-router-dom';

import { ErrorPage } from './pages';
import { PublicLayout } from './layouts';
import { publicRoutes, privateRoutes } from './routes';

const router: any = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
  {
    path: '*',
    element: <PublicLayout />,
    children: [{ path: '*', element: <ErrorPage /> }],
  },
]);

export default router;
