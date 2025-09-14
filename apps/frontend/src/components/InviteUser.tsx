import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
} from '@prodgenie/libs/ui';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@prodgenie/libs/ui/select';
import { useModalStore, useWorkspaceStore } from '@prodgenie/libs/store';
import { Input } from '@prodgenie/libs/ui/input';
import { Button } from '@prodgenie/libs/ui/button';
import { apiRoutes } from '@prodgenie/libs/constant';
import { WorkspaceRole } from '@prodgenie/libs/types';

import { api } from '../utils';

export default function InviteUser() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const { closeModal } = useModalStore();
  const { activeWorkspace, fetchWorkspaceUsers } = useWorkspaceStore(
    (state) => state
  );

  const workspaceId = activeWorkspace?.id;

  const inviteUser = async () => {
    if (!email.trim() || !role) return;

    try {
      setLoading(true);
      await api.post(
        `${apiRoutes.workspace.base}${apiRoutes.workspace.inviteUserToWorkspace}`,
        {
          workspaceId,
          email,
          role,
        }
      );

      await fetchWorkspaceUsers(activeWorkspace?.id); // fetch updated workspace users

      closeModal();
      toast.success('User invited successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Invite User</CardTitle>
        <CardDescription>
          Invite a new member to your workspace. They will receive an email to
          join.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Role</label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(WorkspaceRole).map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Button onClick={inviteUser} disabled={loading}>
            {loading ? 'Sending...' : 'Send Invite'}
          </Button>
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
