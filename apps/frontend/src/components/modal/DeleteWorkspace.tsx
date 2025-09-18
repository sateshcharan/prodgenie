import { useState } from 'react';

import { api } from '../../utils';

import { Button } from '@prodgenie/libs/ui/button';
import { apiRoutes } from '@prodgenie/libs/constant';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
} from '@prodgenie/libs/ui';
import { useModalStore, useWorkspaceStore } from '@prodgenie/libs/store';

export default function DeleteWorkspace({
  workspaceId,
}: {
  workspaceId: string;
}) {
  console.log(workspaceId);

  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const { closeModal } = useModalStore();
  const { activeWorkspace } = useWorkspaceStore((state) => state);

  const deleteWorkspace = async () => {
    if (!workspaceId) return;

    try {
      setLoading(true);
      const { data } = await api.post(
        `${apiRoutes.workspace.base}/${apiRoutes.workspace.deleteWorkspace}`,
        {
          workspaceId,
        }
      );
    } catch (err: any) {
      if (
        err.response?.status === 403 &&
        err.response?.data?.action === 'CONTACT_OWNER'
      ) {
        toast.error(err.response.data.message);
      } else {
        console.error(err);
        alert('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Delete workspace</CardTitle>
        <CardDescription>
          Are you sure you want to delete this workspace? This action cannot be
          undone. This will permanently delete the workspace and all of its
          data.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Button
          onClick={deleteWorkspace}
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
