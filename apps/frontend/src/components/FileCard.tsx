import { X, Download } from 'lucide-react';
import PdfThumbnail from './PdfThumbnail';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  CardTitle,
} from '@prodgenie/libs/ui';

interface FileCardProps {
  card: {
    id: number;
    name: string;
    path: string;
  };
  fileType: string;
  onDelete: (id: number) => void;
  onDownload: (path: string, name: string) => void;
  onClick: (id: number, path: string) => void;
}

const FileCard = ({
  card,
  fileType,
  onDelete,
  onDownload,
  onClick,
}: FileCardProps) => (
  <Card key={card.id} className="shadow-lg rounded-xl p-2 overflow-hidden">
    {/* Action Buttons */}
    <div className="flex justify-end gap-2 mb-2">
      <Button
        onClick={() => onDownload(card.path, card.name)}
        variant="outline"
        size="icon"
      >
        <Download className="w-4 h-4" />
      </Button>

      <Button onClick={() => onDelete(card.id)} variant="destructive" size="icon">
        <X className="w-4 h-4" />
      </Button>
    </div>

    {/* File Preview */}
    <CardContent
      onClick={() => onClick(card.id, card.path)}
      className="flex items-center justify-center cursor-pointer"
    >
      {fileType === 'drawing' || fileType === 'jobCard' ? (
        <PdfThumbnail url={card.path} />
      ) : (
        <iframe src={card.path} className="w-full h-48 " title={card.name} />
      )}
    </CardContent>

    {/* File Name */}
    <CardHeader className="text-center p-0">
      <CardTitle className="text-sm truncate ">
        {card.name.split('.')[0]}
      </CardTitle>
    </CardHeader>
  </Card>
);

export default FileCard;
