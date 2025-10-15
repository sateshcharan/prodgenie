import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
  Button,
  Input,
} from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useModalStore } from '@prodgenie/libs/store';
import { api } from '../../utils';

export default function DuplicateFile({
  title,
  description,
  submitUrl,
  fileId,
  fileType,
  onUploadSuccess,
}: any) {
  const [loading, setLoading] = useState(false);
  const [duplicateFileName, setDuplicateFileName] = useState('');

  const { closeModal } = useModalStore();

  const duplicateFile = async () => {
    if (!duplicateFileName.trim()) {
      toast.error('Please enter a name for the duplicate file.');
      return;
    }

    try {
      setLoading(true);
      // Example API call
      const { data } = await api.post(submitUrl, {
        fileId,
        duplicateFileName,
      });
      console.log(data);
      onUploadSuccess?.();
      toast.success('File duplicated successfully!');
      closeModal();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to duplicate file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex gap-4">
        <Input
          type="text"
          placeholder="Enter new name for duplicate"
          value={duplicateFileName}
          onChange={(e) => setDuplicateFileName(e.target.value)}
        />
        <Button onClick={duplicateFile} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </CardContent>
    </Card>
  );
}
