import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@prodgenie/libs/ui';
import {
  useModalStore,
  useUserStore,
  useWorkspaceStore,
} from '@prodgenie/libs/store';
import { apiRoutes } from '@prodgenie/libs/constant';

import { api } from '../utils';
import { PlanDropdown } from './PlanDropdown';

export default function RemoveUserFromWorkspace({
  workspaceUserId,
}: {
  workspaceUserId: string;
}) {
  const [loading, setLoading] = useState(false);
  // const [workspaceName, setWorkspaceName] = useState('');
  // const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const { closeModal } = useModalStore();
  const { activeWorkspace } = useWorkspaceStore((state) => state);
  const { user } = useUserStore((state) => state);

  const deleteWorkspaceUser = async (userId: string) => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data } = await api.post(
        `${apiRoutes.workspace.base}${apiRoutes.workspace.removeUserFromWorkspace}`,
        {
          workspaceId: activeWorkspace.id,
          userId: workspaceUserId,
        }
      );
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Remove user from workspace</CardTitle>
        <CardDescription>
          Are you sure you want to remove this user from the workspace? This
          action cannot be undone. The user will no longer have access to this
          workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Button
          onClick={() => deleteWorkspaceUser(user.id)}
          disabled={loading}
          variant={'destructive'}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
