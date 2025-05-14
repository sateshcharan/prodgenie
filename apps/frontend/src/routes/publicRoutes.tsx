import { PublicLayout } from '../layouts';
import { Home } from '../pages';

export const publicRoutes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [{ index: true, element: <Home /> }],
  },
];
