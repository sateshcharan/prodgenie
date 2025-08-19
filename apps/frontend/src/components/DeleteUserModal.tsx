import { useState } from 'react';

import { api } from '../utils';
import { PlanDropdown } from './PlanDropdown';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@prodgenie/libs/ui/dialog';
import {
  useWorkspaceStore,
  useWorkspaceModalStore,
} from '@prodgenie/libs/store';
import { Input } from '@prodgenie/libs/ui/input';
import { Button } from '@prodgenie/libs/ui/button';
import { apiRoutes } from '@prodgenie/libs/constant';

export function DeleteUserModal() {
  const { setActiveWorkspace } = useWorkspaceStore((state) => state);
  const { modalType, closeModal } = useWorkspaceModalStore((state) => state);

  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const createWorkspace = async () => {
    if (!workspaceName.trim() || !selectedPlanId) return;

    try {
      setLoading(true);
      const { data } = await api.post(
        `${apiRoutes.workspace.base}/${apiRoutes.workspace.createNewWorkspace}`,
        {
          workspaceName,
          planId: selectedPlanId,
        }
      );
      console.log(data);
      // setActiveWorkspace(data);
      // setWorkspaceName('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={modalType} onOpenChange={closeModal}>
      <DialogOverlay className="fixed inset-0 bg-black/10 backdrop-blur-md z-50" />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Workspace name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
          <PlanDropdown handleSelectedPlan={setSelectedPlanId} />
          <Button onClick={createWorkspace} disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
