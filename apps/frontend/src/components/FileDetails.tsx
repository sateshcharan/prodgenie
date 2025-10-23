import { useEffect, useState } from 'react';
import { useLocation, useLoaderData } from 'react-router-dom';

import { apiRoutes } from '@prodgenie/libs/constant';

import JobCard from './JobCard';
import { api, ExcelHTMLViewer } from '../utils';
import { FileDetailsLoaderTypes } from '../loaders/fileDetailsLoader';

const FileDetails = () => {
  const { fileId, fileType, fileData } =
    useLoaderData() as FileDetailsLoaderTypes;

  const location = useLocation();
  const [signedUrl, setSignedUrl] = useState(location.state?.signedUrl);
  const [tables, setTables] = useState(null);

  useEffect(() => {
    if (fileType === 'drawing') {
      const parsePdfFromUrl = async (signedUrl: string, fileId: string) => {
        const response = await api.post(
          `${apiRoutes.pdf.base}${apiRoutes.pdf.parse}`,
          { signedUrl, fileId }
        );
        return response.data || [];
      };

      // todo: add loading state for when jobcard is in processing queue

      if (!signedUrl) {
        console.error('Missing signed URL');
        return;
      }

      parsePdfFromUrl(signedUrl, fileId)
        .then(setTables)
        .catch((err) => {
          console.error('Error fetching PDF data:', err);
          setTables(null);
        });
    }
  }, [signedUrl, fileId, fileType]);

  return fileType === 'drawing' ? (
    <div className="flex flex-col lg:flex-row w-full flex-1 overflow-hidden h-screen">
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
  ) : fileType === 'template' || fileType === 'sequence' ? (
    <ExcelHTMLViewer url={signedUrl} />
  ) : fileType === 'config' ? (
    <div className="p-4 bg-gray-50 rounded-lg overflow-auto max-h-[80vh]">
      <pre className="text-sm text-gray-800">
        {JSON.stringify(fileData, null, 2)}
      </pre>
    </div>
  ) : (
    <div>
      <iframe src={signedUrl} className="w-full h-screen" title="PDF Preview" />
    </div>
  );
};

export default FileDetails;
