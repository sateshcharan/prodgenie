import { useEffect, useState } from 'react';
import { api } from '../../utils';

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
import {
  useWorkspaceStore,
  useWorkspaceModalStore,
} from '@prodgenie/libs/store';
import { PlanDropdown } from '../PlanDropdown';

export function WorkspaceSettings() {
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const { openModal } = useWorkspaceModalStore();

  const [workspaceName, setWorkspaceName] = useState(
    activeWorkspace?.name ?? ''
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    activeWorkspace?.planId ?? null
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (activeWorkspace) {
      setWorkspaceName(activeWorkspace.name ?? '');
      setSelectedPlanId(activeWorkspace.planId ?? null);
    }
  }, [activeWorkspace]);

  const handleSave = async () => {
    if (!workspaceName.trim() || !selectedPlanId) return;

    try {
      setLoading(true);
      setSuccess(null);

      const { data } = await api.put(
        `${apiRoutes.workspace.base}/${apiRoutes.workspace.updateWorkspace}`,
        {
          workspaceId: activeWorkspace.id,
          name: workspaceName,
          planId: selectedPlanId,
        }
      );

      setActiveWorkspace(data);
      setSuccess('Workspace updated successfully');
    } catch (err) {
      console.error(err);
      setSuccess('Failed to update workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Workspace Info */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Plan
            </label>
            <PlanDropdown
              handleSelectedPlan={setSelectedPlanId}
              defaultPlanId={selectedPlanId}
            />
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
            Deleting this workspace is irreversible. All associated projects,
            files, and members will be permanently removed.
          </p>
          <Button
            variant="destructive"
            onClick={() => openModal('deleteWorkspace')}
          >
            Delete Workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
