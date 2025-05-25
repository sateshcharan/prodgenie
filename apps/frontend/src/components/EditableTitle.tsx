import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';

interface EditableTitleProps {
  value: string;
  onSave?: (newValue: string) => void;
  className?: string;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({
  value,
  onSave,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(value);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(value);
  }, [value]);

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => contentRef.current?.focus(), 0);
  };

  const handleSave = async () => {
    const newText = contentRef.current?.innerText.trim() || '';
    setTitle(newText);
    setIsEditing(false);
    if (newText !== value) onSave?.(newText);

    //call api to rename file
    const response = await fetch(`/api/files/${fileType}/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify({ newName: newText }),
    });
    const data = await response.json();
    console.log(data);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      className={`flex items-center justify-center gap-2 truncate ${className}`}
    >
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        className={`truncate ${isEditing ? 'border-b outline-none px-1' : ''}`}
      >
        {title}
      </div>
      {!isEditing ? (
        <Pencil
          size={16}
          className="cursor-pointer text-muted-foreground"
          onClick={handleEdit}
        />
      ) : (
        <Check
          size={16}
          className="cursor-pointer text-green-500"
          onClick={handleSave}
        />
      )}
    </div>
  );
};
