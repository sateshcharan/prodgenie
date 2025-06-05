import { StrictMode } from 'react';
import { RouterProvider } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@prodgenie/libs/ui';

import router from './app';
import GlobalLoader from './components/globalLoader';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <GlobalLoader />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
