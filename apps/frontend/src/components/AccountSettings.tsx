import { useEffect, useState } from 'react';
import { api } from '../utils';

import { Input } from '@prodgenie/libs/ui/input';
import { Button } from '@prodgenie/libs/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@prodgenie/libs/ui/card';
import { Separator } from '@prodgenie/libs/ui/separator';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useUserStore, useWorkspaceModalStore } from '@prodgenie/libs/store';

export function AccountSettings() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const { openModal } = useWorkspaceModalStore();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setSuccess(null);

      const { data } = await api.put(`${apiRoutes.users.base}/updateProfile`, {
        name,
        email,
      });

      setUser(data);
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error(err);
      setSuccess('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          {success && <p className="text-sm text-green-600">{success}</p>}
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Deleting your account is irreversible. All your data and workspaces
            will be permanently removed.
          </p>
          <Button
            variant="destructive"
            //   onClick={() => openModal('deleteUser')}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
