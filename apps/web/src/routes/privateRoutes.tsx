import { RouteObject } from 'react-router-dom';

import { fileDetailsLoader } from '../loaders/fileDetailsLoader';
import { fileDatasLoader } from '../loaders/filesDataLoader';
import { fileBuilderLoader } from '../loaders/fileBuilderLoader';
import { settingsLoader } from '../loaders/settingsLoader';

import Files from '../components/Files';
import FileDetails from '../components/FileDetails';
import FileBuilder from '../components/FileBuilder';
import FormulaBuilder from '../components/sequence/FormulaBuilder';
import Settings from '../components/settings/Settings';
import UserNotifications from '../components/UserNotifications';

import Dashboard from '../pages/Dashboard';

import PrivateRoute from './PrivateRoute';
import PrivateLayout from '../layouts/PrivateLayout';

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
