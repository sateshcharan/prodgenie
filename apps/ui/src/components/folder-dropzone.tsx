import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, Button } from '../';
import { UploadCloud } from 'lucide-react';

interface FolderDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const FolderDropzone: React.FC<FolderDropzoneProps> = ({
  onFilesSelected,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    // Important: enable folder uploads
    webkitdirectory: 'true' as any, // hack to allow folder input
    directory: 'true' as any,
  });

  return (
    <Card
      {...getRootProps()}
      className={`flex flex-col items-center justify-center border-2 border-dashed border-muted p-6 rounded-2xl text-center cursor-pointer transition-all ${
        isDragActive ? 'bg-muted/50' : 'bg-muted/20'
      }`}
    >
      <input {...getInputProps()} directory="" webkitdirectory="" />
      <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">
        Drag and drop a folder here, or
      </p>
      <Button type="button" variant="outline" className="mt-3" onClick={open}>
        Browse Folder
      </Button>
    </Card>
  );
};
