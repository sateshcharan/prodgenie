import React, { useState, useCallback, useEffect } from 'react';
import { Pencil, Check, Plus, Trash2 } from 'lucide-react';

import { Button } from '@prodgenie/libs/ui/button';
import { Input } from '@prodgenie/libs/ui/input';
import { apiRoutes } from '@prodgenie/libs/constant';

import api from '../utils/api';

interface TitleBlockProps {
  titleBlock: Record<string, string | number>;
  fileId: string;
}

const TitleBlock: React.FC<TitleBlockProps> = ({ titleBlock, fileId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableBlock, setEditableBlock] = useState<
    Record<string, string | number>
  >({});
  const [newFields, setNewFields] = useState<{ key: string; value: string }[]>(
    []
  );

  // Update local editable state when prop changes
  useEffect(() => {
    if (titleBlock && typeof titleBlock === 'object') {
      setEditableBlock(titleBlock);
    } else {
      setEditableBlock({});
    }
  }, [titleBlock]);

  const handleChange = useCallback((key: string, value: string) => {
    setEditableBlock((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleAddField = useCallback(() => {
    setNewFields((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  const handleNewFieldChange = useCallback(
    (index: number, field: 'key' | 'value', value: string) => {
      setNewFields((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const handleDeleteField = useCallback((index: number) => {
    setNewFields((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDeleteExistingField = useCallback((key: string) => {
    setEditableBlock((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    const validNewFields = newFields.filter((f) => f.key.trim());
    const updatedData = {
      titleBlock: {
        ...editableBlock,
        ...Object.fromEntries(
          validNewFields.map(({ key, value }) => [key.trim(), value])
        ),
      },
    };

    await api.patch(
      `${apiRoutes.files.base}/updateFileData/${fileId}`,
      updatedData
    );

    setEditableBlock(updatedData.titleBlock);
    setNewFields([]);
    setIsEditing(false);
  }, [editableBlock, newFields, fileId]);

  const handleCancel = () => {
    setEditableBlock(titleBlock);
    setNewFields([]);
    setIsEditing(false);
  };

  if (!titleBlock) {
    return (
      <div className="text-sm text-gray-500 italic">
        Loading title block details...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? <Check size={18} /> : <Pencil size={18} />}
        </Button>
        <h2 className="text-lg font-semibold">Title Block Details</h2>
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-2 flex items-center gap-1"
            onClick={handleAddField}
          >
            <Plus size={14} /> Add Row
          </Button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {Object.entries(editableBlock).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <strong className="capitalize min-w-[120px]">{key}:</strong>
            {isEditing ? (
              <Input
                value={String(value ?? '')}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full"
              />
            ) : (
              <span>{value}</span>
            )}
            {isEditing && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDeleteExistingField(key)}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        ))}

        {isEditing &&
          newFields.map((field, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="New Field Key"
                value={field.key}
                onChange={(e) =>
                  handleNewFieldChange(index, 'key', e.target.value)
                }
              />
              <Input
                placeholder="New Field Value"
                value={field.value}
                onChange={(e) =>
                  handleNewFieldChange(index, 'value', e.target.value)
                }
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDeleteField(index)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
      </div>

      {isEditing && (
        <div className="mt-4 flex gap-2 items-center">
          <Button onClick={handleConfirm} className="flex items-center gap-2">
            <Check size={16} /> Confirm
          </Button>

          <Button
            onClick={handleCancel}
            className="flex items-center gap-2 ml-0 my-4"
            variant="outline"
          >
            <Trash2 size={16} /> Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default TitleBlock;
