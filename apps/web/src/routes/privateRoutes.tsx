import { RouteObject } from 'react-router-dom';

import { settingsLoader } from '../loaders/settingsLoader';
import { fileDatasLoader } from '../loaders/filesDataLoader';
import { fileBuilderLoader } from '../loaders/fileBuilderLoader';
import { fileDetailsLoader } from '../loaders/fileDetailsLoader';

import Files from '../components/Files';
import FileDetails from '../components/FileDetails';
import FileBuilder from '../components/FileBuilder';
import Settings from '../components/settings/Settings';
import UserNotifications from '../components/UserNotifications';
import FormulaBuilder from '../components/sequence/FormulaBuilder';

import Dashboard from '../pages/Dashboard';

import PrivateRoute from './PrivateRoute';
import PrivateLayout from '../layouts/PrivateLayout';
import PaymentResult from '../components/PaymentResult';
import QRPayment from '../pages/QRPayment';
import EventDetailsPage from '../pages/EventDetail';

export const privateRoutes = [
  { path: 'phonepe/result', element: <PaymentResult /> },

  {
    path: 'dashboard',
    element: (
      // <PrivateRoute>
      <PrivateLayout />
      // </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // { path: 'events/:eventId', element: <EventDetailsPage /> },
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
      // {
      //   path: 'notifications',
      //   element: <UserNotifications />,
      // },
      {
        path: 'qr-payment/:credits/:purpose',
        element: <QRPayment />,
      },
    ],
  },
];
