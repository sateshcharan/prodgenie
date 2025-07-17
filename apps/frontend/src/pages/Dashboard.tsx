import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '../utils/api';
// import data from './data.json';
import OrgUsers from '../components/OrgUsers';
import { SectionCards } from '../components/section-cards';

import {
  ChartAreaInteractive,
  HistoryTable,
  DataTable,
} from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useUserStore } from '@prodgenie/libs/store';

const Dashboard = () => {
  const user = useUserStore((state) => state.user);
  const orgId = user?.org?.id;
  const credits = user?.org?.credits;
  const isOwner = user?.type === 'OWNER';
  const isAdmin = user?.type === 'ADMIN';

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        // const fetchHistoryData = async () => {
        //   const { data: historyData } = await api.get('/api/orgs/getOrgHistory');
        //   setOrgHistory(historyData.data);
        // };
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    // fetchHistoryData();
  }, []);

  // const [orgHistory, setOrgHistory] = useState([]);

  // // polling with react-query
  // const {
  //   data: orgHistory,
  //   refetch,
  //   isLoading,
  // } = useQuery({
  //   queryKey: ['orgHistory'],
  //   queryFn: async () => {
  //     const { data } = await api.get('/api/orgs/getOrgHistory');
  //     return data.data;
  //   },
  //   enabled: !!orgId, // only start when orgId is loaded
  //   refetchInterval: 30000, // polling every 5s
  //   refetchIntervalInBackground: false, // don't poll when tab is hidden
  // });

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {(isOwner || isAdmin) && (
        <>
          <OrgUsers orgId={orgId} />
          <SectionCards credits={credits} />
        </>
      )}

      {/* <div className="px-4 lg:px-6">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <HistoryTable history={orgHistory ?? []} />
        )}
      </div> */}

      {/* <HistoryTable history={orgHistory ?? []} /> */}
    </div>
  );
};

export default Dashboard;
