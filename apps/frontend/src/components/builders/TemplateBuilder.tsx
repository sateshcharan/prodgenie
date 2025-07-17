import { Save } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScrollArea } from '@radix-ui/react-scroll-area';

import { api } from '../../utils';
import FormBuilder from './FormBuilder';
import SuggestionInput from '../SuggestionInput';

import {
  apiRoutes,
  preDefinedKeywords,
  preDefinedOperators,
} from '@prodgenie/libs/constant';
import { Button, FileDropzone, Input, toast } from '@prodgenie/libs/ui';

const TemplateBuilder = () => {
  const [templateName, setTemplateName] = useState('');
  const [templateFile, setTemplateFile] = useState<string | null>(null);
  const [templateFields, setTemplateFields] = useState<string[]>([]);
  const [templateBlocks, setTemplateBlocks] = useState<string[]>([]);
  const [templateFieldValues, setTemplateFieldValues] = useState<
    Record<string, string>
  >({});
  const [originalTemplateFieldValues, setOriginalTemplateFieldValues] =
    useState<Record<string, string>>({});
  const [originalTemplateFile, setOriginalTemplateFile] = useState('');
  const [jobCardData, setJobCardData] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  // const [isEditing, setIsEditing] = useState(false);

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!id || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchFile = async () => {
      try {
        const rawFile = await api.get(`${apiRoutes.files.base}/getById/${id}`);
        const name = rawFile.data.data.name;
        const templateName = name.split('.')[0];
        const fileContent = await fetch(rawFile.data.data.path).then((res) =>
          res.text()
        );

        setTemplateName(templateName);
        setTemplateFile(fileContent);
        setOriginalTemplateFile(fileContent);

        const { fields, blocks } = extractPlaceholders(fileContent);
        setTemplateFields(fields);
        setTemplateBlocks(blocks);

        const { data } = await api.get(
          `${apiRoutes.files.base}/getFileData/${id}`
        );
        const templateData = data?.data?.[templateName];
        const jobCardFormData = data?.data?.jobCard?.formFields;
        setJobCardData(jobCardFormData);

        const manualFields = templateData.fields.manual ?? {};
        const computedFields = templateData.fields.computed ?? {};
        const combined = { ...manualFields, ...computedFields };
        setTemplateFieldValues(combined);
        setOriginalTemplateFieldValues(combined);
      } catch (err) {
        console.error('Error fetching template file', err);
      }
    };

    fetchFile();
  }, [id]);

  // Extracts {{placeholders}} and grouped blocks from HTML
  const extractPlaceholders = (htmlContent: string) => {
    const fields: string[] = [];
    const blocks: string[] = [];

    const matches = htmlContent.match(/{{(.*?)}}/g);
    if (!matches) return { fields, blocks };

    let currentBlock: string | null = null;

    matches
      .map((m) => m.slice(2, -2).trim())
      .forEach((token) => {
        if (token.startsWith('#') && token.endsWith('[]')) {
          currentBlock = token.slice(1, -2);
          if (!blocks.includes(currentBlock)) blocks.push(currentBlock);
        } else if (token.startsWith('/') && token.endsWith('[]')) {
          currentBlock = null;
        } else if (!currentBlock) {
          fields.push(token);
        }
      });

    return { fields, blocks };
  };

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    if (!file || !file.name.endsWith('.htm')) {
      alert('Please upload a valid .htm file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const { fields, blocks } = extractPlaceholders(content);

      // Prepare initial values (empty string for each)
      const newFieldValues: Record<string, string> = {};

      fields.forEach((field) => {
        newFieldValues[field] = '';
      });
      blocks.forEach((block) => {
        newFieldValues[block] = `${block}s[]`;
      });

      setTemplateFile(content);
      setTemplateFields(fields);
      setTemplateBlocks(blocks);
      setTemplateFieldValues(newFieldValues);
      setOriginalTemplateFieldValues(newFieldValues);
    };
    reader.readAsText(file);
  };

  const handleTemplateSave = async () => {
    if (!templateFile || !templateName.trim()) return;
    setIsSaving(true);

    const isUnchanged =
      JSON.stringify(templateFieldValues) ===
        JSON.stringify(originalTemplateFieldValues) &&
      templateFile === originalTemplateFile;

    if (isUnchanged) {
      console.log('⚠️ No changes detected. Skipping save.');
      setIsSaving(false);
      return;
    }

    const manual: Record<string, string> = {};
    const computed: Record<string, string> = {};

    // Object.entries(templateFieldValues).forEach(([key, val]) => {
    //   const isComputed =
    //     typeof val === 'string' &&
    //     (val.includes(`depField`) ||
    //       preDefinedOperators.some((op) => val.includes(op)));
    //   isComputed ? (computed[key] = val) : (manual[key] = val);
    // });

    Object.entries(templateFieldValues).forEach(([key, val]) => {
      const isComputed =
        typeof val === 'string' &&
        (preDefinedKeywords.some((op) => val.includes(op)) ||
          preDefinedOperators.some((op) => val.includes(op)));
      isComputed ? (computed[key] = val) : (manual[key] = val);
    });

    const templateJson = {
      [templateName]: {
        fields: {
          manual,
          computed,
        },
      },
    };

    try {
      if (id) {
        await api.patch(`${apiRoutes.files.base}/${id}/update`, templateJson);
      } else {
        const blob = new Blob([templateFile], { type: 'text/html' });
        const file = new File([blob], `${templateName}.htm`, {
          type: 'text/html',
        });
        const formData = new FormData();
        formData.append('files', file);
        const uploadResponse = await api.post(
          '/api/files/template/upload',
          formData
        );
        const newId = uploadResponse.data[0].id;
        toast('✅ Template Created');

        await api.patch(
          `${apiRoutes.files.base}/${newId}/update`,
          templateJson
        );
        toast('✅ Template Updated');
      }
    } catch (error) {
      console.error('❌ Failed to save template', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`grid ${
        templateFields.length > 0 ? 'grid-cols-[auto_1fr]' : 'grid-cols-1'
      } w-full h-screen gap-4 p-4`}
    >
      {/* Left: Parsed Fields */}
      {templateFields.length > 0 &&
        Object.keys(templateFieldValues).length > 0 && (
          <div>
            <ScrollArea>
              <div className="bg-white border rounded shadow p-2 overflow-auto max-h-[400px] ">
                <h2 className="text-lg font-semibold mb-4">Template Fields</h2>
                <div className="space-y-2">
                  {templateBlocks.map((blockName, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 border p-2 rounded mb-2 bg-gray-50"
                    >
                      <label className="font-medium text-sm flex-shrink-0 min-w-[100px]">
                        {blockName}:
                      </label>
                      <SuggestionInput readonly value={`${blockName}s[]`} />
                    </div>
                  ))}

                  {templateFields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 border p-2 rounded mb-2 bg-gray-50"
                    >
                      <label className="font-medium text-sm flex-shrink-0 min-w-[100px]">
                        {field}:
                      </label>
                      <SuggestionInput
                        extraSuggestions={[]}
                        value={templateFieldValues[field] || ''}
                        onChange={(val) =>
                          setTemplateFieldValues((prev) => ({
                            ...prev,
                            [field]: val,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            {/* {jobCardData && Object.keys(jobCardData).length > 0 && (
              <FormBuilder jobCardData={jobCardData} />
            )} */}

            {templateFile && <FormBuilder jobCardData={jobCardData} />}
          </div>
        )}

      {/* Right: Upload, Name, and Preview */}
      <div className="bg-white border rounded shadow p-2 overflow-auto">
        <div className="flex justify-between items-center mb-4 gap-4">
          {id === null ? (
            <Input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              autoFocus
              placeholder="Enter Sequence Name"
              className="w-full max-w-sm"
            />
          ) : (
            <h3
              className="text-lg font-semibold capitalize "
              title="Click to edit"
            >
              {templateName}
            </h3>
          )}
          <Button
            onClick={handleTemplateSave}
            disabled={!templateFile || isSaving}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {templateFile ? (
          <div className="border-t pt-4">
            <h3 className="text-md font-semibold mb-2">Preview</h3>
            <div className="w-full h-[500px] border rounded overflow-hidden">
              <iframe
                title="Template Preview"
                srcDoc={templateFile}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        ) : (
          <FileDropzone
            accept={{ 'text/html': ['.htm', '.html'] }}
            onFilesSelected={handleDrop}
          />
        )}
      </div>
    </div>
  );
};

export default TemplateBuilder;
