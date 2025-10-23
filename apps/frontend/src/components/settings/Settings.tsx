import { useParams, useNavigate } from 'react-router-dom';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@prodgenie/libs/ui/tabs';

import AccountSettings from './AccountSettings';
import BillingSettings from './BillingSettings';
import NotificationSettings from './NotificationSettings';

export default function Settings() {
  const { tab } = useParams();
  const navigate = useNavigate();

  // fallback to account if no tab provided
  const currentTab = tab || 'account';

  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs
        value={currentTab}
        onValueChange={(val) => navigate(`/dashboard/settings/${val}`)}
      >
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notification">Notification</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="billing">
          <BillingSettings />
        </TabsContent>
        <TabsContent value="notification">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
