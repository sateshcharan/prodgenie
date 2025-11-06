import React, { useCallback, useState } from 'react';
import { Pencil, Check, Plus } from 'lucide-react'; // Or any icon lib you're using
import { Button } from '@prodgenie/libs/ui'; // from ShadCN
import { api } from '../utils';
import { apiRoutes } from '@prodgenie/libs/constant';

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

  const handleConfirm = useCallback(async () => {
    const updatedData = { printingDetails: editableDetails };

    await api.patch(
      `${apiRoutes.files.base}/updateFileData/${fileId}`,
      updatedData
    );

    setIsEditing(false);
  }, [editableDetails, fileId]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <Check size={18} /> : <Pencil size={18} />}
        </Button>

        <h2 className="text-lg font-semibold">Printing Details</h2>

        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            className="ml-2 flex items-center gap-1"
            onClick={handleAddRow}
          >
            <Plus size={14} /> Add Row
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {editableDetails.map((item, index) => (
          <div key={index} className="text-sm text-gray-700 space-y-1">
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
                    className="border border-gray-300 rounded px-2 py-0.5 text-sm"
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
        <div className="mt-4">
          <Button onClick={handleConfirm} className="flex items-center gap-2">
            <Check size={16} /> Confirm
          </Button>
        </div>
      )}
    </div>
  );
};

export default PrintingDetail;
