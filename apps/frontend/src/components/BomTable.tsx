import { Button } from '@prodgenie/libs/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const BomTable = ({ bom, fileId }: { bom: BomItem[]; fileId: string }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>(() =>
    bom.map((item) => item.slNo)
  );
  const navigate = useNavigate();

  const toggleSelection = (slNo: string) => {
    setSelectedItems((prev) =>
      prev.includes(slNo)
        ? prev.filter((item) => item !== slNo)
        : [...prev, slNo]
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-2">Sl No.</th>
            <th className="border px-2 py-2">Description</th>
            <th className="border px-2 py-2">Material</th>
            {/* <th className="border px-2 py-2">Specification</th>
            <th className="border px-2 py-2">ECT/BS</th>
            <th className="border px-2 py-2">Length</th>
            <th className="border px-2 py-2">Width</th>
            <th className="border px-2 py-2">Height</th> */}
            <th className="border px-2 py-2">Qty</th>
            <th className="border px-2 py-2">Select</th>
          </tr>
        </thead>
        <tbody>
          {bom.map((item) => (
            <tr key={item.slNo}>
              <td className="border px-2 py-2">{item.slNo}</td>
              <td className="border px-2 py-2">{item.description}</td>
              <td className="border px-2 py-2">{item.material}</td>
              {/* <td className="border px-2 py-2">{item.specification}</td>
              <td className="border px-2 py-2">{item.ectBs}</td>
              <td className="border px-2 py-2">{item.length}</td>
              <td className="border px-2 py-2">{item.width}</td>
              <td className="border px-2 py-2">{item.height}</td> */}
              <td className="border px-2 py-2">{item.qty}</td>
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
      <p className="mt-4">
        Selected Items: {selectedItems.length}/{bom.length}
      </p>
      <Button
        className="mt-4"
        // onClick={() => navigate(`/dashboard/job_cards/${fileId}`)}
        onClick={() => {
          axios.post('/api/jobCard/generate', {
            bom: bom.filter((item) => selectedItems.includes(item.slNo)),
          });
          // navigate(`/dashboard/job_cards`);
        }}
      >
        Generate Job Cards
      </Button>
    </div>
  );
};

export default BomTable;
