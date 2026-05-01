import { CreditCard, FileText, Users, Wallet } from 'lucide-react';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@prodgenie/libs/ui/tabs';
import { Button } from '@prodgenie/libs/ui/button';
import { Separator } from '@prodgenie/libs/ui/separator';
import { Progress } from '@prodgenie/libs/ui/progress';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@prodgenie/libs/ui/card';
import {
  useWorkspaceStore,
  useUserStore,
  useModalStore,
} from '@prodgenie/libs/store';
import { toast } from 'sonner';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const BillingSettings = () => {
  const { activeWorkspace } = useWorkspaceStore();
  const { openModal } = useModalStore();
  const { user } = useUserStore();

  const navigate = useNavigate();

  const handleRenew = async () => {
    navigate(`/dashboard/qr-payment/4999/subscription`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Billing & Plan</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription, usage, and invoices
        </p>
      </div>

      {/* Current Plan in Tabs */}
      {user?.memberships && user.memberships.length > 0 && (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Current Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={user.memberships[0].id} className="w-full">
              {/* Tab Triggers */}
              <TabsList className="mb-4">
                {user.memberships.map((membership) => (
                  <TabsTrigger key={membership.id} value={membership.id}>
                    {membership.workspace?.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content */}
              {user.memberships.map((membership) => (
                <TabsContent
                  key={membership.id}
                  value={membership.id}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      {/* <img
                        src={membership.workspace.thumbnail}
                        alt={membership.workspace.name}
                        className="w-30 h-30 rounded-sm object-cover"
                      /> */}
                      <p className="font-medium capitalize">
                        {membership.workspace?.plan?.name} Plan
                      </p>
                      <div className="flex gap-4 items-center">
                        <p className="text-sm text-muted-foreground">
                          ${membership.workspace?.plan?.monthlyCredits}/month
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires on:{' '}
                          {membership.workspace?.planExpiry
                            ? new Date(
                                membership.workspace.planExpiry
                              ).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleRenew}>
                      Renew
                    </Button>
                  </div>

                  {/* <div>
                    <p className="text-sm font-medium">Plan Usage</p>
                    <Progress value={60} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.ceil(
                        (new Date(membership.workspace.planExpiry).getTime() -
                          Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )}
                      / 30 Days left
                    </p>
                  </div> */}
                  {(() => {
                    const totalDays = 30;
                    const remainingDays = Math.max(
                      0,
                      Math.ceil(
                        (new Date(membership.workspace.planExpiry).getTime() -
                          Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )
                    );

                    const usedDays = totalDays - remainingDays;
                    const progressValue = Math.min(
                      100,
                      Math.max(0, (usedDays / totalDays) * 100)
                    );

                    return (
                      <div>
                        <p className="text-sm font-medium">Plan Usage</p>
                        <Progress value={progressValue} className="h-2 mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {remainingDays > 0
                            ? `${remainingDays} day${
                                remainingDays > 1 ? 's' : ''
                              } left`
                            : 'Expired'}{' '}
                          / {totalDays} days
                        </p>
                      </div>
                    );
                  })()}

                  {/* <div>
                    <p className="text-sm font-medium">Members</p>
                    <Progress value={40} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      8 / 20 used
                    </p>
                  </div> */}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      {/* <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Payment Method</CardTitle>
          </div>
          <Button variant="outline">Update</Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <CreditCard className="inline h-4 w-4 mr-2 text-muted-foreground" />
            Visa ending in 4242 — Expires 12/26
          </p>
        </CardContent>
      </Card> */}

      {/* Invoices */}
      {/* <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Invoices</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Invoice #12345 — Aug 2025</span>
            <Button variant="ghost" size="sm">
              Download
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span>Invoice #12344 — Jul 2025</span>
            <Button variant="ghost" size="sm">
              Download
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default BillingSettings;
