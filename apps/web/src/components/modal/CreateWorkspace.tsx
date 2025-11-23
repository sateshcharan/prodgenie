import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@prodgenie/libs/ui/card';
import { Button } from '@prodgenie/libs/ui/button';
import { Input } from '@prodgenie/libs/ui/input';
import { apiRoutes } from '@prodgenie/libs/constant';

import api from '../../utils/api';
import PlanDropdown from '../PlanDropDown';

export default function CreateWorkspace() {
  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const createWorkspace = async () => {
    if (!workspaceName.trim() || !selectedPlanId) return;

    console.log('create workspace clicked');

    try {
      setLoading(true);
      const res = await api.post(
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
