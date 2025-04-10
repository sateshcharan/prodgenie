import { Card, CardContent, CardHeader, CardTitle } from '@prodgenie/apps/ui';
import axios from 'axios';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPDF from '../components/ReactPDF';

interface CardItem {
  id: number;
  name: string;
  path: string;
  userId: string;
  createdAt: string;
}

const cardData: CardItem[] = [];

const Drawings = () => {
  const navigate = useNavigate();

  const handleCardClick = (card_id: number, path: string) => {
    console.log('Card clicked:', card_id);
    navigate(`/drawings/${card_id}`, {
      state: { path },
    });
  };

  const [cardData, setCardData] = useState<CardItem[]>([]);
  useEffect(() => {
    axios
      .get('/api/file/files', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        setCardData(res.data.files);
      })
      .catch((err) => {
        console.log('error fetching files', err);
      });
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {cardData.length === 0 ? (
        <p className="text-center col-span-full">No drawings found.</p>
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
              <iframe
                src={card.path}
                width={300}
                height={300}
                className="rounded-lg shadow-md"
              />
              {/* <ReactPDF file={{ url: card.path }} width={300} /> */}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default Drawings;
