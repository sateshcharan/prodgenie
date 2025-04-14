import { Card, CardContent, CardHeader, CardTitle } from '@prodgenie/apps/ui';
import axios from 'axios';

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PDFViewer, JSONViewer, ExcelViewer } from '../utils';

import { apiRoutes } from '@prodgenie/libs/constants';

interface CardItem {
  id: number;
  name: string;
  path: string;
  userId: string;
  createdAt: string;
}

const cardData: CardItem[] = [];

const Files = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const file = location.pathname.split('/').pop();

  const [cardData, setCardData] = useState<CardItem[]>([]);

  useEffect(() => {
    axios
      .get(`${apiRoutes.api.url}${apiRoutes[file].url}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((res) => {
        setCardData(res.data.files);
      })
      .catch((err) => {
        console.log(`error fetching ${file}`, err);
      });
  }, []);

  const handleCardClick = (card_id: number, path: string) => {
    navigate(`/dashboard/${file}/${card_id}`, {
      state: { path },
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {cardData.length === 0 ? (
        <p className="text-center col-span-full">No {file} found.</p>
      ) : (
        cardData.map((card) => (
          <Card
            key={card.id}
            className="shadow-lg rounded-xl"
            onClick={() => handleCardClick(card.id, card.path)}
          >
            <CardHeader>
              <CardTitle>{card.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{card.id}</p>

              {card.name.endsWith('.pdf') ? (
                <iframe
                  src={card.path}
                  width={300}
                  height={300}
                  className="rounded-lg shadow-md"
                />
              ) : // <PDFViewer fileUrl={card.path} />
              card.name.endsWith('.xlsx') ? (
                <ExcelViewer file={card.path} />
              ) : card.name.endsWith('.json') ? (
                <JSONViewer data={card.path} />
              ) : (
                <p>Unsupported file format</p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default Files;
