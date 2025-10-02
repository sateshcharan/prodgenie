// import { useEffect, useState } from 'react';
// import {
//   Button,
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
//   Input,
// } from '@prodgenie/libs/ui';
// import { api } from '../utils';
// import { apiRoutes } from '@prodgenie/libs/constant';
// import axios from 'axios';

// interface Preset {
//   id: string;
//   name: string;
//   values: Record<string, any>;
// }

// interface PresetSelectorProps {
//   getValues: () => Record<string, any>; // from react-hook-form or similar
//   setValues: (values: Record<string, any>) => void;
//   activeDrawingId: string;
// }

// const PresetSelector = ({
//   getValues,
//   setValues,
//   activeDrawingId,
// }: PresetSelectorProps) => {
//   const [presets, setPresets] = useState<Preset[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedPreset, setSelectedPreset] = useState<string | undefined>();
//   const [presetName, setPresetName] = useState('');

//   // Fetch presets from backend
//   const fetchPresets = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get(
//         `${apiRoutes.workspace.base}/getWorkspaceConfig/preset.json`
//       );
//       const { data } = await axios.get(res.data.data.path);
//       const filteredData = data.filter((item: any) => {
//         return item.drawingId === activeDrawingId;
//       });
//       setPresets(filteredData || []);
//     } catch (err) {
//       console.error('Failed to fetch presets', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPresets();
//   }, []);

//   // Save current form values as a new preset
//   const handleSave = async () => {
//     try {
//       const values = getValues();
//       const res = await api.post('/api/jobCard/presets', {
//         drawingId: activeDrawingId,
//         name: presetName || `Preset ${presets.length + 1}`,
//         values,
//       });
//       setPresets([res.data, ...presets]);
//       setPresetName('');
//     } catch (err) {
//       console.error('Failed to save preset', err);
//     }
//   };

//   // Apply preset values to the form
//   const handleApply = (id: string) => {
//     const preset = presets.find((p) => p.id === id);
//     if (preset) {
//       setValues(preset.values);
//       setSelectedPreset(id);
//     }
//   };

//   return (
//     <div className="flex gap-2 items-center mb-4">
//       {/* Preset selector */}
//       <div>
//         <Select
//           value={selectedPreset}
//           onValueChange={handleApply}
//           disabled={loading || presets.length === 0}
//         >
//           <SelectTrigger className="w-[200px]">
//             <SelectValue placeholder={loading ? 'Loading…' : 'Choose Preset'} />
//           </SelectTrigger>
//           <SelectContent>
//             {presets.map((preset) => (
//               <SelectItem key={preset.id} value={preset.id}>
//                 {preset.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Button variant="outline" onClick={() => fetchPresets()}>
//           Refresh
//         </Button>
//       </div>

//       <div>
//         <Input
//           placeholder="Preset name"
//           value={presetName}
//           onChange={(e) => setPresetName(e.target.value)}
//           className="w-[180px]"
//         />
//         <Button onClick={handleSave}>Save Current</Button>
//       </div>
//     </div>
//   );
// };

// export default PresetSelector;

// ---------

import { useEffect, useState } from 'react';
import { BetweenHorizonalEnd, Plus, Trash } from 'lucide-react';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
} from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useModalStore, usePresetStore } from '@prodgenie/libs/store';

import { api } from '../utils';

interface Preset {
  id: string;
  name: string;
  drawingId: string;
  values: any;
}

interface PresetSelectorProps {
  getValues: () => Record<string, any>;
  setValues: (values: Record<string, any>) => void;
  activeDrawingId: string;
}

