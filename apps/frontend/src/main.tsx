import { StrictMode } from 'react';
import { RouterProvider } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@prodgenie/libs/ui';
import router from './app';
import GlobalLoader from './components/globalLoader';

import { Toaster } from 'sonner';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
      <GlobalLoader />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  </StrictMode>
);
