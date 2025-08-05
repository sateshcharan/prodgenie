import { useEffect, useState } from 'react';
import { useLocation, useLoaderData } from 'react-router-dom';

import JobCard from './JobCard';
import { ExcelHTMLViewer } from '../utils';
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
    // <div
    //   className={`grid ${
    //     tables ? 'grid-cols-[auto_1fr]' : 'grid-cols-1'
    //   } w-full h-screen`}
    // >
    //   {tables && (
    //     <div className="p-4 bg-white rounded-lg overflow-auto">
    //       <JobCard
    //         tables={tables}
    //         fileId={fileId}
    //         signedUrl={signedUrl}
    //         setJobCardUrl={setSignedUrl}
    //       />
    //     </div>
    //   )}
    //   <div>
    //     <iframe src={signedUrl} className="w-full h-full" title="PDF Preview" />
    //   </div>
    // </div>

    // <div className="flex flex-col lg:flex-row w-full h-screen">
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
