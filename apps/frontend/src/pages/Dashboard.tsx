import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '@prodgenie/libs/ui';

const Dashboard = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [orgId, setOrgId] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: userData } = await api.get('/api/users/getProfile/me');
      setOrgId(userData.org.id);
      setIsOwner(userData.type === 'OWNER');
    };
    fetchUserData();
  }, []);

  const handleGenerateInviteCode = async () => {
    const { data: inviteCodeData } = await api.post(
      '/api/auth/invite/generate',
      {
        orgId,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    setInviteCode(inviteCodeData.invite.code);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {isOwner && (
        <section>
          <h1>Add Users</h1>
          <Button onClick={handleGenerateInviteCode}>
            Generate Invite Code
          </Button>
          <p>{inviteCode}</p>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
