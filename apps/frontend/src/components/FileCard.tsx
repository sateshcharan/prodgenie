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
  <Card key={card.id} className="shadow-lg rounded-xl p-2">
    <div className="flex flex-row justify-between relative">
      <Button
        onClick={() => onDelete(card.id)}
        variant="outline"
        size="icon"
        className="absolute top-2 right-2"
      >
        <X />
      </Button>
      <Button
        onClick={() => onDownload(card.path, card.name)}
        variant="outline"
        size="icon"
        className="absolute top-2 right-12"
      >
        <Download />
      </Button>
    </div>
    <CardContent
      onClick={() => onClick(card.id, card.path)}
      className="flex flex-col items-center justify-center mt-4"
    >
      {fileType === 'drawing' || fileType === 'jobCard' ? (
        <PdfThumbnail url={card.path} width={250} />
      ) : (
        <iframe src={card.path} />
      )}
    </CardContent>
    <CardHeader>
      <CardTitle className="text-sm ">{card.name.split('.')[0]}</CardTitle>
    </CardHeader>
  </Card>
);

export default FileCard;
