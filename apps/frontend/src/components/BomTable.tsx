import React, { useState } from 'react';
import { Pencil, Check } from 'lucide-react';

import { Button } from '@prodgenie/libs/ui';
import { useBomStore } from '@prodgenie/libs/store';

interface BomItem {
  slNo: string;
  description: string;
  material: string;
  specification: string;
  ectBs: string;
  length: string;
  width: string;
  height: string;
  qty: string;
}

const BomTable = ({
  bom,
  fileId,
  setActiveItem,
}: {
  bom: BomItem[];
  fileId: string;
  setActiveItem: (item: string) => void;
}) => {
  const { setSelectedItems, selectedItems } = useBomStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editableBom, setEditableBom] = useState<BomItem[]>(bom);

  const toggleSelection = (slNo: string) => {
    setSelectedItems((prev) =>
      prev.includes(slNo)
        ? prev.filter((item) => item !== slNo)
        : [...prev, slNo]
    );
  };

  const handleChange = (index: number, key: keyof BomItem, value: string) => {
    setEditableBom((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleConfirm = () => {
    console.log({ bom: editableBom });
    setIsEditing(false);
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">BOM</h2>
        <button
          onClick={() => {
            setEditableBom(bom); // reset to original on every new edit
            setIsEditing(!isEditing);
          }}
          className="text-muted-foreground hover:text-primary"
        >
          <Pencil size={18} />
        </button>
      </div>

      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 text-black">
            <th className="border px-2 py-2">Sl No.</th>
            <th className="border px-2 py-2">Length</th>
            <th className="border px-2 py-2">Width</th>
            <th className="border px-2 py-2">Height</th>
            <th className="border px-2 py-2">Material</th>
            <th className="border px-2 py-2">Specification</th>
            <th className="border px-2 py-2">Description</th>
            <th className="border px-2 py-2">Qty</th>
            <th className="border px-2 py-2 text-center">Select</th>
          </tr>
        </thead>
        <tbody>
          {editableBom.map((item, index) => (
            <tr key={index}>
              <td className="border px-2 py-2">{index + 1}</td>

              {(
                [
                  'length',
                  'width',
                  'height',
                  'material',
                  'specification',
                  'description',
                  'qty',
                ] as const
              ).map((field) => (
                <td key={field} className="border px-2 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={item[field]}
                      onChange={(e) =>
                        handleChange(index, field, e.target.value)
                      }
                      className="border rounded px-1 py-0.5 w-full"
                    />
                  ) : (
                    item[field]
                  )}
                </td>
              ))}

              <td className="border px-2 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.slNo)}
                  onChange={() => toggleSelection(item.slNo)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 text-right">
        Selected Items: {selectedItems.length}/{bom.length}
      </p>

      {isEditing && (
        <div className="mt-4 text-right">
          <Button
            onClick={handleConfirm}
            className="flex items-center gap-2 ml-auto"
          >
            <Check size={16} /> Confirm Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default BomTable;
