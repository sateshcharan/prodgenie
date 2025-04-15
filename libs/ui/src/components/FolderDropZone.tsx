import { useState } from 'react';
import { FolderDropzone } from '../';

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <FolderDropzone onFilesSelected={(f) => setFiles(f)} />
      <ul className="text-sm text-muted-foreground space-y-1">
        {files.map((file, i) => (
          <li key={i}>{file.webkitRelativePath || file.name}</li>
        ))}
      </ul>
    </div>
  );
}
