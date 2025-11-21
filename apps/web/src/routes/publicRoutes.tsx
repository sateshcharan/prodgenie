import Home from '../pages/Home';
import Pricing from '../pages/Pricing';
import Contact from '../pages/Contact';
import PrivacyPolicy from '../pages/policySections/PrivacyPolicy';
import RefundsCancellation from '../pages/policySections/RefundsCancellation';
import TermsConditions from '../pages/policySections/TermsConditions';
import CookiePolicy from '../pages/policySections/CookiePolicy';

import PublicLayout from '../layouts/PublicLayout';
import PolicyLayout from '../layouts/PolicyLayout';

export const publicRoutes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'contact', element: <Contact /> },
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
    ],
  },
];
