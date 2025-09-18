import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
  Button,
  Input,
} from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useModalStore, useWorkspaceStore } from '@prodgenie/libs/store';

import { api } from '../../utils';

export default function ReplacePassword() {
  const [loading, setLoading] = useState(false);

  const { closeModal } = useModalStore();
  const { activeWorkspace } = useWorkspaceStore((state) => state);

  const replacePassword = async (workspaceId: string) => {
    if (!workspaceId) return;

    try {
      setLoading(true);
      const { data } = await api.post(
        `${apiRoutes.workspace.base}/${apiRoutes.workspace.deleteCurrentWorkspace}`,
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
        <CardTitle className="text-2xl">Replace Password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Input type="password" placeholder="********" />
        <Button
          onClick={() => replacePassword(activeWorkspace.id)}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </CardContent>
    </Card>
  );
}
