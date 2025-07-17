import { RouteObject } from 'react-router-dom';

import { Dashboard } from '../pages';
import { PrivateLayout } from '../layouts';
import PrivateRoute from './PrivateRoute';
import { Files, FileDetails, FileBuilder, FormulaBuilder } from '../components';
import {
  fileDetailsLoader,
  fileDatasLoader,
  fileBuilderLoader,
} from '../loaders';

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
  {
    path: ':fileType/builder',
    element: <FileBuilder />,
    loader: fileBuilderLoader,
  },
];

export const privateRoutes = [
  {
    path: 'dashboard',
    element: (
      <PrivateRoute>
        <PrivateLayout />
      </PrivateRoute>
    ),
    children: dashboardRoutes,
  },
];
