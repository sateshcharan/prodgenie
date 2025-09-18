import React, { useEffect, useState } from 'react';
import { Pencil, Check } from 'lucide-react';

import { Button } from '@prodgenie/libs/ui';
import { useBomStore } from '@prodgenie/libs/store';
import { apiRoutes } from '@prodgenie/libs/constant';
import { api } from '../utils';
import axios from 'axios';

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
  const [bomHeaders, setBomHeaders] = useState<string[]>([]);

  const toggleSelection = (slNo: string) => {
    setSelectedItems((prev) =>
      prev.includes(slNo)
        ? prev.filter((item) => item !== slNo)
        : [...prev, slNo]
    );
  };

  const handleChange = (index: number, key: any, value: string) => {
    setEditableBom((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleConfirm = () => {
    console.log({ bom: editableBom });
    setIsEditing(false);
  };

  useEffect(() => {
    const fetchBOM = async (fileId: string) => {
      const response = await api.get(
        `${apiRoutes.files.base}/getByName/bom.json`
      );
      const bom = response.data.data.signedUrl;
      const bomJson = await axios.get(bom);
      setBomHeaders(bomJson.data.bomItem.header.expected);
    };
    fetchBOM(fileId);
  }, [fileId]);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-start gap-2 mb-2">
        <Pencil size={18} />
        <h2 className="text-lg font-semibold">BOM</h2>
        <button
          onClick={() => {
            setEditableBom(bom); // reset to original on every new edit
            setIsEditing(!isEditing);
          }}
          className="text-muted-foreground hover:text-primary"
        ></button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-black">
              {bomHeaders.map((header) => (
                <th key={header} className="border px-2 py-2">
                  {header}
                </th>
              ))}

              <th className="border px-2 py-2 text-center">Select</th>
            </tr>
          </thead>
          <tbody>
            {editableBom.map((item: any, index: number) => (
              <tr key={index}>
                {bomHeaders.map((field) => (
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
      </div>

      <p className="mt-4 text-left mb-2">
        Selected Items: {selectedItems.length}/{bom.length}
      </p>

      {isEditing && (
        <Button
          onClick={handleConfirm}
          className="flex items-center gap-2 ml-0 my-4"
        >
          <Check size={16} /> Confirm Changes
        </Button>
      )}
    </div>
  );
};

export default BomTable;
