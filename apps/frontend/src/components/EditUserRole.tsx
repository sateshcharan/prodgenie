import { useState } from 'react';

import { api } from '../utils';

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
} from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
import {
  useModalStore,
  useUserStore,
  useWorkspaceStore,
} from '@prodgenie/libs/store';
import { Button } from '@prodgenie/libs/ui/button';
import { WorkspaceRole } from '@prodgenie/libs/types';

export default function EditUserRole({
  workspaceUserId,
}: {
  workspaceUserId: string;
}) {
  const { closeModal } = useModalStore();
  const { user } = useUserStore((state) => state);
  const { activeWorkspace } = useWorkspaceStore((state) => state);

  const currentRole = user?.memberships.find(
    (m) => m.workspace.id === activeWorkspace?.id
  )?.role;

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<WorkspaceRole>(currentRole!);

  const updateUser = async () => {
    if (!role) return;

    try {
      setLoading(true);
      await api.patch(
        `${apiRoutes.workspace.base}${apiRoutes.workspace.updateUserRoleInWorkspace}`,
        { role, userId: workspaceUserId, workspaceId: activeWorkspace?.id }
      );
      // optionally refetch workspace members here
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
            {workspaceUserId}
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
            onValueChange={(val: WorkspaceRole) => setRole(val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(WorkspaceRole).map((roleOption) => (
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
