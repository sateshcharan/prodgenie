import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '../card';
import { Button } from '../button';
import { UploadCloud } from 'lucide-react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  onFilesSelected,
  multiple = true,
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
    multiple,
    accept: {
      'application/json': ['.json'],
      'application/pdf': ['.pdf'],
      'text/html': ['.html', '.htm'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      ...accept,
    },
  });

  return (
    <Card
      {...getRootProps()}
      className={`flex flex-col items-center justify-center border-2 border-dashed border-muted p-6 rounded-2xl text-center cursor-pointer transition-all ${
        isDragActive ? 'bg-muted/50' : 'bg-muted/20'
      }`}
    >
      <input
        {...getInputProps()}
        // {...({
        //   webkitdirectory: '',
        //   directory: '',
        // } as any)}
      />
      <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">
        {multiple
          ? 'Drag and drop files here, or'
          : 'Drag and drop a file here, or'}
      </p>
      <Button type="button" variant="outline" className="mt-3" onClick={open}>
        Browse
      </Button>
    </Card>
  );
};
