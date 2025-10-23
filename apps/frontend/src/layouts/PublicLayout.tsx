import { Outlet } from 'react-router-dom';

import { ModalManager } from '../components';
import { PublicHeader, PublicFooter } from '../navigation';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <Outlet />
      <PublicFooter />

      {/* public modals render here */}
      <ModalManager />
    </div>
  );
};

export default PublicLayout;
