import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
import { api } from '../utils';

type Plan = {
  id: string;
  name: string;
  description?: string;
};

export function PlanDropdown({
  handleSelectedPlan,
}: {
  handleSelectedPlan: (planId: string) => void;
}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data } = await api.get(
          `${apiRoutes.projectWide.base}${apiRoutes.projectWide.getPlans}`
        );
        setPlans(data.data);

        // default to Free plan
        const freePlan = data.data.find((p: Plan) => p.name.toLowerCase() === 'free');
        const defaultPlan = freePlan || data.data[0] || null;

        setSelectedPlan(defaultPlan);

        if (defaultPlan) {
          handleSelectedPlan(defaultPlan.id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchPlans();
  }, [handleSelectedPlan]);

  const onSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    handleSelectedPlan(plan.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-48 items-center justify-between rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent">
          {selectedPlan ? selectedPlan.name : 'Select plan'}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        {plans.map((plan) => (
          <DropdownMenuItem
            key={plan.id}
            onClick={() => onSelectPlan(plan)}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex flex-col">
              <span>{plan.name}</span>
              {plan.description && (
                <span className="text-muted-foreground text-xs">
                  {plan.description}
                </span>
              )}
            </div>
            {selectedPlan?.id === plan.id && (
              <Check className="ml-auto h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
