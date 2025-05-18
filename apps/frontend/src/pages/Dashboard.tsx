import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  SectionCards,
  ChartAreaInteractive,
  HistoryTable,
} from '@prodgenie/libs/ui';

import OrgUsers from '../components/OrgUsers';

const Dashboard = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [orgId, setOrgId] = useState('');
  const [orgHistory, setOrgHistory] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: userData } = await api.get('/api/users/getProfile/me');
      setOrgId(userData.org.id);
      setIsOwner(userData.type === 'OWNER');
    };
    const fetchHistoryData = async () => {
      const { data: historyData } = await api.get('/api/orgs/getOrgHistory');
      setOrgHistory(historyData.data);
    };

    fetchUserData();
    fetchHistoryData();
  }, []);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {isOwner && (
        <>
          <OrgUsers orgId={orgId} />
          <SectionCards />
        </>
      )}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
        <HistoryTable history={orgHistory} />
      </div>
    </div>
  );
};

export default Dashboard;
