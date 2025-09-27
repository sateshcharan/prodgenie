import { useEffect, useState } from 'react';
import { useLocation, useLoaderData } from 'react-router-dom';

import JobCard from './JobCard';
import { api, ExcelHTMLViewer } from '../utils';
import { apiRoutes } from '@prodgenie/libs/constant';

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

  const parsePdfFromUrl = async (signedUrl: string, fileId: string) => {
  // const cacheKey = `tables-${fileId}`;
  // const cached = localStorage.getItem(cacheKey);
  // if (cached) return JSON.parse(cached);

  const response = await api.post(
    `${apiRoutes.pdf.base}${apiRoutes.pdf.parse}`,
    { signedUrl, fileId }
  );

  // localStorage.setItem(cacheKey, JSON.stringify(response.data));
  return response.data;
};

  return fileType === 'drawing' ? (
    <div className="flex flex-col lg:flex-row w-full flex-1 overflow-hidden">
      {tables && (
        <div className="lg:w-[40%] w-full p-4 bg-white rounded-lg max-h-[50vh] lg:max-h-none overflow-y-auto">
          <JobCard
            tables={tables}
            fileId={fileId}
            signedUrl={signedUrl}
            setJobCardUrl={setSignedUrl}
          />
        </div>
      )}
      <div className="flex-1">
        <iframe src={signedUrl} className="w-full h-full" title="PDF Preview" />
      </div>
    </div>
  ) : fileType === 'template' ? (
    <ExcelHTMLViewer url={signedUrl} />
  ) : fileType === 'sequence' ? (
    <ExcelHTMLViewer url={signedUrl} />
  ) : (
    <div>
      <iframe src={signedUrl} className="w-full h-screen" title="PDF Preview" />
    </div>
  );
};

export default FileDetails;
