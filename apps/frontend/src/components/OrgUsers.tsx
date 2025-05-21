import { useState, useEffect } from 'react';
import { api } from '../utils';
import {
  Button,
  Card,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
import { Copy } from 'lucide-react';

interface OrgUsersProps {
  orgId: string;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  type: string;
}

const OrgUsers = ({ orgId }: OrgUsersProps) => {
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    const fetchOrgUsers = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(
          `${apiRoutes.orgs.base}${apiRoutes.orgs.getOrgUsers}`,
          { params: { orgId } }
        );
        setUsers(data.data);
      } catch (err) {
        console.error('Failed to fetch organization users:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orgId) fetchOrgUsers();
  }, [orgId]);

  const handleGenerateInviteCode = async () => {
    try {
      setInviteLoading(true);
      const { data } = await api.post(
        `${apiRoutes.auth.base}${apiRoutes.auth.invite.generate}`,
        { orgId }
      );
      setInviteCode(data.invite.code);
      setCopied(false);
    } catch (err) {
      console.error('Failed to generate invite code:', err);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite code:', err);
    }
  };

  return (
    <Card className="p-4 mx-4">
      <div className="space-y-2 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Your Team</h2>
        {!inviteCode && (
          <Button onClick={handleGenerateInviteCode} disabled={inviteLoading}>
            {inviteLoading ? 'Generating...' : 'Generate Invite Code'}
          </Button>
        )}

        {inviteCode && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span className="font-mono bg-muted px-2 py-1 rounded">
              {inviteCode}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
              title={copied ? 'Copied!' : 'Copy'}
            >
              <Copy className="h-4 w-4" />
            </Button>
            {copied && <span className="text-green-600 text-xs">Copied!</span>}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No users found in this organization.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg"
              >
                <Avatar className="h-10 w-10 rounded-lg grayscale">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground capitalize">
                    {user.type}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default OrgUsers;
