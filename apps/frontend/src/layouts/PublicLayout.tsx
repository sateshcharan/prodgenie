import { Outlet } from 'react-router-dom';

import Auth from '../components/Auth';
import Modal from '../components/Modal';
import { Login, Signup } from '../components';
import { PublicHeader, PublicFooter } from '../navigation';

import { useAuthStore } from '@prodgenie/libs/store';
import { authDialogImage } from '@prodgenie/libs/ui';

const PublicLayout = () => {
  const { authType } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <Outlet />
      <PublicFooter />

      <Modal
        title={authType === 'login' ? 'Login' : 'Sign up'}
        description={
          authType === 'login'
            ? 'login to your account'
            : 'Sign up to get started'
        }
      >
        <Auth imageUrl={authDialogImage}>
          {authType === 'login' ? <Login /> : <Signup />}
        </Auth>
      </Modal>
    </div>
  );
};

export default PublicLayout;
