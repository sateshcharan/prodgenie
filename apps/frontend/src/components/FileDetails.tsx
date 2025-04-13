import { useParams, useLocation } from 'react-router-dom';

const FileDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { path } = location.state || {};
  return (
    <div className="">
      <h1>File ID: {id}</h1>
      <iframe src={path} className="rounded-lg shadow-md w-screen h-screen" />
    </div>
  );
};

export default FileDetails;
