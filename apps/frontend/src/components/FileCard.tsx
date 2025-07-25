import { useEffect, useState } from 'react';
import { X, Download, Pencil, Briefcase, Calculator } from 'lucide-react';

import { getThumbnail } from '../services/fileService';
import PdfThumbnail from './PdfThumbnail';
import { EditableTitle } from './EditableTitle';
import { ExcelHTMLViewer } from '../utils';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@prodgenie/libs/ui';
import { StringService } from '@prodgenie/libs/frontend-services';

interface FileCardProps {
  card: {
    id: string;
    name: string;
    path: string;
    thumbnail: string;
  };
  fileType: string;
  onEdit: (id: string) => void;
  onDownload: (path: string, name: string) => void;
  onDelete: (id: string) => void;
  onClick: (id: string, path: string) => void;
}

const stringService = new StringService();

const FileCard = ({
  card,
  fileType,
  onEdit,
  onDelete,
  onDownload,
  onClick,
}: FileCardProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadThumbnail = async () => {
      if (card.thumbnail) {
        try {
          const signedUrl = await getThumbnail(card.id);
          setThumbnailUrl(signedUrl);
        } catch (error) {
          console.error('Failed to load thumbnail:', error);
        }
      }
    };
    loadThumbnail();
  }, [card.thumbnail]);

  return (
    <Card key={card.id} className="shadow-lg rounded-xl p-2 overflow-hidden">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mb-2">
        
        <Button onClick={() => onEdit(card.id)} variant="secondary" size="icon">
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => onDownload(card.path, card.name)}
          variant="outline"
          size="icon"
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => onDelete(card.id)}
          variant="destructive"
          size="icon"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* File Preview */}
      <CardContent
        onClick={() => onClick(card.id, card.path)}
        className="flex items-center justify-center cursor-pointer"
      >
        <Avatar className="h-full w-full rounded-lg ">
          {/* <AvatarImage>
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="Thumbnail" className="rounded" />
            ) : fileType === 'drawing' || fileType === 'jobCard' ? (
              <PdfThumbnail url={card.path} />
            ) : fileType === 'template' ? (
              <ExcelHTMLViewer url={card.path} />
            ) : null}
          </AvatarImage>
          <AvatarFallback className="rounded-lg">
            {card?.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback> */}
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="rounded h-full object-contain"
            />
          ) 
          // : fileType === 'drawing' || fileType === 'jobCard' ? (
          //   <PdfThumbnail url={card.path} />
          // ) : fileType === 'template' ? (
          //   <ExcelHTMLViewer url={card.path} />
          // ) 
          : (
            // <div className="text-gray-400">No Preview</div>
            <AvatarFallback className="rounded-lg w-full h-[120px]">
              {stringService.getInitials(card?.name)}
            </AvatarFallback>
          )}
        </Avatar>
      </CardContent>

      {/* File Name */}
      <CardHeader className="text-center p-0 capitalize">
        {fileType === 'drawing' || fileType === 'sequence' ? (
          <EditableTitle
            value={stringService.camelToNormal(
              stringService.getNameWithoutExtension(card.name)
            )}
            onSave={(newValue) => {
              // Optional save logic
            }}
            fileId={card.id.toString()}
            fileType={fileType}
          />
        ) : (
          <div className="text-center p-2 capitalize">
            {stringService.camelToNormal(
              stringService.getNameWithoutExtension(card.name)
            )}
          </div>
        )}
      </CardHeader>
    </Card>
  );
};

export default FileCard;
