import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Pencil, Check, Plus, Trash2 } from 'lucide-react';

import { useBomStore } from '@prodgenie/libs/store';
import { apiRoutes } from '@prodgenie/libs/constant';
import { Button } from '@prodgenie/libs/ui/button';
import { ScrollBar, ScrollArea } from '@prodgenie/libs/ui/scroll-area';

import api from '../utils/api';

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

  // Update local editable state when prop changes
  useEffect(() => {
    if (Array.isArray(bom)) {
      setEditableBom(bom);
      setSelectedItems(bom.map((item: any) => item.slNo));
    } else {
      setEditableBom([]);
      setSelectedItems([]);
    }
  }, [bom, setSelectedItems]);

  useEffect(() => {
    const fetchBOM = async () => {
      const {
        data: {
          data: { data: bomJson },
        },
      } = await api.get(
        `${apiRoutes.workspace.base}/getWorkspaceConfig/bom.json`
      );
      setBomHeaders(bomJson.bom.header.expected);
    };
    fetchBOM();
  }, [fileId]);

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

  const handleAddRow = () => {
    const newRow: any = {};
    bomHeaders.forEach((header) => {
      newRow[header] = ''; // default empty string for new fields
    });
    // Generate a temporary slNo if missing
    newRow.slNo = String(editableBom.length + 1);
    setEditableBom((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = useCallback(
    (index: number) => {
      setEditableBom((prev) => {
        const itemToDelete = prev[index];

        // remove from selectedItems also
        setSelectedItems((selected) =>
          selected.filter((sl) => sl !== itemToDelete.slNo)
        );

        return prev.filter((_, i) => i !== index);
      });
    },
    [setSelectedItems]
  );

  const handleConfirm = useCallback(async () => {
    const updatedData = { bom: editableBom };

    await api.patch(
      `${apiRoutes.files.base}/updateFileData/${fileId}`,
      updatedData
    );

    setIsEditing(false);
  }, [editableBom, fileId]);

  const handleCancel = useCallback(() => {
    setEditableBom(bom);
    setIsEditing(false);
  }, [bom]);

  if (!bom) {
    return (
      <div className="text-sm text-gray-500 italic">Loading BOM details...</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-start gap-2 mb-2">
        <Button
          type="button"
          size={'icon'}
          variant={'ghost'}
          onClick={() => {
            setEditableBom(bom); // reset to original on every new edit
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? <Check size={18} /> : <Pencil size={18} />}
        </Button>
        <h2 className="text-lg font-semibold">BOM</h2>
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-2 flex items-center gap-1"
            onClick={handleAddRow}
          >
            <Plus size={14} /> Add Row
          </Button>
        )}
      </div>

      <ScrollArea>
        <ScrollBar orientation="horizontal" />
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-black">
              <th className="border px-2 py-2 text-center">Select</th>
              {bomHeaders.map((header) => (
                <th key={header} className="border px-2 py-2">
                  {header}
                </th>
              ))}
              {isEditing && (
                <th className="border px-2 py-2 text-center">Delete</th>
              )}
            </tr>
          </thead>
          <tbody>
            {editableBom.map((item: any, index: number) => (
              <tr key={index}>
                {/* Select */}
                <td className="border px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedItems?.includes(item.slNo)}
                    onChange={() => toggleSelection(item.slNo)}
                  />
                </td>

                {/* Fields */}
                {bomHeaders.map((field) => (
                  <td key={field} className="border px-2 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item[field]}
                        onChange={(e) =>
                          handleChange(index, field, e.target.value)
                        }
                        className="border rounded px-1 py-0.5 w-full bg-background"
                      />
                    ) : (
                      item[field]
                    )}
                  </td>
                ))}

                {/* Delete */}
                {isEditing && (
                  <td className="border px-2 py-2 text-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteRow(index)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>

      <p className="mt-4 text-left mb-2">
        Selected Items: {selectedItems?.length}/{bom?.length}
      </p>

      {isEditing && (
        <div className="flex gap-2 justify-start">
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 ml-0 my-4"
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

export default BomTable;
