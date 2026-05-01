import { Pencil, Check, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@prodgenie/libs/ui/button';
import { apiRoutes } from '@prodgenie/libs/constant';

import api from '../utils/api';

interface PrintingDetailItem {
  printingDetail: string;
  printingColour: string;
  printingLocation: string;
}

interface PrintingDetailProps {
  printingDetails: PrintingDetailItem[];
  fileId: string;
}

const PrintingDetail: React.FC<PrintingDetailProps> = ({
  printingDetails,
  fileId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableDetails, setEditableDetails] =
    useState<PrintingDetailItem[]>(printingDetails);

  // Update local editable state when prop changes
  useEffect(() => {
    if (Array.isArray(printingDetails)) {
      setEditableDetails(printingDetails);
    } else {
      setEditableDetails([]);
    }
  }, [printingDetails]);

  const handleChange = (
    index: number,
    key: keyof PrintingDetailItem,
    value: string
  ) => {
    setEditableDetails((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleAddRow = () => {
    const newRow: PrintingDetailItem = {
      printingDetail: '',
      printingColour: '',
      printingLocation: '',
    };
    setEditableDetails((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    setEditableDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = useCallback(async () => {
    const updatedData = { printingDetails: editableDetails };

    await api.patch(
      `${apiRoutes.files.base}/updateFileData/${fileId}`,
      updatedData
    );

    setIsEditing(false);
  }, [editableDetails, fileId]);

  const handleCancel = () => {
    setEditableDetails(printingDetails);
    setIsEditing(false);
  };

  if (!printingDetails) {
    return (
      <div className="text-sm text-gray-500 italic">
        Loading printing details...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <Check size={18} /> : <Pencil size={18} />}
        </Button>

        <h2 className="text-lg font-semibold">Printing Details</h2>

        {isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-2 flex items-center gap-1"
            onClick={handleAddRow}
          >
            <Plus size={14} /> Add Block
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {editableDetails.map((item, index) => (
          <div
            key={index}
            className="text-sm space-y-1 border p-3 rounded-md relative"
          >
            {/* 🗑 Delete button */}
            {isEditing && (
              <button
                onClick={() => handleDeleteRow(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            )}

            {Object.entries(item).map(([key, value]) => (
              <div key={key}>
                <strong className="capitalize">{key}:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      handleChange(
                        index,
                        key as keyof PrintingDetailItem,
                        e.target.value
                      )
                    }
                    className="border border-gray-300 rounded px-2 py-0.5 text-sm bg-background"
                  />
                ) : (
                  <span>{value}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="mt-4 flex gap-2 items-center">
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2"
          >
            <Check size={16} /> Confirm
          </Button>

          <Button
            type="button"
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

export default PrintingDetail;
