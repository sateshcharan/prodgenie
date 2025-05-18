import { useEffect, useState } from 'react';
import { useLocation, useLoaderData } from 'react-router-dom';

import JobCard from './JobCard';
import { parsePdfFromUrl } from '../services/pdfService';

const FileDetails = () => {
  const { fileId, fileType } = useLoaderData() as {
    fileId: string;
    fileType: string;
  };
  const location = useLocation();
  const signedUrl = location.state?.signedUrl;
  const [tables, setTables] = useState(null);
  const fileName = signedUrl.split('?')[0].split('/').pop().split('.')[0];

  useEffect(() => {
    if (!signedUrl) {
      console.error('Missing signed URL');
      return;
    }
    if (fileType === 'drawing') {
      parsePdfFromUrl(signedUrl, fileId)
        .then(setTables)
        .catch((err) => {
          console.error('Error fetching PDF data:', err);
        });
    }
  }, [signedUrl, fileId]);

  return (
    <div className="relative w-screen h-screen">
      <h1 className="p-4 font-semibold">File Name: {fileName}</h1>
      <div className="relative w-full h-full">
        <iframe src={signedUrl} className="w-full h-full" />
        {tables && (
          <div className="absolute top-5 left-5 bg-white rounded-lg  ">
            <JobCard tables={tables} fileId={fileId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDetails;
