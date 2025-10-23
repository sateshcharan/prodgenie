import {
  PrivacyPolicy,
  RefundsCancellation,
  TermsConditions,
  CookiePolicy,
} from '../pages/policySections';
import { Home, Pricing, Contact } from '../pages';
import { PublicLayout, PolicyLayout } from '../layouts';

export const publicRoutes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'pricing', element: <Pricing /> },
      {
        path: 'policy',
        element: <PolicyLayout />,
        children: [
          { index: true, element: <TermsConditions /> },
          { path: 'cookies', element: <CookiePolicy /> },
          { path: 'privacy', element: <PrivacyPolicy /> },
          { path: 'refunds', element: <RefundsCancellation /> },
        ],
      },

      { path: 'contact', element: <Contact /> },
    ],
  },
];
