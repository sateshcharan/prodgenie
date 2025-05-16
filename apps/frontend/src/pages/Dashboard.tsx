import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Button,
  SectionCards,
  DataTable,
  ChartAreaInteractive,
} from '@prodgenie/libs/ui';
import Dashboard1 from '../layouts/DashLayout';

import data from './data.json';

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
    //   </div>
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <section>
        <h1>Add Users</h1>
        <Button onClick={handleGenerateInviteCode}>Generate Invite Code</Button>
        <p>{inviteCode}</p>
      </section>
      {isOwner && (
        <>
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
            <DataTable data={data} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
