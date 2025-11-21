import { Pencil, Check, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@prodgenie/libs/ui/button';
import { Input } from '@prodgenie/libs/ui/input';

interface EditableFieldProps {
  label: string;
  type: string;
  value: string;
  onChange?: (val: string) => void;
  // onSave: (newValue: string) => Promise<void> | void;
  onSave: (update: { [key: string]: string }) => Promise<void> | void;
  className?: string;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  type,
  value,
  onSave,
  onChange,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);

  // Keep internal state in sync with prop
  useEffect(() => {
    setFieldValue(value);
  }, [value]);

  const handleSave = async () => {
    if (fieldValue.trim() !== value) {
      await onSave({ [type]: fieldValue.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFieldValue(value);
    setIsEditing(false);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <Input
          type={type}
          value={fieldValue}
          onChange={(e) => setFieldValue(e.target.value)}
          readOnly={!isEditing}
          className={!isEditing ? 'bg-muted cursor-default' : ''}
        />
        {isEditing ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleSave}>
              <Check className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
