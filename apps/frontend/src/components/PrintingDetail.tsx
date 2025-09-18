import React, { useState } from 'react';
import { Pencil, Check } from 'lucide-react'; // Or any icon lib you're using
import { Button } from '@prodgenie/libs/ui'; // from ShadCN

interface PrintingDetailItem {
  printingDetail: string;
  printingColour: string;
  printingLocation: string;
}

interface PrintingDetailProps {
  printingDetails: PrintingDetailItem[];
}

const PrintingDetail: React.FC<PrintingDetailProps> = ({ printingDetails }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableDetails, setEditableDetails] =
    useState<PrintingDetailItem[]>(printingDetails);

  const handleChange = (
    index: number,
    key: keyof PrintingDetailItem,
    value: string
  ) => {
    const updated = [...editableDetails];
    updated[index][key] = value;
    setEditableDetails(updated);
  };

  const handleConfirm = () => {
    console.log({ printingDetails: editableDetails });
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Pencil size={18} />
        <h2 className="text-lg font-semibold">Printing Details</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-muted-foreground hover:text-primary"
        ></button>
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
