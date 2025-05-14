// routes/privateRoutes.ts
import { RouteObject } from 'react-router-dom';

import { DashLayout } from '../layouts';
import { fileDetailsLoader, fileDatasLoader } from '../loaders';
import { Files, FileDetails } from '../components';
import { Dashboard } from '../pages';

import PrivateRoute from './PrivateRoute';

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

export const privateRoutes = [
  {
    path: 'dashboard',
    element: (
      <PrivateRoute>
        <DashLayout />
      </PrivateRoute>
    ),
    children: dashboardRoutes,
  },
];
