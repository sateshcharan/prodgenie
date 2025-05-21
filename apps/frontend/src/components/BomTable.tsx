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

  // Toggle selection of BOM item
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
          <tr className="bg-gray-100 text-black">
            <th className="border px-2 py-2">Sl No.</th>
            <th className="border px-2 py-2">Description</th>
            <th className="border px-2 py-2">Material</th>
            <th className="border px-2 py-2">Qty</th>
            <th className="border px-2 py-2 text-center">Select</th>
          </tr>
        </thead>
        <tbody>
          {bom.map((item, index) => (
            <tr key={index}>
              <td className="border px-2 py-2">{index + 1}</td>
              <td className="border px-2 py-2">{item.description}</td>
              <td className="border px-2 py-2">{item.material}</td>
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
    </div>
  );
};

export default BomTable;
