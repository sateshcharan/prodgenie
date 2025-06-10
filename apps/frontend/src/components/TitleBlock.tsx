import React, { useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { Button } from '@prodgenie/libs/ui'; // shadcn/ui
import { api } from '../utils';
import { apiRoutes } from '@prodgenie/libs/constant';

interface TitleBlockProps {
  titleBlock: Record<string, string | number>;
  fileId: string;
}

const TitleBlock: React.FC<TitleBlockProps> = ({ titleBlock, fileId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableBlock, setEditableBlock] = useState(titleBlock);

  const handleChange = (key: string, value: string) => {
    setEditableBlock((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // const updateLocalStorageData = (fileId: string, updatedData: any) => {
  //   const key = `tables-${fileId}`;

  //   // Get existing data or empty object
  //   const cached = localStorage.getItem(key);
  //   let parsedData = {};

  //   try {
  //     parsedData = cached ? JSON.parse(cached) : {};
  //   } catch (e) {
  //     console.warn(`Failed to parse localStorage for ${key}`, e);
  //   }

  //   // Merge updated data into existing cache
  //   const mergedData = {
  //     ...parsedData.data,
  //     ...updatedData,
  //   };

  //   console.log(mergedData)

  //   // Save back to localStorage
  //   localStorage.setItem(key, JSON.stringify(mergedData));
  // };

  const handleConfirm = async () => {
    const updatedData = { titleBlock: editableBlock };
    const result = await api.patch(
      `${apiRoutes.files.base}/${fileId}`,
      updatedData
    );

    // updateLocalStorageData(fileId, updatedData);

    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Title Block Details</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-muted-foreground hover:text-primary"
        >
          <Pencil size={18} />
        </button>
      </div>

      <div className="space-y-1 text-sm text-gray-700">
        {Object.entries(editableBlock).map(([key, value]) => (
          <div key={key}>
            <strong className="capitalize">{key}:</strong>{' '}
            {isEditing ? (
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className="border border-gray-300 rounded px-2 py-0.5 text-sm"
              />
            ) : (
              <span>{value}</span>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="mt-4">
          <Button onClick={handleConfirm} className="flex items-center gap-2">
            <Check size={16} /> Confirm
          </Button>
        </div>
      )}
    </div>
  );
};

export default TitleBlock;
