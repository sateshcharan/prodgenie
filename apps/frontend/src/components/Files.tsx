import { useEffect, useState } from 'react';
import { FolderSync, Plus, Upload } from 'lucide-react';
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
import {
  useAddDialogStore,
  useEditDialogStore,
  useWorkspaceStore,
  useModalStore,
} from '@prodgenie/libs/store';
import { Button, Card, CardContent, banner, toast } from '@prodgenie/libs/ui';

const Files = () => {
  const { fileType } = useLoaderData() as { fileType: string };
  const [cardData, setCardData] = useState<CardItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editFileId, setEditFileId] = useState<string | null>(null);
  const { activeWorkspace } = useWorkspaceStore();
  const { openModal } = useModalStore();
  const navigate = useNavigate();

  const fetchFiles = async () => {
    if (!fileType || !Object.values(FileType).includes(fileType as FileType))
      return;
    try {
      const files = await fetchFilesByType(fileType);
      setCardData(files);
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/');
      else console.error(`Error fetching ${fileType}:`, err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [fileType, activeWorkspace]);

  const handleCardClick = (card_id: string, signedUrl: string) => {
    let path = `/dashboard/${fileType}/${card_id}`;
    let options: { state?: { signedUrl: string } } = {};

    if (
      fileType === 'sequence' ||
      fileType === 'template' ||
      fileType === 'table'
    ) {
      path = `/dashboard/${fileType}/builder?id=${card_id}`;
    }

    if (
      fileType === 'sequence' ||
      !['sequence', 'template', 'table'].includes(fileType)
    ) {
      options.state = { signedUrl };
    }

    return navigate(path, options);
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
    openModal('workspace:editThumbnail', {
      title: `Replace ${fileType} thumbnail`,
      description: `Select or drag and drop files to replace ${fileType} thumbnail`,
      submitUrl: `/api/thumbnail/update/${card_id}`,
      onUploadSuccess: fetchFiles,
    });
  };

  const handleCardDownload = (path: string, name: string) => {
    downloadFile(path, name).catch((err) =>
      console.error('Error downloading file:', err)
    );
  };

  const handleAddFileClick = () => {
    openModal('workspace:fileUpload', {
      title: `Upload file to ${fileType}`,
      description: `Select or drag and drop files to upload to ${fileType}`,
      submitUrl: `/api/files/${fileType}/upload`,
      onUploadSuccess: fetchFiles,
    });
  };

  const handleCreateNewClick = () => {
    navigate(`/dashboard/${fileType}/builder`);
  };

  const filteredCards = cardData.filter((card) => {
    return card.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSequenceSync = async () => {
    toast.info('🌟 Syncing sequence...');
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
          <Card className="shadow-lg rounded-xl flex flex-col cursor-pointer bg-background min-h-[250px]">
            {fileType === 'template' ||
            fileType === 'sequence' ||
            fileType === 'table' ? (
              // Dual Action Internals
              <div className="flex flex-col flex-1 divide-y divide-gray-200">
                {/* Upload File */}
                <div
                  onClick={handleAddFileClick}
                  className="flex flex-col items-center justify-center flex-1 py-6 transition hover:bg-gray-50"
                >
                  <Upload size={20} className="text-gray-500" />
                  <p className="mt-2 text-gray-600 text-sm">Upload File</p>
                </div>

                {/* Create New */}
                <div
                  onClick={handleCreateNewClick}
                  className="flex flex-col items-center justify-center flex-1 py-6 transition hover:bg-gray-50"
                >
                  <Plus size={20} className="text-gray-500" />
                  <p className="mt-2 text-gray-600 text-sm">Create New</p>
                </div>
              </div>
            ) : (
              // Single Action Internals
              <CardContent
                onClick={handleAddFileClick}
                className="flex flex-col items-center justify-center h-full"
              >
                <Upload size={20} className="text-gray-500" />
                <p className="mt-2 text-gray-600 text-sm">Upload File</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Files;
