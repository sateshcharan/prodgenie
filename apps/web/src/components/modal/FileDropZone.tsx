import { toast } from 'sonner';
import { useState } from 'react';

import api from '../../utils/api';

import {
  CardDescription,
  CardHeader,
  CardContent,
  CardTitle,
  Card,
} from '@prodgenie/libs/ui/card';
import { Button } from '@prodgenie/libs/ui/button';
import { ScrollArea } from '@prodgenie/libs/ui/scroll-area';
import { useModalStore } from '@prodgenie/libs/store';
import { useAddDialogStore } from '@prodgenie/libs/store';
import { useWorkspaceStore } from '@prodgenie/libs/store';
import { FileDropzone } from '@prodgenie/libs/ui/components/FileDropzone';

interface DialogDropZoneProps {
  title: string;
  description?: string;
  submitUrl: string;
  onUploadSuccess?: () => void;
  multiple?: boolean;
}

export default function FileDropZone({
  title,
  description,
  submitUrl,
  onUploadSuccess,
  multiple = true,
}: DialogDropZoneProps) {
  const { modalProps } = useModalStore();
  const { isOpen, close } = useAddDialogStore();
  const { activeWorkspace } = useWorkspaceStore();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    if (multiple) {
      setSelectedFiles(files);
    } else {
      setSelectedFiles(files.length > 0 ? [files[0]] : []);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const formData = new FormData();

    selectedFiles.forEach((file) => formData.append('files', file));

    if (activeWorkspace?.id) {
      formData.append('activeWorkspace', JSON.stringify(activeWorkspace));
    }

    try {
      await api.post(submitUrl, formData);
      toast.success('upload successful');
      onUploadSuccess?.();
      close();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('upload failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{modalProps?.title}</CardTitle>
        <CardDescription>{modalProps?.description}</CardDescription>
      </CardHeader>

      <CardContent>
        {!selectedFiles.length && (
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            multiple={multiple}
          />
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
      </CardContent>
    </Card>
  );
}
