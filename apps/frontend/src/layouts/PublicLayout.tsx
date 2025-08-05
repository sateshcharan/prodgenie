import { Outlet } from 'react-router-dom';

import { PublicHeader, PublicFooter } from '../navigation';
import { Login, Signup, AuthDialog } from '../components';

import { useAuthModalStore } from '@prodgenie/libs/store';
import { authDialogImage } from '@prodgenie/libs/ui';

const PublicLayout = () => {
  const { modalType, closeModal } = useAuthModalStore();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      {/* <main className="flex-grow "> */}
      <Outlet />
      {/* </main> */}
      <PublicFooter />

      <AuthDialog
        open={modalType === 'login' || modalType === 'signup'}
        onOpenChange={closeModal}
        imageUrl={authDialogImage}
        modalType={modalType === 'login' ? 'login' : 'signup'}
      >
        {modalType === 'login' ? <Login /> : <Signup />}
      </AuthDialog>
    </div>
  );
};

export default PublicLayout;
