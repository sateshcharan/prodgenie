import { useState } from 'react';
import axios from 'axios';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../dialog';

import { useEditDialogStore } from '@prodgenie/libs/store';
import { FileDropzone } from './FileDropzone';
import { ScrollArea } from '../scroll-area';
import { Button } from '../button';
import { toast } from 'sonner';
interface DialogEditFileProps {
  title: string;
  description?: string;
  submitUrl: string;
  onUploadSuccess?: () => void;
  fileId: string;
  onOpenChange?: (open: boolean) => void; // ✅ add this
}

export function DialogEditFile({
  title,
  description,
  submitUrl,
  onUploadSuccess,
  fileId,
  onOpenChange,
}: DialogEditFileProps) {
  const { isOpen, close } = useEditDialogStore();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('files', file));

    try {
      await axios.post(submitUrl, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      toast.success('upload successful');

      if (onUploadSuccess) {
        onUploadSuccess(); // 👈 Notify parent
      }
      close();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && typeof onOpenChange === 'function') {
          onOpenChange(open); // ✅ notify parent when closed
        }
        close(); // existing logic
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {!selectedFiles.length && (
          <FileDropzone onFilesSelected={handleFilesSelected} />
        )}

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Files selected:</h4>
            <ScrollArea className="max-h-40 pr-2">
              <ul className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <li
                    key={index}
                    className="text-sm border p-2 rounded-md flex items-center justify-between"
                  >
                    <div className="truncate w-3/4">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <div className="w-full flex justify-end gap-2 mt-4">
              <Button onClick={handleFileUpload}>Confirm</Button>
              <Button
                variant="destructive"
                onClick={() => setSelectedFiles([])}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
