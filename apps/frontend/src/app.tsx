import { createBrowserRouter } from 'react-router-dom';

import { PublicLayout, DashLayout } from './layouts';
import { Home } from './pages';
import { Login, Signup } from './components';

import { PrivateRoute, dashboardRoutes } from './routes';

const router: any = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
    ],
  },
  {
    path: 'dashboard',
    element: (
      <PrivateRoute>
        <DashLayout />
      </PrivateRoute>
    ),
    children: dashboardRoutes,
  },
  {
    path: '*',
    element: <>404</>,
  },
]);

export default router;
