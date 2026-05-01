import { useEffect, useState } from 'react';
import { useLocation, useLoaderData } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { apiRoutes } from '@prodgenie/libs/constant';
import { useBomStore } from '@prodgenie/libs/store';
import { Button } from '@prodgenie/libs/ui/button';

import JobCard from './JobCard';
import api from '../utils/api';
import { ExcelHTMLViewer } from '../utils/ExcelViewer';
import { FileDetailsLoaderTypes } from '../loaders/fileDetailsLoader';

import EventDetailsPage from '../pages/EventDetail';

const FileDetails = () => {
  const { fileId, fileType, fileData } =
    useLoaderData() as FileDetailsLoaderTypes;

  const location = useLocation();
  const [signedUrl, setSignedUrl] = useState(location.state?.signedUrl);
  const [tables, setTables] = useState(null);

  const {
    bom,
    titleBlock,
    printingDetails,
    setBom,
    setTitleBlock,
    setPrintingDetails,
  } = useBomStore((state) => state);

  // for signed url when not passed via location.state
  useEffect(() => {
    if (fileType === 'config' || fileType === 'event') return; // no signed url for configs, events

    const fetchSignedUrl = async () => {
      try {
        const res = await api.get(`${apiRoutes.files.base}/getById/${fileId}`);
        setSignedUrl(res.data.data.path);
      } catch (err) {
        console.error('Failed to fetch signed URL', err);
      }
    };

    // If not passed via location.state (e.g. direct URL visit)
    if (!signedUrl && fileId) {
      fetchSignedUrl();
    }
  }, [signedUrl, fileId]);

  // parse replaced with fill with ai button
  // useEffect(() => {
  //   if (fileType === 'drawing') {
  //     const parsePdfFromUrl = async (signedUrl: string, fileId: string) => {
  //       const response = await api.post(
  //         `${apiRoutes.pdf.base}${apiRoutes.pdf.parse}`,
  //         { signedUrl, fileId }
  //       );
  //       return response.data || [];
  //     };

  //     // todo: add loading state for when jobcard is in processing queue

  //     if (!signedUrl) {
  //       console.error('Missing signed URL');
  //       return;
  //     }

  //     parsePdfFromUrl(signedUrl, fileId)
  //       .then(setTables)
  //       .catch((err) => {
  //         console.error('Error fetching PDF data:', err);
  //         setTables(null);
  //       });
  //   }
  // }, [signedUrl, fileId, fileType]);

  useEffect(() => {
    if (fileType !== 'drawing') return;

    const fetchFileData = async () => {
      try {
        const res = await api.get(
          `${apiRoutes.files.base}/getFileData/${fileId}`
        );

        const data = res.data.data;

        setBom(data.bom);
        setTitleBlock(data.titleBlock);
        setPrintingDetails(data.printingDetails);
      } catch (err) {
        console.error('Failed to fetch file data', err);
      }
    };

    fetchFileData();
  }, [fileId, fileType, setBom, setTitleBlock, setPrintingDetails]);

  // useEffect(() => {
  //   if (fileType !== 'event') return;

  //   const fetchEvent = async () => {
  //     try {
  //       const { data } = await api.get(
  //         `${apiRoutes.admin.base}${apiRoutes.admin.getEventDetails}/${fileId}`
  //       );
  //       setCurrentEvent(data.data);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   fetchEvent();
  // }, [fileType, fileId, setCurrentEvent]);

  // const { data: event, isLoading } = useQuery({
  //   queryKey: ['event', fileId],
  //   queryFn: async () => {
  //     if (!fileId) return null; // ✅ guard

  //     const res = await api.get(
  //       `${apiRoutes.admin.base}${apiRoutes.admin.getEventDetails}/${fileId}`
  //     );

  //     return res.data?.data ?? null; // ✅ always return something
  //   },
  //   enabled: fileType === 'event' && typeof fileId === 'string',
  //   retry: false, // optional: prevents retry spam on bad first call
  // });

  useEffect(() => {
    return () => {
      setBom([]);
      setTitleBlock({});
      setPrintingDetails([]);
    };
  }, []);

  return fileType === 'drawing' ? (
    <div className="flex flex-col lg:flex-row w-full flex-1 overflow-hidden h-screen">
      {/* {tables && ( */}
      <div className="lg:w-[40%] w-full p-4 bg-background rounded-lg max-h-[50vh] lg:max-h-none overflow-y-auto">
        <JobCard
          // tables={tables}
          fileId={fileId}
          signedUrl={signedUrl}
          setJobCardUrl={setSignedUrl}
        />
      </div>
      {/* )} */}
      <div className="flex-1">
        <iframe src={signedUrl} className="w-full h-full" title="PDF Preview" />
      </div>
    </div>
  ) : fileType === 'template' || fileType === 'sequence' ? (
    <ExcelHTMLViewer url={signedUrl} />
  ) : fileType === 'config' ? (
    <div className="p-4 rounded-lg overflow-auto max-h-[80vh]">
      <pre className="text-sm">{JSON.stringify(fileData, null, 2)}</pre>
    </div>
  ) : fileType === 'event' ? (
    <EventDetailsPage eventId={fileId} />
  ) : (
    <div>
      <iframe src={signedUrl} className="w-full h-screen" title="PDF Preview" />
    </div>
  );
};

export default FileDetails;
