import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '../utils/api';
import OrgUsers from '../components/OrgUsers';
import data from './data.json';

import {
  SectionCards,
  ChartAreaInteractive,
  HistoryTable,
  DataTable,
} from '@prodgenie/libs/ui';

const Dashboard = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [orgId, setOrgId] = useState('');
  // const [orgHistory, setOrgHistory] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: userData } = await api.get('/api/users/getProfile/me');
      setOrgId(userData.org.id);
      setIsOwner(userData.type === 'OWNER');
    };
    // const fetchHistoryData = async () => {
    //   const { data: historyData } = await api.get('/api/orgs/getOrgHistory');
    //   setOrgHistory(historyData.data);
    // };

    fetchUserData();
    // fetchHistoryData();
  }, []);

  const {
    data: orgHistory,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['orgHistory'],
    queryFn: async () => {
      const { data } = await api.get('/api/orgs/getOrgHistory');
      return data.data;
    },
    enabled: !!orgId, // only start when orgId is loaded
    refetchInterval: 30000, // polling every 5s
    refetchIntervalInBackground: false, // don't poll when tab is hidden
  });

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {isOwner && (
        <>
          <OrgUsers orgId={orgId} />
          {/* <SectionCards /> */}
        </>
      )}

      {/* <div className="px-4 lg:px-6">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <HistoryTable history={orgHistory ?? []} />
        )}
      </div> */}
      <HistoryTable history={orgHistory ?? []} />
    </div>
  );
};

export default Dashboard;
