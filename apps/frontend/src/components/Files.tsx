import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DialogDropZone,
} from '@prodgenie/libs/ui';
import { X, Download } from 'lucide-react';
import { useDialogStore } from '@prodgenie/libs/store';
import { fileTypes } from '@prodgenie/libs/constant';
import { CardItem } from '@prodgenie/libs/types';

const Files = () => {
  const navigate = useNavigate();
  const { fileType } = useParams();
  const [cardData, setCardData] = useState<CardItem[]>([]);

  useEffect(() => {
    if (fileType && fileTypes.includes(fileType)) {
      fetchFiles();
    }
  }, [fileType]);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`/api/files/${fileType}/list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.data.data?.length) {
        setCardData(res.data.data);
      } else {
        setCardData([]);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        console.error(`Error fetching ${fileType}:`, err);
      }
    }
  };

  const handleCardClick = (cardId: number, signedUrl: string) => {
    navigate(`/dashboard/${fileType}/${cardId}`, {
      state: { signedUrl },
    });
  };

  const handleCardDelete = async (cardId: number) => {
    try {
      await axios.delete(`/api/files/${fileType}/${cardId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCardData((prev) => prev.filter((card) => card.id !== cardId));
    } catch (err) {
      console.error(`Error deleting file ${cardId}:`, err);
    }
  };

  const handleCardDownload = async (path: string, name: string) => {
    try {
      const response = await fetch(path);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
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
            className="absolute top-2 right-2"
          >
            <X />
          </Button>
          <Button
            onClick={() => handleCardDownload(card.path, card.name)}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-8"
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

      {/* Add New File Card */}
      <Card
        className="shadow-lg rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100"
        onClick={() => useDialogStore.getState().open()}
      >
        <CardContent className="flex flex-col items-center justify-center">
          <div className="text-4xl text-gray-400">+</div>
          <p className="mt-2 text-gray-600">Add File</p>
        </CardContent>
      </Card>

      <DialogDropZone
        title={`Upload file to ${fileType}`}
        description={`Select or drag and drop files to upload to ${fileType}`}
        submitUrl={`/api/files/${fileType}/upload`}
        onUploadSuccess={fetchFiles}
      />
    </div>
  );
};

export default Files;
