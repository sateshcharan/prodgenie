import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DialogDropZone,
} from '@prodgenie/libs/ui';
import axios from 'axios';

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PDFViewer, JSONViewer, ExcelViewer } from '../utils';

import { apiRoutes } from '@prodgenie/libs/constant';

import { useDialogStore } from '@prodgenie/libs/store';

import { X } from 'lucide-react';

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
      .get(`/api/files/${file}/list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((res) => {
        if (res.data.data.length === 0) {
          return;
        }
        setCardData(res.data.data);
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

  const handleCardDelete = (card_id: number) => {
    console.log(card_id);
    axios
      .delete(`/api/files/${file}/${card_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(`error deleting ${card_id}`, err);
      });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {cardData.map((card) => (
        <Card
          key={card.id}
          className="relative shadow-lg rounded-xl cursor-pointer"
        >
          <Button
            onClick={() => handleCardDelete(card.id)}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 "
          >
            <X />
          </Button>

          <CardHeader>
            <CardTitle>{card.name}</CardTitle>
          </CardHeader>
          <CardContent onClick={() => handleCardClick(card.id, card.path)}>
            <p className="text-gray-600">{card.id}</p>
            <iframe src={card.path} frameBorder="0" className="w-full h-40" />
          </CardContent>
        </Card>
      ))}

      {/* Add Card */}
      <Card
        className="shadow-lg rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100"
        onClick={() => {
          // trigger your file upload modal or form
          useDialogStore.getState().open();
        }}
      >
        <CardContent className="flex flex-col items-center justify-center">
          <div className="text-4xl text-gray-400">+</div>
          <p className="mt-2 text-gray-600">Add File</p>
        </CardContent>
      </Card>
      <DialogDropZone
        title={`Upload file to ${file}`}
        description={`Select or drag and drop files to upload to ${file}`}
        submitUrl={`/api/files/${file}/upload`}
      />
    </div>
  );
};

export default Files;
