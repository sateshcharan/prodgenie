import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  ScrollArea,
  Badge,
  Button,
} from '@prodgenie/libs/ui';

import { useNotificationStore } from '@prodgenie/libs/store';
import { api } from '../utils';
import { apiRoutes } from '@prodgenie/libs/constant';

const typeClassMap: Record<string, string> = {
  INVITE: 'border-primary',
  ROLE_CHANGED: 'border-accent',
  REMOVED: 'border-destructive',
};

const UserNotifications = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  const handleAccept = async (id: string, workspaceId: string) => {
    // TODO: api.post(`/workspace/${workspaceId}/accept-invite`)
    const data = await api.post(
      `${apiRoutes.workspace.base}${apiRoutes.workspace.acceptInvite}`,
      {
        workspaceId,
      }
    );

    markAsRead(id);
  };

  const handleReject = async (id: string, workspaceId: string) => {
    // TODO: api.post(`/workspace/${workspaceId}/reject-invite`)
    console.log('Reject invite for workspace', workspaceId);
    markAsRead(id);
  };

  return (
    <Card className="p-4 h-full">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Recent workspace activity</CardDescription>
      </CardHeader>

      <ScrollArea className="h-[300px] mt-2">
        <div className="flex flex-col gap-3 pr-2">
          {notifications.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No notifications yet.
            </p>
          )}

          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-3 border-l-4 ${
                typeClassMap[n.type] ?? 'border-muted'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-medium">{n.message}</span>
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>

                {!n.read && <Badge variant="secondary">New</Badge>}
              </div>

              {n.type === 'INVITE' && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(n.id, n.workspaceId)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(n.id, n.workspaceId)}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default UserNotifications;
