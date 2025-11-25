import { useState } from 'react';

import api from '../../utils/api';

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@prodgenie/libs/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@prodgenie/libs/ui/card';
import { apiRoutes } from '@prodgenie/libs/constant';
import {
  useModalStore,
  useUserStore,
  useWorkspaceStore,
} from '@prodgenie/libs/store';
import { Button } from '@prodgenie/libs/ui/button';
import { workspaceRole } from '@prodgenie/libs/types';

export default function EditUserRole({
  workspaceUserId,
}: {
  workspaceUserId: string;
}) {
  const { closeModal } = useModalStore();
  const { user } = useUserStore((state) => state);
  const { activeWorkspace, workspaceUsers, fetchWorkspaceUsers } =
    useWorkspaceStore((state) => state);

  const currentRole = user?.memberships.find(
    (m) => m.workspace.id === activeWorkspace?.id
  )?.role;

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<workspaceRole>(currentRole!);

  const workspaceUserName = workspaceUsers.find(
    (w) => w?.user?.id === workspaceUserId
  )?.user?.name;

  const updateUser = async () => {
    if (!role) return;

    try {
      setLoading(true);
      await api.patch(
        `${apiRoutes.workspace.base}${apiRoutes.workspace.updateUserRoleInWorkspace}`,
        { role, userId: workspaceUserId, workspaceId: activeWorkspace?.id }
      );

      await fetchWorkspaceUsers(activeWorkspace?.id); // fetch updated workspace users

      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-2">
          <CardTitle className="text-2xl ">Edit User</CardTitle>
          <CardTitle className="text-2xl text-muted-foreground">
            {workspaceUserName}
          </CardTitle>
        </div>
        <CardDescription>
          Change the role of this user in the workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Role</label>
          <Select
            value={role}
            onValueChange={(val: workspaceRole) => setRole(val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(workspaceRole).map((roleOption) => (
                <SelectItem key={roleOption} value={roleOption}>
                  {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4">
          <Button onClick={updateUser} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
