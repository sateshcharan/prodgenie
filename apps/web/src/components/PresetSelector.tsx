import { useEffect, useState } from 'react';
import { BetweenHorizonalEnd, Plus, Trash } from 'lucide-react';

import { Button } from '@prodgenie/libs/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@prodgenie/libs/ui/select';
import { Input } from '@prodgenie/libs/ui/input';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useModalStore, usePresetStore } from '@prodgenie/libs/store';

import api from '../utils/api';

interface Preset {
  id: string;
  name: string;
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
  const [isDirty, setIsDirty] = useState(false);
  const [presets, setPresets] = useState<Record<string, Preset[]>>({});
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetName, setPresetName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loadedValues, setLoadedValues] = useState<Record<string, any> | null>(
    null
  );

  const { openModal } = useModalStore();

  // --- Derived helper ---
  const currentDrawingPresets = presets[activeDrawingId] || [];

  // --- Fetch presets ---
  useEffect(() => {
    const fetchPresets = async () => {
      setLoading(true);
      try {
        const {
          data: {
            data: { data },
          },
        } = await api.get(
          `${apiRoutes.workspace.base}/getWorkspaceConfig/preset.json`
        );

        // Expecting backend data like: { [drawingId]: Preset[] }
        setPresets(data || {});
      } catch (err) {
        console.error('Failed to fetch presets', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPresets();
  }, [activeDrawingId]);

  // --- Detect dirty form ---
  useEffect(() => {
    if (!selectedPreset || !loadedValues) {
      setIsDirty(false);
      return;
    }
    const currentValues = getValues();
    setIsDirty(JSON.stringify(currentValues) !== JSON.stringify(loadedValues));
  });

  // --- Save preset (add or update) ---
  const handleSave = async () => {
    try {
      const values = getValues();

      if (selectedPreset) {
        // --- Update existing preset ---
        const updatedPresets = currentDrawingPresets.map((p) =>
          p.id === selectedPreset
            ? { ...p, name: presetName || p.name, values }
            : p
        );

        const updatedAll = { ...presets, [activeDrawingId]: updatedPresets };

        await api.patch(
          `${apiRoutes.workspace.base}/updateWorkspaceConfig/preset.json`,
          updatedAll
        );

        setPresets(updatedAll);
        setLoadedValues(values);
        setIsAdding(false);
        setPresetName('');
        setIsDirty(false);
      } else {
        // --- Add new preset ---
        const newPreset: Preset = {
          id: `preset-${crypto.randomUUID()}`,
          name: presetName || `Preset ${currentDrawingPresets.length + 1}`,
          values,
        };

        const updatedAll = {
          ...presets,
          [activeDrawingId]: [newPreset, ...currentDrawingPresets],
        };

        await api.patch(
          `${apiRoutes.workspace.base}/updateWorkspaceConfig/preset.json`,
          updatedAll
        );

        setPresets(updatedAll);
        setPresetName('');
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Failed to save preset', err);
    }
  };

  // --- Delete preset ---
  const handleDelete = (presetId: string) => {
    const deletedList = presets[activeDrawingId]?.filter(
      (p) => p.id !== presetId
    );

    const filteredPresets = {
      [activeDrawingId]: deletedList,
    };

    openModal('workspace:deletePreset', {
      presets: filteredPresets,
      onDeleteSuccess: () => {
        setPresets((prev) => {
          const currentList = prev[activeDrawingId] || [];
          const filtered = currentList.filter((p) => p.id !== presetId);

          return {
            ...prev,
            [activeDrawingId]: filtered,
          };
        });

        if (selectedPreset === presetId) {
          setSelectedPreset(null);
          setLoadedValues(null);
          setPresetName('');
          setIsDirty(false);
        }
      },
    });
  };

  // --- Apply preset ---
  const handleApply = (id: string) => {
    const preset = currentDrawingPresets.find((p) => p.id === id);
    if (preset) {
      setValues(preset.values);
      setSelectedPreset(id);
      setLoadedValues(preset.values);
      setPresetName(preset.name);
      setIsDirty(false);
    }
  };

  // --- Clear form ---
  const handleClear = () => {
    setValues({});
    setSelectedPreset(null);
    setPresetName('');
    setLoadedValues(null);
    setIsDirty(false);
  };

  // --- JSX ---
  return (
    <div className="flex gap-2 items-center mb-4">
      {!isAdding ? (
        <div className="flex gap-2 items-center">
          <Select
            key={selectedPreset || 'none'}
            value={selectedPreset || undefined}
            onValueChange={handleApply}
            disabled={loading || currentDrawingPresets.length === 0}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue
                placeholder={loading ? 'Loading…' : 'Choose Preset'}
              />
            </SelectTrigger>
            <SelectContent>
              {currentDrawingPresets.map((preset) => (
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
