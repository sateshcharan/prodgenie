import { set } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Save, Trash, FolderSync } from 'lucide-react';

import { api, ExcelHTMLViewer } from '../../utils';
import FormulaBuilder from '../FormulaBuilder';
import { fetchFilesByType, getThumbnail } from '../../services/fileService';

import { apiRoutes } from '@prodgenie/libs/constant';
import { Button, Input } from '@prodgenie/libs/ui';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({
  file,
  onDelete,
}: {
  file: {
    id: string;
    name: string;
    path: string;
  };
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border p-2 rounded mb-4 bg-green-50 shadow-sm flex justify-between items-start"
    >
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <p className="font-medium text-sm">{file.name.split('.')[0]}</p>
          {/* ✅ Drag handle only */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400 hover:text-gray-600"
            title="Drag to reorder"
          >
            ☰
          </div>
        </div>
        <ExcelHTMLViewer url={file.path} />
      </div>

      {/* ✅ Fully clickable delete */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(file.id);
        }}
        className="text-red-500 hover:text-red-700 p-1"
        title="Delete section"
      >
        <Trash size={16} />
      </button>
    </div>
  );
};

const SequenceBuilder = () => {
  const [sequenceName, setSequenceName] = useState('');
  const [sequence, setSequence] = useState<TemplateFile[]>([]);
  const [templateFiles, setTemplateFiles] = useState<TemplateFile[]>([]);

  const [originalSequence, setOriginalSequence] = useState<TemplateFile[]>([]);
  // const [originalName, setOriginalName] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  const hasFetchedRef = useRef(false);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchTemplateFiles = async () => {
      try {
        const files = await fetchFilesByType('template');

        const filesWithThumbnails = await Promise.all(
          files.map(async (file: any) => ({
            ...file,
            thumbnail: await getThumbnail(file.id),
          }))
        );

        setTemplateFiles(filesWithThumbnails);
      } catch (err) {
        console.error('Error fetching template files', err);
      }
    };

    fetchTemplateFiles();
  }, []);

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [fileData, setFileData] = useState<any>({});

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const rawFile = await api.get(`${apiRoutes.files.base}/getById/${id}`);
        const jsonFile = await fetch(rawFile.data.data.path).then((res) =>
          res.json()
        );
        setFileData(jsonFile);

        const updatedSections = jsonFile.sections.map(
          (section: any, i: number) => {
            const matchedFile = templateFiles.find((file) =>
              file.name.includes(section.name)
            );

            return {
              ...matchedFile,
            };
          }
        );

        setSequenceName(rawFile.data.data.name.split('.')[0]);
        setSequence(updatedSections);
        setOriginalSequence(updatedSections);
      } catch (err) {
        console.error('Error fetching sequence files', err);
      }
    };

    if (id && templateFiles.length > 0 && !hasFetchedRef.current) {
      fetchFile();
      hasFetchedRef.current = true; // prevent refetch
    }
  }, [id, templateFiles]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const fileData = event.dataTransfer.getData('templateFile');
    if (!fileData) return;

    const file: TemplateFile = JSON.parse(fileData);
    setSequence((prev) => [...prev, file]);
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    file: TemplateFile
  ) => {
    event.dataTransfer.setData('templateFile', JSON.stringify(file));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sequence.findIndex((item) => item.id === active.id);
    const newIndex = sequence.findIndex((item) => item.id === over.id);

    if (oldIndex > -1 && newIndex > -1) {
      setSequence((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleDelete = (id: string) => {
    setSequence((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSequenceSave = async () => {
    const trimmedName = sequenceName.trim();

    setIsSaving(true);

    const isSameSequence =
      sequence.length === originalSequence.length &&
      sequence.every((item, index) => item.id === originalSequence[index]?.id);

    if (isSameSequence) {
      console.log('⚠️ No changes detected. Skipping save.');
      return;
    }

    const sequenceJson = {
      sections: sequence.map((file) => ({
        name: file.name.split('.')[0],
        path: `template/${file.id}.${file.name.split('.')[1]}`,
        jobCardData: file.data.jobCard || {},
      })),
    };

    try {
      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(sequenceJson)], {
        type: 'application/json',
      });

      const jsonFile = new File([jsonBlob], `${sequenceName}.json`, {
        type: 'application/json',
      });

      formData.append('files', jsonFile);

      if (id) {
        await api.post(`/api/files/sequence/${id}/replace`, formData);
      } else {
        await api.post('/api/files/sequence/upload', formData);
      }

      setSequenceName(trimmedName);
      setOriginalSequence(sequence);
    } catch (error) {
      console.error('❌ Failed to save sequence', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-[300px_1fr] w-full h-screen gap-4 p-4">
      {/* Left: Template List */}
      <div>
        <div className="bg-white border rounded shadow p-2 overflow-auto max-h-[400px]">
          <h2 className="text-lg font-semibold mb-4">Templates</h2>
          {templateFiles.map((file) => (
            <div
              key={file.id}
              draggable
              onDragStart={(e) => handleDragStart(e, file)}
              className="cursor-move border p-2 rounded mb-2 bg-gray-50 hover:bg-gray-100"
            >
              <p className="font-medium text-sm mb-2 capitalize ">
                {file.name.split('.')[0]}
              </p>
              <img src={file.thumbnail} alt="thumbnail" />
            </div>
          ))}
        </div>
      </div>

      {/* Right: Sequence Builder */}
      <div
        className="bg-white border rounded shadow p-2 overflow-auto "
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex justify-between items-center gap-4 mb-4">
          {id === null ? (
            <Input
              type="text"
              value={sequenceName}
              onChange={(e) => setSequenceName(e.target.value)}
              onBlur={() => {
                if (sequenceName.trim()) {
                  setIsEditing(false);
                }
              }}
              autoFocus
              placeholder="Enter Sequence Name"
              className="w-full max-w-sm"
            />
          ) : (
            <h3
              className="text-lg font-semibold capitalize "
              title="Click to edit"
            >
              {sequenceName}
            </h3>
          )}

          <Button
            onClick={handleSequenceSave}
            className=" px-4 py-2 rounded disabled:opacity-50"
            disabled={!sequenceName.trim()}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {sequence.length === 0 ? (
          <div className="text-gray-400 italic">
            Drag templates here to build a sequence.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sequence.map((file) => file.id)}
              strategy={verticalListSortingStrategy}
            >
              {sequence.map((file) => (
                <SortableItem
                  key={file.id}
                  file={file}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Bottom: Sequence Builder */}
      <div className=" col-span-2">
        {fileData && <FormulaBuilder fileData={fileData} />}
      </div>
    </div>
  );
};

export default SequenceBuilder;
