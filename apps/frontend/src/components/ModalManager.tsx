import {
  Login,
  Signup,
  RemoveUserFromWorkspace,
  CreateWorkspace,
  DeleteWorkspace,
  EditUserRole,
  InviteUser,
  DeleteUser,
  ResetPassword,
  PricingCard,
  LeaveWorkspace,
  ReplacePassword,
  Auth,
  Modal,
  FileDropZone,
} from './';

import { authDialogImage } from '@prodgenie/libs/ui';
import { useModalStore } from '@prodgenie/libs/store';

const ModalManager = () => {
  const { modalType, modalProps, isOpen, closeModal } = useModalStore();

  if (!isOpen || !modalType) return null;

  switch (modalType) {
    case 'auth:login':
      return (
        <Modal title="Login" description="Login to your account">
          <Auth imageUrl={authDialogImage}>
            <Login />
          </Auth>
        </Modal>
      );

    case 'auth:signup':
      return (
        <Modal title="Sign up" description="Sign up to get started">
          <Auth imageUrl={authDialogImage}>
            <Signup />
          </Auth>
        </Modal>
      );

    case 'auth:resetPassword':
      return (
        <Modal title="Reset Password" description="Reset your password">
          <Auth imageUrl={authDialogImage}>
            <ResetPassword />
          </Auth>
        </Modal>
      );

    case 'workspace:create':
      return (
        <Modal
          title="Create New Workspace"
          description="Create a new workspace"
        >
          <CreateWorkspace />
        </Modal>
      );

    case 'workspace:delete':
      return (
        <Modal
          title="Delete current Workspace"
          description="Delete current workspace"
        >
          <DeleteWorkspace workspaceId={modalProps?.workspaceId} />
        </Modal>
      );

    case 'workspace:inviteUser':
      return (
        <Modal
          title="Add User to Workspace"
          description="Add user to workspace"
        >
          <InviteUser />
        </Modal>
      );

    case 'workspace:deleteUser':
      return (
        <Modal title="Delete My Account" description="Delete My Account">
          <DeleteUser />
        </Modal>
      );

    case 'workspace:editUserRole':
      return (
        <Modal
          title="Add User to Workspace"
          description="Add user to workspace"
        >
          <EditUserRole workspaceUserId={modalProps?.workspaceUserId} />
        </Modal>
      );

    case 'workspace:removeUserFromWorkspace':
      return (
        <Modal
          title="Delete User from Workspace"
          description="Delete a user from workspace"
        >
          <RemoveUserFromWorkspace
            workspaceUserId={modalProps?.workspaceUserId}
          />
        </Modal>
      );

    case 'workspace:leaveWorkspace':
      return (
        <Modal
          title="Leave Workspace"
          description="Are you sure you want to leave this workspace?"
        >
          <LeaveWorkspace />
        </Modal>
      );

    case 'workspace:pricing':
      return (
        <Modal title="Pricing Details" description="Pricing Section Modal">
          <PricingCard variant="modal" />
        </Modal>
      );

    case 'workspace:replacePassword':
      return (
        <Modal title="Replace Password" description="Replace your password">
          <ReplacePassword />
        </Modal>
      );

    case 'workspace:fileUpload':
      return (
        <Modal title={modalProps?.title} description={modalProps?.description}>
          <FileDropZone
            title={modalProps?.title}
            description={modalProps?.description}
            submitUrl={modalProps?.submitUrl}
            onUploadSuccess={modalProps?.onUploadSuccess}
          />
        </Modal>
      );

    case 'workspace:editThumbnail':
      return (
        <Modal title={modalProps?.title} description={modalProps?.description}>
          <FileDropZone
            title={modalProps?.title}
            description={modalProps?.description}
            submitUrl={modalProps?.submitUrl}
            onUploadSuccess={modalProps?.onUploadSuccess}
            multiple={false}
          />
        </Modal>
      );

    default:
      return null;
  }
};

export default ModalManager;
