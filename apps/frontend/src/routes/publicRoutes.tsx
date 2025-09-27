import { Home, Pricing } from '../pages';
import { PublicLayout } from '../layouts';

export const publicRoutes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'pricing', element: <Pricing /> },
    ],
  },
];
