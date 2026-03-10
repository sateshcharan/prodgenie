import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@prodgenie/libs/ui/card';
import { Button } from '@prodgenie/libs/ui/button';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useModalStore, useWorkspaceStore } from '@prodgenie/libs/store';

import api from '../../utils/api';

export default function DeleteAccount({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const { closeModal } = useModalStore();
  const { activeWorkspace } = useWorkspaceStore((state) => state);

  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const { data } = await api.post(
        `${apiRoutes.workspace.base}${apiRoutes.workspace.deleteAccount}`
        // {
        //   workspaceId,
        // }
      );

      toast.success('Account deleted successfully!');
      navigate('/');
    } catch (err: any) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Delete Account & All Workspaces</CardTitle>
        <CardDescription>
          Are you sure you want to delete your account? This action cannot be
          undone. This will permanently delete all of your data. If you choose
          to confirm this action, you will be logged out of your account after
          the deletion.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex gap-4">
        <Button
          onClick={handleDeleteAccount}
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
