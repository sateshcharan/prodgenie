import { useState, useEffect } from 'react';

import { api } from '../utils';

import {
  Button,
  Card,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@prodgenie/libs/ui';

interface OrgUsersProps {
  orgId: string;
}

const OrgUsers = ({ orgId }: OrgUsersProps) => {
  const [inviteCode, setInviteCode] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrgUsers = async () => {
      try {
        const { data } = await api.get('/api/orgs/getOrgUsers', {
          params: { orgId },
        });
        setUsers(data.users);
      } catch (err) {
        console.error('Error fetching org users:', err);
      }
    };
    if (orgId) fetchOrgUsers();
  }, [orgId]);

  const handleGenerateInviteCode = async () => {
    try {
      const { data: inviteCodeData } = await api.post(
        '/api/auth/invite/generate',
        { orgId }
      );
      setInviteCode(inviteCodeData.invite.code);
    } catch (err) {
      console.error('Error generating invite code:', err);
    }
  };

  return (
    <Card className="flex gap-4 mx-4 p-4 items-start">
      <div>
        <h1 className="text-xl font-semibold mb-2">Add Users</h1>
        <Button onClick={handleGenerateInviteCode}>Generate Invite Code</Button>
        <p className="mt-2 text-muted">{inviteCode}</p>
      </div>

      <ul className="mt-2 list-disc pl-4">
        {users?.map((user) => (
          <li key={user.id}>
            {user.name}
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default OrgUsers;
