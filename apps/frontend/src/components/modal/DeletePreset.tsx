import { useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
} from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useModalStore } from '@prodgenie/libs/store';

import { api } from '../../utils';

export default function DeletePreset({
  presetId,
  presets,
  onDeleteSuccess,
}: {
  presetId: string;
  presets: any[];
  onDeleteSuccess: (updatedPresets: any[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const { closeModal } = useModalStore();

  const deletePreset = async () => {
    if (!presetId) return;
    try {
      setLoading(true);
      const updatedPresets = presets.filter((p) => p.id !== presetId);

      await api.patch(
        `${apiRoutes.workspace.base}/setWorkspaceConfig/preset.json`,
        updatedPresets
      );

      // ✅ tell parent that presets have changed
      if (onDeleteSuccess) {
        onDeleteSuccess(updatedPresets);
      }

      closeModal();
      // return updatedPresets;
    } catch (err: any) {
      if (
        err.response?.status === 403 &&
        err.response?.data?.action === 'CONTACT_OWNER'
      ) {
        toast.error(err.response.data.message);
      } else {
        console.error('Failed to delete preset', err);
        alert('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Delete Preset</CardTitle>
        <CardDescription>
          Are you sure you want to delete this Preset? This action cannot be
          undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Button
          onClick={deletePreset}
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
