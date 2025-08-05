import { Save } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import isEqual from 'lodash.isequal';

import { api } from '../utils';
import FormBuilder from './FormBuilder';
import SuggestionInput from './SuggestionInput';

import {
  apiRoutes,
  preDefinedKeywords,
  preDefinedOperators,
} from '@prodgenie/libs/constant';
import { Button, Card, FileDropzone, Input, toast } from '@prodgenie/libs/ui';

const TemplateBuilder = () => {
  const [templateName, setTemplateName] = useState('');
  const [templateFile, setTemplateFile] = useState<string | null>(null);
  const [originalTemplateFile, setOriginalTemplateFile] = useState('');
  const [templateFields, setTemplateFields] = useState<string[]>([]);
  const [templateBlocks, setTemplateBlocks] = useState<string[]>([]);
  const [templateFieldValues, setTemplateFieldValues] = useState<
    Record<string, string>
  >({});
  const [originalTemplateFieldValues, setOriginalTemplateFieldValues] =
    useState<Record<string, string>>({});
  const [jobCardData, setJobCardData] = useState(null);
  const [originalJobCardData, setOriginalJobCardData] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const hasFetchedRef = useRef(false);

  const formBuilderRef = useRef<{ saveTemplate: () => void } | null>(null);

  useEffect(() => {
    if (!id || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchFile = async () => {
      try {
        const {
          data: { data: templateFile },
        } = await api.get(`${apiRoutes.files.base}/getById/${id}`);
        const templateName = templateFile.name.split('.')[0];
        const templateFileContent = await fetch(templateFile.path).then((res) =>
          res.text()
        );
        const jobCardFormData = templateFile?.data?.jobCardForm;
        const { manual = {}, computed = {} } =
          templateFile?.data?.templateFields ?? {};
        const combined = { ...manual, ...computed };
        const { fields, blocks } = extractPlaceholders(templateFileContent);

        setTemplateName(templateName);
        setTemplateFile(templateFileContent);
        setOriginalTemplateFile(templateFileContent);
        setTemplateFields(fields);
        setTemplateBlocks(blocks);
        setJobCardData(jobCardFormData);
        setOriginalJobCardData(jobCardFormData);
        setTemplateFieldValues(combined);
        setOriginalTemplateFieldValues(combined);
      } catch (err) {
        console.error('Error fetching template file', err);
      }
    };

    fetchFile();
  }, [id]);

  useEffect(() => {
    if (!id) {
      setTemplateName('');
      setTemplateFile(null);
      setTemplateFields([]);
      setTemplateBlocks([]);
      setTemplateFieldValues({});
      setOriginalTemplateFieldValues({});
      setOriginalTemplateFile('');
      setJobCardData(null);
      setOriginalJobCardData(null);
      setIsSaving(false);
      hasFetchedRef.current = false;
    }
  }, [id]);

  const extractPlaceholders = (htmlContent: string) => {
    const fields: string[] = [];
    const blocks: string[] = [];
    let currentBlock: string | null = null;

    const matches = htmlContent.match(/{{(.*?)}}/g);
    if (!matches) return { fields, blocks };
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

  const handleTemplateSave = async (UpdatedJobCardData: any) => {
    if (!templateFile || !templateName.trim()) return;
    setIsSaving(true);

    const stripSchema = (obj: any) => {
      const clone = structuredClone(obj);
      for (const section of clone.sections ?? []) {
        delete section.schema;
      }
      return clone;
    };

    if (id) {
      const isUnchanged =
        isEqual(
          stripSchema(UpdatedJobCardData.jobCardForm),
          stripSchema(originalJobCardData)
        ) && isEqual(templateFieldValues, originalTemplateFieldValues);

      if (isUnchanged) {
        console.log('⚠️ No changes detected. Skipping save.');
        setIsSaving(false);
        return;
      }
    }

    const manual: Record<string, string> = {};
    const computed: Record<string, string> = {};

    Object.entries(templateFieldValues).forEach(([key, val]) => {
      const isComputed =
        typeof val === 'string' &&
        (preDefinedKeywords.some((op) => val.includes(op)) ||
          preDefinedOperators.some((op) => val.includes(op)));
      isComputed ? (computed[key] = val) : (manual[key] = val);
    });

    const templateJson = {
      templateFields: {
        manual,
        computed,
      },
      ...UpdatedJobCardData,
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
      className={`grid w-full gap-4 p-4 ${
        templateFields.length > 0
          ? 'grid-cols-1 lg:grid-cols-[minmax(300px,400px)_1fr]'
          : 'grid-cols-1'
      }`}
    >
      {/* Left: Template Builder */}
      {templateFields.length > 0 &&
        Object.keys(templateFieldValues).length > 0 && (
          <div className="w-full max-w-full lg:max-w-[400px]">
            {templateFile && (
              <FormBuilder
                ref={formBuilderRef}
                jobCardData={jobCardData}
                onFormSubmit={handleTemplateSave}
              />
            )}
          </div>
        )}

      {/* Right: Template Builder */}
      <div className="bg-white border rounded shadow p-2 overflow-auto ">
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
            onClick={() => formBuilderRef.current?.saveTemplate()}
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
            {/* <div className="w-full h-[500px] border rounded overflow-hidden"> */}
            <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] border rounded overflow-hidden">
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

      {/* Bottom: Template Builder */}
      <div className=" col-span-2">
        <ScrollArea>
          <div className="bg-white border rounded shadow p-2 overflow-auto max-h-[60vh] sm:max-h-[400px]">
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
      </div>
    </div>
  );
};

export default TemplateBuilder;
