import { createBrowserRouter } from 'react-router-dom';

import ErrorPage from './pages/ErrorPage';

import PublicLayout from './layouts/PublicLayout';

import { publicRoutes } from './routes/publicRoutes';
import { privateRoutes } from './routes/privateRoutes';

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
