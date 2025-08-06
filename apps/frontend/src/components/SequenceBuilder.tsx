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
// import { set } from 'react-hook-form';
import { CSS } from '@dnd-kit/utilities';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Save, Trash, FolderSync } from 'lucide-react';
import isEqual from 'lodash.isequal';

import FormulaBuilder from './FormulaBuilder';
import { api, ExcelHTMLViewer } from '../utils';
import { fetchFilesByType, getThumbnail } from '../services/fileService';

import { Button, Input, toast } from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
// import { DataMutationService } from '@prodgenie/libs/frontend-services';

// const dataMutationService = new DataMutationService();

type TemplateFile = {
  id: string;
  path: string;
  name: string;
  data: any;
  thumbnail: string;
};

const SortableItem = ({
  file,
  onDelete,
}: {
  file: TemplateFile;
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
        <div className="flex gap-2  items-center mb-2">
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
    </div>
  );
};

const SequenceBuilder = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [sequenceName, setSequenceName] = useState('');
  const [sequence, setSequence] = useState<TemplateFile[]>([]);
  const [originalSequence, setOriginalSequence] = useState<TemplateFile[]>([]);
  const [sequenceFormulas, setSequenceFormulas] = useState({});
  const [templateFiles, setTemplateFiles] = useState<TemplateFile[]>([]);
  const formulaBuilderRef = useRef<{ saveTemplate: () => void } | null>(null);

  // const [originalName, setOriginalName] = useState('');
  const sensors = useSensors(useSensor(PointerSensor));
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const hasFetchedRef = useRef(false);

  // Fetch all available template files
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

  // Load existing sequence (if editing)
  useEffect(() => {
    const fetchFile = async () => {
      try {
        const rawFile = await api.get(`${apiRoutes.files.base}/getById/${id}`);
        const formulas = rawFile.data.data.data;
        const jsonFile = await fetch(rawFile.data.data.path).then((res) =>
          res.json()
        );

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
        setSequenceFormulas(formulas);
      } catch (err) {
        console.error('Error fetching sequence files', err);
      }
    };

    if (id && templateFiles.length > 0 && !hasFetchedRef.current) {
      fetchFile();
      hasFetchedRef.current = true; // prevent refetch
    }
  }, [id, templateFiles]);

  // Reset on new sequence creation
  useEffect(() => {
    if (!id) {
      setSequenceName('');
      setSequence([]);
      setOriginalSequence([]);
      hasFetchedRef.current = false;
    }
  }, [id]);

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

  const handleSequenceSave = async (updatedSequenceFormulas: any) => {
    if (!sequence || !sequenceName.trim()) return;

    const isUnchanged =
      isEqual(sequence, originalSequence) &&
      isEqual(sequenceFormulas, updatedSequenceFormulas);

    if (isUnchanged) {
      console.log('⚠️ No changes detected. Skipping save.');
      return;
    }

    setIsSaving(true);

    const sequenceJson = {
      sections: sequence.map((file) => ({
        name: file.name.split('.')[0],
        path: `template/${file.id}.${file.name.split('.')[1]}`,
        jobCardForm: file.data.jobCardForm || {},
      })),
    };

    try {
      // sequence part
      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(sequenceJson)], {
        type: 'application/json',
      });
      const jsonFile = new File([jsonBlob], `${sequenceName}.json`, {
        type: 'application/json',
      });
      formData.append('files', jsonFile);

      if (id) {
        // formulabuilder part
        await api.post(`/api/files/sequence/${id}/replace`, formData);
        await api.patch(
          `${apiRoutes.files.base}/${id}/update`,
          updatedSequenceFormulas
        );
      } else {
        const { data } = await api.post('/api/files/sequence/upload', formData);
        const id = data[0].id;
        await api.patch(
          `${apiRoutes.files.base}/${id}/update`,
          updatedSequenceFormulas
        );
      }

      toast('✅ File updated successfully.');
      // setSequenceName(sequenceName.trim());
      setOriginalSequence(sequence);
    } catch (error) {
      console.error('❌ Failed to save sequence', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen gap-4 p-4 overflow-hidden">
      {/* Left Panel: Templates */}
      <div className="w-full md:w-[300px] flex-shrink-0 h-[20vh] md:h-full">
        <div className="bg-white border rounded shadow p-2 h-full">
          <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-white ">
            Templates
          </h2>

          <div className="overflow-y-auto max-h-[calc(100%-2rem)] pr-1">
            <div className="flex md:flex-col gap-2">
              {templateFiles.map((file) => (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, file)}
                  className="cursor-move border p-2 rounded bg-gray-50 hover:bg-gray-100 min-w-[150px] md:min-w-0"
                >
                  <p className="font-medium text-sm mb-2 capitalize">
                    {file.name.split('.')[0]}
                  </p>
                  <img
                    src={file.thumbnail}
                    alt="thumbnail"
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Sequence + Formula */}
      <div className="flex flex-col flex-1 overflow-hidden gap-4">
        {/* Sequence Builder Panel */}
        <div className="h-[600px] flex flex-col bg-white border rounded shadow p-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4">
            {!id ? (
              <Input
                type="text"
                value={sequenceName}
                onChange={(e) => setSequenceName(e.target.value)}
                autoFocus
                placeholder="Enter Sequence Name"
                className="w-full sm:max-w-sm"
              />
            ) : (
              <h3 className="text-lg font-semibold capitalize break-words">
                {sequenceName}
              </h3>
            )}

            <Button
              onClick={() => formulaBuilderRef.current?.saveTemplate()}
              className="px-4 py-2 rounded disabled:opacity-50 w-full sm:w-auto"
              disabled={!sequenceName.trim()}
            >
              <Save size={16} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
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
                  <div className="space-y-2">
                    {sequence.map((file) => (
                      <SortableItem
                        key={file.id}
                        file={file}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Bottom: FormulaBuilder */}
        <FormulaBuilder
          ref={formulaBuilderRef}
          fileData={sequence}
          sequenceFormulas={sequenceFormulas}
          onFormulaSave={handleSequenceSave}
        />
      </div>
    </div>
  );
};

export default SequenceBuilder;
