import { createBrowserRouter, RouteObject } from 'react-router-dom';

import { PublicLayout, DashLayout } from './layouts';
import { Home, Dashboard } from './pages';
import { Login, Signup, Files, FileDetails } from './components';

import { PrivateRoute } from './routes';
import { fileDetailsLoader } from './loaders/fileDetailsLoader';
import { fileDatasLoader } from './loaders/filesDataLoader';

const dashboardRoutes: RouteObject[] = [
  {
    index: true,
    element: <Dashboard />,
  },
  {
    path: ':fileType',
    element: <Files />,
    loader: fileDatasLoader,
  },
  {
    path: ':fileType/:fileId',
    element: <FileDetails />,
    loader: fileDetailsLoader,
  },
];

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
