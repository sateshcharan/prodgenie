import { Outlet } from 'react-router-dom';

import { useAuthStore } from '@prodgenie/libs/store';

import { PublicHeader, PublicFooter } from '../navigation';
import { Login, ModalManager, Signup } from '../components';

const PublicLayout = () => {
  const { authType } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <Outlet />
      <PublicFooter />

      <ModalManager />
    </div>
  );
};

export default PublicLayout;
