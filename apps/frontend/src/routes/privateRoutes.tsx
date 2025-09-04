import { RouteObject } from 'react-router-dom';

import {
  Files,
  FileDetails,
  FileBuilder,
  FormulaBuilder,
  Settings,
} from '../components';
import {
  fileDetailsLoader,
  fileDatasLoader,
  fileBuilderLoader,
  settingsLoader,
} from '../loaders';
import { Dashboard } from '../pages';
import { PrivateLayout } from '../layouts';
import PrivateRoute from './PrivateRoute';

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
