import { Outlet } from 'react-router-dom';

import { PublicHeader, PublicFooter } from '../navigation';
import { ModalManager } from '../components';

const PublicLayout = () => {
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
