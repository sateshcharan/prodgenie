import { RouteObject } from 'react-router-dom';
import { fileDetailsLoader } from '../loaders/fileDetailsLoader';
import { fileDatasLoader } from '../loaders/filesDataLoader';
import { Files, FileDetails } from '../components';
import { Dashboard } from '../pages';

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

export default dashboardRoutes;
