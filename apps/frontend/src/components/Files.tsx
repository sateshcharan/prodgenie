import { FolderSync } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';

import {
  fetchFilesByType,
  deleteFile,
  downloadFile,
} from '../services/fileService';
import { api } from '../utils';
import { SearchBanner, FileCard } from '../components';

import { CardItem } from '@prodgenie/libs/types';
import { apiRoutes, FileType } from '@prodgenie/libs/constant';
import { useAddDialogStore, useEditDialogStore } from '@prodgenie/libs/store';
import {
  Button,
  Card,
  CardContent,
  DialogEditFile,
  banner,
} from '@prodgenie/libs/ui';

import { DialogDropZone } from './DialogDropZone';

const Files = () => {
  const { fileType } = useLoaderData() as { fileType: string };
  const [cardData, setCardData] = useState<CardItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editFileId, setEditFileId] = useState<string | null>(null);
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

  const handleCardClick = (card_id: string, signedUrl: string) => {
    if (fileType === 'sequence') {
      return navigate(`/dashboard/sequence/builder?id=${card_id}`, {
        state: { signedUrl },
      });
    } else if (fileType === 'template') {
      return navigate(`/dashboard/template/builder?id=${card_id}`);
    } else {
      return navigate(`/dashboard/${fileType}/${card_id}`, {
        state: { signedUrl },
      });
    }
  };

  const handleCardDelete = async (card_id: string) => {
    try {
      await deleteFile(fileType, card_id);
      setCardData((prev) => prev.filter((card) => card.id !== card_id));
    } catch (err) {
      console.error(`Error deleting file ${card_id}:`, err);
    }
  };

  const handleCardEdit = async (card_id: string) => {
    setEditFileId(card_id);
    useEditDialogStore.getState().open();
    // try {
    //   await deleteFile(fileType, card_id);
    //   setCardData((prev) => prev.filter((card) => card.id !== card_id));
    // } catch (err) {
    //   console.error(`Error deleting file ${card_id}:`, err);
    // }
  };

  const handleCardDownload = (path: string, name: string) => {
    downloadFile(path, name).catch((err) =>
      console.error('Error downloading file:', err)
    );
  };

  const handleAddFileClick = () => {
    // fileType === 'sequence'
    //   ? navigate('/dashboard/builder/sequence')
    //   : useDialogStore.getState().open();
    useAddDialogStore.getState().open();
  };

  const filteredCards = cardData.filter((card) => {
    return card.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSequenceSync = async () => {
    console.log('🌟 Syncing sequence...');
    await api.post(`${apiRoutes.sequence.base}${apiRoutes.sequence.sync}`);
  };

  return (
    <div className="p-4 flex flex-col gap-4 ">
      {/* Search Bar with Banner */}
      <SearchBanner
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        banner={banner}
      />

      {fileType === 'sequence' && (
        <div>
          <Button
            onClick={handleSequenceSync}
            className=" px-4 py-2 rounded disabled:opacity-50"
          >
            <FolderSync size={16} />
            Sync
          </Button>
        </div>
      )}

      {/* File Cards */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {filteredCards.map((card) => (
            <FileCard
              key={card.id}
              card={card}
              fileType={fileType}
              onEdit={handleCardEdit}
              onDownload={handleCardDownload}
              onDelete={handleCardDelete}
              onClick={handleCardClick}
            />
          ))}

          {/* Add File Card */}
          <Card
            onClick={handleAddFileClick}
            className="shadow-lg rounded-xl flex items-center justify-center cursor-pointer bg-forground hover:bg-gray-100 transition-colors duration-200 min-h-[250px]"
          >
            <CardContent className="flex flex-col items-center justify-center h-full">
              <div className="text-4xl text-gray-400">+</div>
              <p className="mt-2 text-gray-600 text-sm">Add File</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal for adding files */}
      <DialogDropZone
        title={`Upload file to ${fileType}`}
        description={`Select or drag and drop files to upload to ${fileType}`}
        submitUrl={`/api/files/${fileType}/upload`}
        onUploadSuccess={fetchFiles}
      />

      {/* Modal for adding edittign files */}
      {editFileId && (
        <DialogEditFile
          title={`Replace ${fileType} thumbnail`}
          description={`Select or drag and drop files to replace ${fileType} thumbnail`}
          submitUrl={`/api/thumbnail/update/${editFileId}`}
          onUploadSuccess={fetchFiles}
          fileId={editFileId}
          onOpenChange={(open) => {
            if (!open) setEditFileId(null);
          }}
        />
      )}
    </div>
  );
};

export default Files;
