import React, { useState } from 'react';
import { Pencil, Check, Plus } from 'lucide-react';
import { Button, Input } from '@prodgenie/libs/ui';
import { api } from '../utils';
import { apiRoutes } from '@prodgenie/libs/constant';

interface TitleBlockProps {
  titleBlock: Record<string, string | number>;
  fileId: string;
}

const TitleBlock: React.FC<TitleBlockProps> = ({ titleBlock, fileId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableBlock, setEditableBlock] = useState(titleBlock);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleChange = (key: string, value: string) => {
    setEditableBlock((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddField = () => {
    if (!newKey.trim()) return;
    setEditableBlock((prev) => ({
      ...prev,
      [newKey.trim()]: newValue,
    }));
    setNewKey('');
    setNewValue('');
  };

  const handleConfirm = async () => {
    const updatedData = { titleBlock: editableBlock };
    const result = await api.patch(
      `${apiRoutes.files.base}/${fileId}`,
      updatedData
    );
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Pencil size={18} />
        <h2 className="text-lg font-semibold">Title Block Details</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-muted-foreground hover:text-primary"
        ></button>
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

        {isEditing && (
          <div className="flex gap-2 items-center mt-2">
            <Input
              placeholder="New Field Key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
            <Input
              placeholder="New Field Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddField}
              className="flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </Button>
          </div>
        )}
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
