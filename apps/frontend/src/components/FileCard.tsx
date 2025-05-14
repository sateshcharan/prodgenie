// FileCard.tsx
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  CardTitle,
} from '@prodgenie/libs/ui';
import { X, Download } from 'lucide-react';
import PdfThumbnail from './PdfThumbnail';

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
  <Card key={card.id} className="relative shadow-lg rounded-xl">
    <Button
      onClick={() => onDelete(card.id)}
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2"
    >
      <X />
    </Button>
    <Button
      onClick={() => onDownload(card.path, card.name)}
      variant="ghost"
      size="icon"
      className="absolute top-2 right-8"
    >
      <Download />
    </Button>
    <CardHeader>
      <CardTitle>{card.name}</CardTitle>
    </CardHeader>
    <CardContent onClick={() => onClick(card.id, card.path)}>
      {fileType === 'drawing' || fileType === 'jobCard' ? (
        <PdfThumbnail url={card.path} width={250} />
      ) : (
        <iframe src={card.path} className="w-full h-40" />
      )}
    </CardContent>
  </Card>
);

export default FileCard;
