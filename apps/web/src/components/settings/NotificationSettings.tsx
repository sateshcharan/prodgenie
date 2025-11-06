import React from 'react';
import { Bell, Mail, Smartphone } from 'lucide-react';

import { Switch } from '@prodgenie/libs/ui/switch';
import { Separator } from '@prodgenie/libs/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@prodgenie/libs/ui/card';

const NotificationSettings = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Notification Settings</h1>
        <p className="text-sm text-muted-foreground">
          Choose how and when you want to be notified
        </p>
      </div>

      {/* Email Notifications */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Job Status Updates</span>
            <Switch disabled />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">New File Uploads</span>
            <Switch defaultChecked disabled />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">Billing & Invoices</span>
            <Switch defaultChecked disabled />
          </div>
        </CardContent>
      </Card>

      {/* Mobile / Push Notifications */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Workspace Invites</span>
            <Switch defaultChecked disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
