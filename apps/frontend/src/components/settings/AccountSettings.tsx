import { useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  toast,
} from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useModalStore, useUserStore } from '@prodgenie/libs/store';

import { api } from '../../utils';
import { EditableField } from '../EditableField';

const AccountSettings = () => {
  const { user } = useUserStore();

  // Keep original values + edited values
  const [originalValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [editedValues, setEditedValues] = useState(originalValues);

  const hasChanges =
    editedValues.name !== originalValues.name ||
    editedValues.email !== originalValues.email;

  const { openModal } = useModalStore();

  const handleResetPassword = () => {
    openModal('workspace:replacePassword');
  };

  const handleUserDelete = () => {
    openModal('workspace:deleteUser');
  };

  const handleUpdateUserProfile = (data: any) => {
    try {
      const response = api.patch(
        `${apiRoutes.users.base}${apiRoutes.users.updateProfile}`,
        {
          data: data,
        }
      );
      toast.success('User profile updated successfully!');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and security preferences
        </p>
      </div>

      {/* Profile Info */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EditableField
            label="Full Name"
            value={user?.name || ''}
            type="name"
            onChange={(val: string) =>
              setEditedValues((prev) => ({ ...prev, name: val }))
            }
            onSave={handleUpdateUserProfile}
          />
          <EditableField
            label="Email"
            value={user?.email || ''}
            type="email"
            onChange={(val: string) =>
              setEditedValues((prev) => ({ ...prev, email: val }))
            }
            onSave={handleUpdateUserProfile}
          />
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <div className="flex gap-4">
              <Input type="password" placeholder="********" />
              <Button variant="outline" onClick={handleResetPassword}>
                Reset Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="rounded-2xl border border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently remove your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" onClick={handleUserDelete}>
              Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
