import { Outlet } from 'react-router-dom';

import ModalManager from '../components/modal/ModalManager';
import PublicFooter from '../navigation/PublicFooter';
import PublicHeader from '../navigation/PublicHeader';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <Outlet />
      <PublicFooter />

      {/* all public modals render here */}
      <ModalManager />
    </div>
  );
};

export default PublicLayout;
