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
import {
  useModalStore,
  useWorkspaceStore,
  useBomStore,
} from '@prodgenie/libs/store';

import api from '../../utils/api';
import { withCreditDeduction } from '../../utils/credits';

export default function AiFill({
  fileId,
  signedUrl,
}: {
  fileId: string;
  signedUrl: string;
}) {
  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const { closeModal } = useModalStore();
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore(
    (state) => state
  );
  const { setBom, setTitleBlock, setPrintingDetails } = useBomStore(
    (state) => state
  );

  const navigate = useNavigate();

  const handleAiFill = async (fileId: string) => {
    const credit_cost = 10;
    const previousCredits = activeWorkspace?.credits || 0;

    try {
      setLoading(true);

      // ⚡ Optimistic update
      if (activeWorkspace) {
        setActiveWorkspace({
          ...activeWorkspace,
          credits: previousCredits - credit_cost,
        });
      }

      const response = await api.post(
        `${apiRoutes.jobCard.base}${apiRoutes.jobCard.aiFill}`,
        { fileId, signedUrl }
      );

      const filledData = response.data.data;

      // ✅ Update Zustand store
      setBom(filledData.bom);
      setTitleBlock(filledData.titleBlock);
      setPrintingDetails(filledData.printingDetails);

      toast.success('Job Card data updated successfully!');
    } catch (err: any) {
      // 🔁 Rollback credits on failure
      if (activeWorkspace) {
        setActiveWorkspace({
          ...activeWorkspace,
          credits: previousCredits,
        });
      }

      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  // const handleAiFill = async (fileId: string) => {
  //   const { activeWorkspace, setActiveWorkspace } =
  //     useWorkspaceStore.getState();

  //   try {
  //     setLoading(true);

  //     await withCreditDeduction({
  //       workspace: activeWorkspace,
  //       setWorkspace: setActiveWorkspace,
  //       cost: 10,

  //       action: async () => {
  //         return api.post(
  //           `${apiRoutes.jobCard.base}${apiRoutes.jobCard.aiFill}`,
  //           { fileId, signedUrl }
  //         );
  //       },

  //       onSuccess: (response) => {
  //         const filledData = response.data.data;

  //         setBom(filledData.bom);
  //         setTitleBlock(filledData.titleBlock);
  //         setPrintingDetails(filledData.printingDetails);

  //         toast.success('Job Card updated (-10 credits)');
  //       },

  //       onError: (err) => {
  //         toast.error(err?.response?.data?.message || 'AI Fill failed');
  //       },
  //     });
  //   } finally {
  //     setLoading(false);
  //     closeModal();
  //   }
  // };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Ai Fill</CardTitle>
        <CardDescription>
          Are you sure you want to overwrite the existing data? Any
          modifications you have made will be lost. This action will cost you 10
          credits.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex gap-4">
        <Button
          onClick={() => handleAiFill(fileId)}
          disabled={loading}
          variant={'destructive'}
        >
          {loading ? 'Loading...' : 'Accept'}
        </Button>
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
