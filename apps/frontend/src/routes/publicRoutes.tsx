import MaterialForm from '../components/MaterialForm';
import HeaderForm from '../components/HeaderForm';
import Render from '../components/Render';

import { PublicLayout } from '../layouts';
import { Home, Pricing } from '../pages';
export const publicRoutes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'material', element: <MaterialForm /> },
      { path: 'header', element: <HeaderForm /> },
      { path: 'render', element: <Render /> },
    ],
  },
];
