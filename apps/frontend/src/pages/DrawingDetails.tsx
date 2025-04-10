import { useParams, useLocation } from 'react-router-dom';

const DrawingDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { path } = location.state || {};
  return (
    <div className="">
      <h1>Drawing ID: {id}</h1>
      <iframe src={path} className="rounded-lg shadow-md w-screen h-screen" />
    </div>
  );
};

export default DrawingDetails;
