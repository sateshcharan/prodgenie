import { useEffect, useState } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';

import {
  fetchFilesByType,
  deleteFile,
  downloadFile,
} from '../services/fileService';
import { SearchBanner, FileCard } from './';

import { Card, CardContent, DialogDropZone, banner } from '@prodgenie/libs/ui';
import { useDialogStore } from '@prodgenie/libs/store';
import { CardItem } from '@prodgenie/libs/types';
import { FileType } from '@prodgenie/libs/constant';

const Files = () => {
  const { fileType } = useLoaderData() as { fileType: string };
  const [cardData, setCardData] = useState<CardItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchFiles = async () => {
    if (!fileType || !Object.values(FileType).includes(fileType as FileType))
      return;
    try {
      const files = await fetchFilesByType(fileType);
      if (files.length) setCardData(files);
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/');
      else console.error(`Error fetching ${fileType}:`, err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [fileType]);

  const handleCardClick = (card_id: number, signedUrl: string) => {
    navigate(`/dashboard/${fileType}/${card_id}`, {
      state: { signedUrl },
    });
  };

  const handleCardDelete = async (card_id: number) => {
    try {
      await deleteFile(fileType, card_id);
      setCardData((prev) => prev.filter((card) => card.id !== card_id));
    } catch (err) {
      console.error(`Error deleting file ${card_id}:`, err);
    }
  };

  const handleCardDownload = (path: string, name: string) => {
    downloadFile(path, name).catch((err) =>
      console.error('Error downloading file:', err)
    );
  };

  const handleAddFileClick = () => {
    useDialogStore.getState().open();
  };

  const filteredCards = cardData.filter((card) => {
    return card.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-4">
      {/* Search Bar with Banner */}
      <SearchBanner
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        banner={banner}
      />

      {/* File Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCards.map((card) => (
          <FileCard
            key={card.id}
            card={card}
            fileType={fileType}
            onDelete={handleCardDelete}
            onDownload={handleCardDownload}
            onClick={handleCardClick}
          />
        ))}

        {/* Add File Card */}
        <Card
          onClick={handleAddFileClick}
          className="shadow-lg rounded-xl flex items-center justify-center cursor-pointer hover:bg-white-100"
        >
          <CardContent className="flex flex-col items-center justify-center">
            <div className="text-4xl text-gray-400">+</div>
            <p className="mt-2 text-gray-600">Add File</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal for User Login or Signup */}
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
