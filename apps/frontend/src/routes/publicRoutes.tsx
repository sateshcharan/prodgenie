import { PublicLayout } from '../layouts';
import { Home, Pricing } from '../pages';
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