const PresetSelector = ({
  getValues,
  setValues,
  activeDrawingId,
}: PresetSelectorProps) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetName, setPresetName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loadedValues, setLoadedValues] = useState<Record<string, any> | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);
  const { openModal } = useModalStore();

  // Fetch presets from backend
  const fetchPresets = async () => {
    setLoading(true);
    try {
      const {
        data: {
          data: { data: presets },
        },
      } = await api.get(
        `${apiRoutes.workspace.base}/getWorkspaceConfig/preset.json`
      );
      const filteredPresets = presets.filter(
        (item: any) => item.drawingId === activeDrawingId
      );
      setPresets(filteredPresets || []);
    } catch (err) {
      console.error('Failed to fetch presets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, [activeDrawingId]);

  // Track changes in form values to detect "dirty" state
  useEffect(() => {
    if (!selectedPreset || !loadedValues) {
      setIsDirty(false);
      return;
    }
    const currentValues = getValues();
    setIsDirty(JSON.stringify(currentValues) !== JSON.stringify(loadedValues));
  });

  const handleSave = async () => {
    try {
      const values = getValues();

      if (selectedPreset) {
        // --- Update existing preset ---
        const updatedPresets = presets.map((p) =>
          p.id === selectedPreset
            ? { ...p, name: presetName || p.name, values }
            : p
        );
        await api.patch(
          `${apiRoutes.workspace.base}/setWorkspaceConfig/preset.json`,
          updatedPresets
        );
        setPresets(updatedPresets);
        setLoadedValues(values);
        setIsAdding(false);
        setPresetName('');
        setIsDirty(false);
      } else {
        // --- Add new preset ---
        const newPreset: Preset = {
          id: `preset-${crypto.randomUUID()}`,
          name: presetName || `Preset ${presets.length + 1}`,
          drawingId: activeDrawingId,
          values,
        };
        const combinedPresets = [newPreset, ...presets];

        await api.patch(
          `${apiRoutes.workspace.base}/setWorkspaceConfig/preset.json`,
          combinedPresets
        );
        setPresets(combinedPresets);
        setPresetName('');
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Failed to save preset', err);
    }
  };

  // --- Delete preset ---
  // const handleDelete = async (presetId: string) => {
  //   const updatedPresets = await openModal('workspace:deletePreset', {
  //     presets,
  //     presetId,
  //   });

  //   setPresets(updatedPresets);

  //   if (selectedPreset === presetId) {
  //     // Reset if the deleted preset was selected
  //     setSelectedPreset(null);
  //     setLoadedValues(null);
  //     setPresetName('');
  //     setIsDirty(false);
  //   }
  // };
  const handleDelete = (presetId: string) => {
  openModal('workspace:deletePreset', {
    presets,
    presetId,
    onDeleteSuccess: (updatedPresets: Preset[]) => {
      setPresets(updatedPresets);

      if (selectedPreset === presetId) {
        setSelectedPreset(null);
        setLoadedValues(null);
        setPresetName('');
        setIsDirty(false);
      }
    },
  });
};


  // Apply preset values to the form
  const handleApply = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      setValues(preset.values);
      setSelectedPreset(id);
      setLoadedValues(preset.values);
      setPresetName(preset.name);
      setIsDirty(false);
    }
  };

  // Clear all form values + reset dropdown + reset input
  const handleClear = () => {
    setValues({});
    setSelectedPreset(null);
    setPresetName('');
    setLoadedValues(null);
    setIsDirty(false);
  };

  return (
    <div className="flex gap-2 items-center mb-4">
      {!isAdding ? (
        // --- Select Mode ---
        <div className="flex gap-2 items-center">
          <Select
            value={selectedPreset ?? undefined}
            onValueChange={handleApply}
            disabled={loading || presets.length === 0}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue
                placeholder={loading ? 'Loading…' : 'Choose Preset'}
              />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>

          {selectedPreset ? (
            // --- If preset selected → show Update (disabled until dirty) ---
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!isDirty}
                onClick={handleSave}
              >
                <BetweenHorizonalEnd />
              </Button>
              <Button
                type="button"
                size="icon"
                onClick={() => handleDelete(selectedPreset)}
              >
                <Trash />
              </Button>
            </div>
          ) : (
            // --- If no preset selected → show Add ---
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdding(true)}
            >
              <Plus />
            </Button>
          )}
        </div>
      ) : (
        // --- Add / Update Mode ---
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Preset name"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="w-[180px]"
          />
          <Button type="button" variant="outline" onClick={handleSave}>
            Save Preset
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAdding(false)}
          >
            ←
          </Button>
        </div>
      )}
    </div>
  );
};

export default PresetSelector;
