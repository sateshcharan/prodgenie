import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import JobCard from './JobCard';

const FileDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { signedUrl } = location.state || {};
  const isDrawing = location.pathname.split('/').includes('drawings');
  const fileId = location.pathname.split('/').pop();

  const [tables, setTables] = useState<any>(null);

  useEffect(() => {
    if (!isDrawing || !signedUrl) return;

    const cachedTables = localStorage.getItem(`tables-${fileId}`);
    if (cachedTables) {
      setTables(JSON.parse(cachedTables));
      return;
    }

    const token = localStorage.getItem('token');
    axios
      .post(
        `/api/pdf/parse`,
        { signedUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        console.log('Parsed tables:', res.data);
        localStorage.setItem(`tables-${fileId}`, JSON.stringify(res.data));
        setTables(res.data);
      })
      .catch((err) => {
        console.error('Error parsing PDF:', err);
      });
  }, [isDrawing, signedUrl, fileId]);

  if (!signedUrl) {
    return <div>No file found.</div>;
  }

  return (
    <div className="relative w-screen h-screen">
      <h1 className="p-4 font-semibold">File ID: {id}</h1>
      <div className="relative w-full h-full">
        <iframe
          src={signedUrl}
          className="rounded-lg shadow-md w-full h-full"
        />
        {tables && (
          <div className="absolute top-5 left-5 bg-white rounded-lg p-4 shadow-lg">
            <JobCard tables={tables} fileId={fileId}/>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDetails;
