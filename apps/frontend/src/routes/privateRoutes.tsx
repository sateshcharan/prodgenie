import { RouteObject } from 'react-router-dom';

import {
  fileDetailsLoader,
  fileDatasLoader,
  fileBuilderLoader,
  settingsLoader,
} from '../loaders';
import {
  Files,
  FileDetails,
  FileBuilder,
  FormulaBuilder,
  Settings,
  UserNotifications,
} from '../components';
import { Dashboard } from '../pages';
import PrivateRoute from './PrivateRoute';
import { PrivateLayout } from '../layouts';

const PrivateRoutes: RouteObject[] = [
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
  {
    path: ':fileType/builder',
    element: <FileBuilder />,
    loader: fileBuilderLoader,
  },
  {
    path: 'settings/:tab',
    element: <Settings />,
    loader: settingsLoader,
  },
  {
    path: 'notifications',
    element: <UserNotifications />,
  },
];

export const privateRoutes = [
  {
    path: 'dashboard',
    element: (
      // <PrivateRoute>
      <PrivateLayout />
      // </PrivateRoute>
    ),
    children: PrivateRoutes,
  },
];
