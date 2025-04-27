import { useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

const FileDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { signedUrl } = location.state || {};

  useEffect(() => {
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
      })
      .catch((err) => {
        console.error('Error parsing PDF:', err);
      });
  }, []);

  return (
    <div className="">
      <h1>File ID: {id}</h1>
      <iframe
        src={signedUrl}
        className="rounded-lg shadow-md w-screen h-screen"
      />
    </div>
  );
};

export default FileDetails;
