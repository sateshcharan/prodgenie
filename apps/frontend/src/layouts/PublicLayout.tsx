import { Outlet } from 'react-router-dom';
import { PublicHeader, PublicFooter } from '../navigation';
import { Login, Signup } from '../components';

import { useAuthModalStore } from '@prodgenie/libs/store';
import { AuthDialog } from '../components/auth/authDialog';

import authImage from '@prodgenie/libs/ui/assets/authDialogImage.webp';

const PublicLayout = () => {
  const { modalType, closeModal } = useAuthModalStore();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-grow ">
        <Outlet />
      </main>
      <PublicFooter />

      <AuthDialog
        open={modalType === 'login' || modalType === 'signup'}
        onOpenChange={closeModal}
        imageUrl={authImage}
        modalType={modalType === 'login' ? 'login' : 'signup'}
      >
        {modalType === 'login' ? <Login /> : <Signup />}
      </AuthDialog>
    </div>
  );
};

export default PublicLayout;
