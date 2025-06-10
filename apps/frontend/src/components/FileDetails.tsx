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
  const [signedUrl, setSignedUrl] = useState(location.state?.signedUrl);
  const [tables, setTables] = useState(null);
  const fileName = signedUrl.split('?')[0].split('/').pop().split('.')[0];
  const [jobCardUrl, setJobCardUrl] = useState('');

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

  return fileType === 'drawing' ? (
    <div className="grid grid-cols-[auto,1fr] w-full h-screen">
      {tables && (
        <div className="p-4 bg-white rounded-lg overflow-auto">
          <JobCard
            tables={tables}
            fileId={fileId}
            signedUrl={signedUrl}
            setJobCardUrl={setSignedUrl}
          />
        </div>
      )}
      <div>
        <iframe src={signedUrl} className="w-full h-full" title="PDF Preview" />
      </div>
    </div>
  ) : (
    <div>
      <iframe src={signedUrl} className="w-full h-screen" title="PDF Preview" />
    </div>
  );
};

export default FileDetails;
