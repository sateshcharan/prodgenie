// import axios from 'axios';
// import { useState, useEffect } from 'react';

// import { api } from '../utils';
// import { TableBuilder } from './TableBuilder';

// import { Button } from '@prodgenie/libs/ui';
// import { apiRoutes } from '@prodgenie/libs/constant';

// const MaterialBuilder = () => {
//   const [materials, setMaterials] = useState([{ material: '', thickness: 0 }]);

//   useEffect(() => {
//     const fetchMaterials = async () => {
//       try {
//         const response = await api.get(
//           `${apiRoutes.files.base}/getByName/material.json`
//         );
//         const signedUrl = response.data.data.signedUrl;
//         const { data } = await axios.get(signedUrl);

//         // Convert [{ "7ply": 15 }] => [{ material: "7ply", thickness: 15 }]
//         const parsed = Object.entries(data).map((entry: any) => {
//           const [material, thickness] = entry;
//           return { material, thickness };
//         });

//         setMaterials(parsed);
//       } catch (error) {
//         console.error('Error fetching materials:', error);
//       }
//     };

//     fetchMaterials();
//   }, []);

//   const handleChange = (
//     index: number,
//     field: 'material' | 'thickness',
//     value: string | number
//   ) => {
//     setMaterials((prev) =>
//       prev.map((entry, i) =>
//         i === index ? { ...entry, [field]: value } : entry
//       )
//     );
//   };

//   const addRow = () => {
//     setMaterials((prev) => [...prev, { material: '', thickness: 0 }]);
//   };

//   const removeRow = (index: number) => {
//     setMaterials((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleSave = () => {
//     const materialList = materials
//       .filter(
//         (entry) => entry.material.trim() !== '' && Number(entry.thickness) > 0
//       )
//       .map((entry) => ({
//         [entry.material.trim()]: Number(entry.thickness),
//       }));

//     console.log('✅ Saved material data:', materialList);

//     // Optionally send to backend:
//     // await api.post('/api/materials/save', materialList);
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-4 bg-white border rounded shadow space-y-4">
//       <h2 className="text-lg font-semibold">Material Builder</h2>

//       <div className="grid grid-cols-3 gap-2 font-semibold text-sm border-b pb-2">
//         <div>Material</div>
//         <div>Thickness (mm)</div>
//         <div></div>
//       </div>

//       {materials.map((entry, index) => (
//         <div key={index} className="grid grid-cols-3 gap-2 items-center mb-2">
//           <input
//             type="text"
//             placeholder="e.g. 7ply"
//             value={entry.material}
//             onChange={(e) => handleChange(index, 'material', e.target.value)}
//             className="border rounded px-2 py-1 text-sm"
//           />
//           <input
//             type="number"
//             placeholder="e.g. 15"
//             value={entry.thickness}
//             onChange={(e) =>
//               handleChange(index, 'thickness', parseFloat(e.target.value) || 0)
//             }
//             className="border rounded px-2 py-1 text-sm"
//           />
//           <button
//             onClick={() => removeRow(index)}
//             className="text-red-500 hover:text-red-700 text-sm"
//             disabled={materials.length === 1}
//           >
//             ✕
//           </button>
//         </div>
//       ))}

//       <div className="flex items-center gap-4">
//         <Button onClick={addRow} variant="outline">
//           + Add Row
//         </Button>
//         <Button onClick={handleSave} disabled={materials.length === 0}>
//           Save
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default MaterialBuilder;

// MaterialBuilder.tsx
import axios from 'axios';
import { api } from '../utils';
import { apiRoutes } from '@prodgenie/libs/constant';
import TableBuilder from './TableBuilder';
import { toast } from 'sonner';

export default function MaterialBuilder() {
  const fetchMaterials = async () => {
    const res = await api.get(
      `${apiRoutes.files.base}/getByName/material.json`
    );
    const signedUrl = res.data?.data?.signedUrl;
    if (!signedUrl) return [];

    const { data } = await axios.get(signedUrl);
    return Object.entries(data).map(([material, thickness]) => ({
      material,
      thickness,
    }));
  };

  const handleSave = (rows: { material: string; thickness: number }[]) => {
    const materialList = rows
      .filter((entry) => entry.material.trim() !== '' && entry.thickness > 0)
      .map((entry) => ({
        [entry.material.trim()]: entry.thickness,
      }));
    toast.success('✅ Saved material data');
  };

  return (
    <TableBuilder
      initialData={[{ material: '', thickness: 0 }]}
      columns={[
        {
          key: 'material',
          label: 'Material',
          type: 'text',
          placeholder: 'e.g. 7ply',
        },
        {
          key: 'thickness',
          label: 'Thickness (mm)',
          type: 'number',
          placeholder: 'e.g. 15',
        },
      ]}
      fetchData={fetchMaterials}
      onSave={handleSave}
    />
  );
}
