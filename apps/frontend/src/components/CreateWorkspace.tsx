import { useState } from 'react';

import { Input } from '@prodgenie/libs/ui/input';
import { Button } from '@prodgenie/libs/ui/button';
import { apiRoutes } from '@prodgenie/libs/constant';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@prodgenie/libs/ui';

import { api } from '../utils';
import { PlanDropdown } from './PlanDropdown';

export default function CreateWorkspace() {
  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const createWorkspace = async () => {
    if (!workspaceName.trim() || !selectedPlanId) return;

    try {
      setLoading(true);
      const { data } = await api.post(
        `${apiRoutes.workspace.base}${apiRoutes.workspace.createWorkspace}`,
        {
          workspaceName,
          planId: selectedPlanId,
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create a new workspace</CardTitle>
        <CardDescription>
          Give your workspace a name and select a plan to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Input
          placeholder="Workspace name"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
        />
        <PlanDropdown handleSelectedPlan={setSelectedPlanId} />
        <Button onClick={createWorkspace} disabled={loading}>
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </CardContent>
    </Card>
  );
}
