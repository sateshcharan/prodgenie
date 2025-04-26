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

import { X, Download } from 'lucide-react';

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

  const fetchFiles = () => {
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
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          console.error(`Error fetching ${file}:`, err);
        }
      });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleCardClick = (card_id: number, signedUrl: string) => {
    navigate(`/dashboard/${file}/${card_id}`, {
      state: { signedUrl },
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
        setCardData(cardData.filter((card) => card.id !== card_id));
      })
      .catch((err) => {
        console.log(`error deleting ${card_id}`, err);
      });
  };

  const handleCardDownload = async (card_path: string, card_name: string) => {
    try {
      const response = await fetch(card_path, {
        method: 'GET',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // You can set a custom file name here if you want
      link.download = card_name;
      document.body.appendChild(link);
      link.click();
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
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
          <Button
            onClick={() => handleCardDownload(card.path, card.name)}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-8 "
          >
            <Download />
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
        onUploadSuccess={fetchFiles}
      />
    </div>
  );
};

export default Files;
