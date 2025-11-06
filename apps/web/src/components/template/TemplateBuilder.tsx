// import { Save } from 'lucide-react';
// import { isEqual } from 'lodash-es';
// import { useState, useRef, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';

// import { api } from '../utils';
// import FormBuilder from './FormBuilder';
// import SuggestionInput from './SuggestionInput';

// import {
//   apiRoutes,
//   preDefinedKeywords,
//   preDefinedOperators,
// } from '@prodgenie/libs/constant';
// import { Button, Card, FileDropzone, Input, toast } from '@prodgenie/libs/ui';

// const TemplateBuilder = () => {
//   const [templateName, setTemplateName] = useState('');
//   const [templateFile, setTemplateFile] = useState<string | null>(null);
//   const [originalTemplateFile, setOriginalTemplateFile] = useState('');
//   const [templateFields, setTemplateFields] = useState<string[]>([]);
//   const [templateBlocks, setTemplateBlocks] = useState<string[]>([]);
//   const [templateFieldValues, setTemplateFieldValues] = useState<
//     Record<string, string>
//   >({});
//   const [originalTemplateFieldValues, setOriginalTemplateFieldValues] =
//     useState<Record<string, string>>({});
//   const [jobCardData, setJobCardData] = useState(null);
//   const [originalJobCardData, setOriginalJobCardData] = useState(null);

//   const [isSaving, setIsSaving] = useState(false);

//   const [searchParams] = useSearchParams();
//   const id = searchParams.get('id');

//   const hasFetchedRef = useRef(false);

//   const formBuilderRef = useRef<{ saveTemplate: () => void } | null>(null);

//   useEffect(() => {
//     if (!id || hasFetchedRef.current) return;
//     hasFetchedRef.current = true;

//     const fetchFile = async () => {
//       try {
//         const {
//           data: { data: templateFile },
//         } = await api.get(`${apiRoutes.files.base}/getById/${id}`);
//         const templateName = templateFile.name.split('.')[0];
//         const templateFileContent = await fetch(templateFile.path).then((res) =>
//           res.text()
//         );
//         const jobCardFormData = templateFile?.data?.jobCardForm;
//         const { manual = {}, computed = {} } =
//           templateFile?.data?.templateFields ?? {};
//         const combined = { ...manual, ...computed };
//         const { fields, blocks } = extractPlaceholders(templateFileContent);

//         setTemplateName(templateName);
//         setTemplateFile(templateFileContent);
//         setOriginalTemplateFile(templateFileContent);
//         setTemplateFields(fields);
//         setTemplateBlocks(blocks);
//         setJobCardData(jobCardFormData);
//         setOriginalJobCardData(jobCardFormData);
//         setTemplateFieldValues(combined);
//         setOriginalTemplateFieldValues(combined);
//       } catch (err) {
//         console.error('Error fetching template file', err);
//       }
//     };

//     fetchFile();
//   }, [id]);

//   useEffect(() => {
//     if (!id) {
//       setTemplateName('');
//       setTemplateFile(null);
//       setTemplateFields([]);
//       setTemplateBlocks([]);
//       setTemplateFieldValues({});
//       setOriginalTemplateFieldValues({});
//       setOriginalTemplateFile('');
//       setJobCardData(null);
//       setOriginalJobCardData(null);
//       setIsSaving(false);
//       hasFetchedRef.current = false;
//     }
//   }, [id]);

//   const extractPlaceholders = (htmlContent: string) => {
//     const fields: string[] = [];
//     const blocks: string[] = [];
//     let currentBlock: string | null = null;

//     const matches = htmlContent.match(/{{(.*?)}}/g);
//     if (!matches) return { fields, blocks };
//     matches
//       .map((m) => m.slice(2, -2).trim())
//       .forEach((token) => {
//         if (token.startsWith('#') && token.endsWith('[]')) {
//           currentBlock = token.slice(1, -2);
//           if (!blocks.includes(currentBlock)) blocks.push(currentBlock);
//         } else if (token.startsWith('/') && token.endsWith('[]')) {
//           currentBlock = null;
//         } else if (!currentBlock) {
//           fields.push(token);
//         }
//       });
//     return { fields, blocks };
//   };

//   const handleDrop = async (files: File[]) => {
//     const file = files[0];
//     if (!file || !file.name.endsWith('.htm')) {
//       alert('Please upload a valid .htm file.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = () => {
//       const content = reader.result as string;
//       const { fields, blocks } = extractPlaceholders(content);

//       // Prepare initial values (empty string for each)
//       const newFieldValues: Record<string, string> = {};

//       fields.forEach((field) => {
//         newFieldValues[field] = '';
//       });
//       blocks.forEach((block) => {
//         newFieldValues[block] = `${block}s[]`;
//       });

//       setTemplateFile(content);
//       setTemplateFields(fields);
//       setTemplateBlocks(blocks);
//       setTemplateFieldValues(newFieldValues);
//       setOriginalTemplateFieldValues(newFieldValues);
//     };
//     reader.readAsText(file);
//   };

//   const handleTemplateSave = async (UpdatedJobCardData: any) => {
//     if (!templateFile || !templateName.trim()) return;
//     setIsSaving(true);

//     const stripSchema = (obj: any) => {
//       const clone = structuredClone(obj);
//       for (const section of clone.sections ?? []) {
//         delete section.schema;
//       }
//       return clone;
//     };

//     if (id) {
//       const isUnchanged =
//         isEqual(
//           stripSchema(UpdatedJobCardData.jobCardForm),
//           stripSchema(originalJobCardData)
//         ) && isEqual(templateFieldValues, originalTemplateFieldValues);

//       if (isUnchanged) {
//         console.log('⚠️ No changes detected. Skipping save.');
//         setIsSaving(false);
//         return;
//       }
//     }

//     const manual: Record<string, string> = {};
//     const computed: Record<string, string> = {};

//     Object.entries(templateFieldValues).forEach(([key, val]) => {
//       const isComputed =
//         typeof val === 'string' &&
//         (preDefinedKeywords.some((op) => val.includes(op)) ||
//           preDefinedOperators.some((op) => val.includes(op)));
//       isComputed ? (computed[key] = val) : (manual[key] = val);
//     });

//     const templateJson = {
//       templateFields: {
//         manual,
//         computed,
//       },
//       ...UpdatedJobCardData,
//     };

//     try {
//       if (id) {
//         await api.patch(`${apiRoutes.files.base}/${id}/update`, templateJson);
//       } else {
//         const blob = new Blob([templateFile], { type: 'text/html' });
//         const file = new File([blob], `${templateName}.htm`, {
//           type: 'text/html',
//         });
//         const formData = new FormData();
//         formData.append('files', file);
//         const uploadResponse = await api.post(
//           '/api/files/template/upload',
//           formData
//         );
//         const newId = uploadResponse.data[0].id;
//         toast('✅ Template Created');

//         await api.patch(
//           `${apiRoutes.files.base}/${newId}/update`,
//           templateJson
//         );
//         toast('✅ Template Updated');
//       }
//     } catch (error) {
//       console.error('❌ Failed to save template', error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     // <div
//     //   className={`grid w-full gap-4 p-4 ${
//     //     templateFields.length > 0
//     //       ? 'grid-cols-1 lg:grid-cols-[minmax(300px,400px)_1fr]'
//     //       : 'grid-cols-1'
//     //   }`}
//     // >
//     //   {/* Left: Template Builder */}
//     //   {templateFields.length > 0 &&
//     //     Object.keys(templateFieldValues).length > 0 && (
//     //       <div className="w-full max-w-full lg:max-w-[400px]">
//     //         {templateFile && (
//     //           <FormBuilder
//     //             ref={formBuilderRef}
//     //             jobCardData={jobCardData}
//     //             onFormSubmit={handleTemplateSave}
//     //           />
//     //         )}
//     //       </div>
//     //     )}

//     //   {/* Right: Template Builder */}
//     //   <div className="bg-white border rounded shadow p-2 overflow-auto max-h-[calc(100vh-200px)]">
//     //     <div className="flex justify-between items-center mb-4 gap-4 sticky top-0 z-10 bg-white pb-2">
//     //       {id === null ? (
//     //         <Input
//     //           type="text"
//     //           value={templateName}
//     //           onChange={(e) => setTemplateName(e.target.value)}
//     //           autoFocus
//     //           placeholder="Enter Sequence Name"
//     //           className="w-full max-w-sm"
//     //         />
//     //       ) : (
//     //         <h3
//     //           className="text-lg font-semibold capitalize "
//     //           title="Click to edit"
//     //         >
//     //           {templateName}
//     //         </h3>
//     //       )}
//     //       <Button
//     //         onClick={() => formBuilderRef.current?.saveTemplate()}
//     //         disabled={!templateFile || isSaving}
//     //         className="flex items-center gap-2"
//     //       >
//     //         <Save size={16} />
//     //         {isSaving ? 'Saving...' : 'Save'}
//     //       </Button>
//     //     </div>

//     //     {templateFile ? (
//     //       <div className="border-t pt-4">
//     //         <h3 className="text-md font-semibold mb-2 sticky top-12 bg-white z-10">
//     //           Preview
//     //         </h3>
//     //         {/* <div className="w-full h-[500px] border rounded overflow-hidden"> */}
//     //         <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] border rounded overflow-hidden">
//     //           <iframe
//     //             title="Template Preview"
//     //             srcDoc={templateFile}
//     //             className="w-full h-full border-0"
//     //           />
//     //         </div>
//     //       </div>
//     //     ) : (
//     //       <FileDropzone
//     //         accept={{ 'text/html': ['.htm', '.html'] }}
//     //         onFilesSelected={handleDrop}
//     //       />
//     //     )}
//     //   </div>

//     //   {/* Bottom: Template Builder */}
//     //   <div className=" col-span-2">
//     //     <div className="bg-white border rounded shadow p-2 overflow-auto max-h-[60vh] sm:max-h-[400px]">
//     //       <div className="sticky top-0 bg-white pb-2">
//     //         <h2 className="text-lg font-semibold mb-4">Template Fields</h2>
//     //       </div>

//     //       <div className="space-y-2">
//     //         {templateBlocks.map((blockName, index) => (
//     //           <div
//     //             key={index}
//     //             className="flex items-center justify-between gap-2 border p-2 rounded mb-2 bg-gray-50"
//     //           >
//     //             <label className="font-medium text-sm flex-shrink-0 min-w-[100px]">
//     //               {blockName}:
//     //             </label>
//     //             <SuggestionInput readonly value={`${blockName}s[]`} />
//     //           </div>
//     //         ))}

//     //         {templateFields.map((field, index) => (
//     //           <div
//     //             key={index}
//     //             className="flex items-center justify-between gap-2 border p-2 rounded mb-2 bg-gray-50"
//     //           >
//     //             <label className="font-medium text-sm flex-shrink-0 min-w-[100px]">
//     //               {field}:
//     //             </label>
//     //             <SuggestionInput
//     //               extraSuggestions={[]}
//     //               value={templateFieldValues[field] || ''}
//     //               onChange={(val) =>
//     //                 setTemplateFieldValues((prev) => ({
//     //                   ...prev,
//     //                   [field]: val,
//     //                 }))
//     //               }
//     //             />
//     //           </div>
//     //         ))}
//     //       </div>
//     //     </div>
//     //   </div>
//     // </div>

//     <div
//       className={`grid w-full gap-4 p-4 lg:grid-cols-[minmax(300px,400px)_1fr] ${
//         templateFields.length === 0 ? 'grid-cols-1' : ''
//       }`}
//     >
//       {/* Left: Template Builder Form */}
//       {templateFields.length > 0 &&
//         Object.keys(templateFieldValues).length > 0 && (
//           <div className="w-full max-w-full lg:max-w-[400px]">
//             {templateFile && (
//               <FormBuilder
//                 ref={formBuilderRef}
//                 jobCardData={jobCardData}
//                 onFormSubmit={handleTemplateSave}
//               />
//             )}
//           </div>
//         )}

//       {/* Right: Preview & File Upload */}
//       <div className="bg-white border rounded shadow p-4 overflow-auto max-h-[calc(100vh-200px)]">
//         {/* Top bar: Name + Save */}
//         <div className="flex justify-between items-center mb-4 gap-4 sticky top-0 z-20 bg-white pb-2 border-b">
//           {id === null ? (
//             <Input
//               type="text"
//               value={templateName}
//               onChange={(e) => setTemplateName(e.target.value)}
//               autoFocus
//               placeholder="Enter Sequence Name"
//               className="w-full max-w-sm"
//             />
//           ) : (
//             <h3
//               className="text-lg font-semibold capitalize"
//               title="Click to edit"
//             >
//               {templateName}
//             </h3>
//           )}

//           <Button
//             onClick={() => formBuilderRef.current?.saveTemplate()}
//             disabled={!templateFile || isSaving}
//             className="flex items-center gap-2"
//           >
//             <Save size={16} />
//             {isSaving ? 'Saving...' : 'Save'}
//           </Button>
//         </div>

//         {/* Preview or File Drop */}
//         {templateFile ? (
//           <div className="border-t pt-4">
//             <h3 className="text-md font-semibold mb-2 sticky top-14 z-10 bg-white">
//               Preview
//             </h3>
//             <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] border rounded overflow-hidden">
//               <iframe
//                 title="Template Preview"
//                 srcDoc={templateFile}
//                 className="w-full h-full border-0"
//               />
//             </div>
//           </div>
//         ) : (
//           <FileDropzone
//             accept={{ 'text/html': ['.htm', '.html'] }}
//             onFilesSelected={handleDrop}
//           />
//         )}
//       </div>

//       {templateFile && (
//         /* Bottom: Template Fields */
//         <div className="col-span-full">
//           <div className="bg-white border rounded shadow p-4 overflow-auto max-h-[60vh] sm:max-h-[400px]">
//             <div className="sticky top-0 bg-white z-10 pb-2 border-b mb-4">
//               <h2 className="text-lg font-semibold">Template Fields</h2>
//             </div>

//             <div className="space-y-2">
//               {templateBlocks.map((blockName, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between gap-2 border p-2 rounded bg-gray-50"
//                 >
//                   <label className="font-medium text-sm flex-shrink-0 min-w-[100px]">
//                     {blockName}:
//                   </label>
//                   <SuggestionInput readonly value={`${blockName}s[]`} />
//                 </div>
//               ))}

//               {templateFields.map((field, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between gap-2 border p-2 rounded bg-gray-50"
//                 >
//                   <label className="font-medium text-sm flex-shrink-0 min-w-[100px]">
//                     {field}:
//                   </label>
//                   <SuggestionInput
//                     extraSuggestions={[]}
//                     value={templateFieldValues[field] || ''}
//                     onChange={(val) =>
//                       setTemplateFieldValues((prev) => ({
//                         ...prev,
//                         [field]: val,
//                       }))
//                     }
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>

//   );
// };

// export default TemplateBuilder;

import clsx from 'clsx';
import { Save } from 'lucide-react';
import { isEqual, template, update } from 'lodash-es';
import { useSearchParams } from 'react-router-dom';
import { useState, useRef, useEffect, memo } from 'react';

import {
  apiRoutes,
  preDefinedKeywords,
  preDefinedOperators,
} from '@prodgenie/libs/constant';
import {
  Button,
  FileDropzone,
  Input,
  ScrollArea,
  toast,
} from '@prodgenie/libs/ui';
import { StringService } from '@prodgenie/libs/shared-utils';

import { api } from '../../utils';
import FormBuilder from './FormBuilder';
import SuggestionInput from '../SuggestionInput';

const stringService = new StringService();

// 🔹 Reusable field row
const TemplateFieldRow = ({
  label,
  value,
  readOnly = false,
  onChange,
  templateName,
}) => (
  <div className="flex items-center justify-between gap-2 border p-2 rounded bg-gray-50">
    <label className="font-medium text-sm flex-shrink-0 min-w-[100px]">
      {label}:
    </label>
    <SuggestionInput
      readOnly={readOnly}
      value={value}
      onChange={onChange}
      templateName={templateName}
    />
  </div>
);

// 🔹 Memoized preview panel
const TemplatePreview = memo(({ templateFile }) => (
  <div className="border-t pt-4">
    <h3 className="text-md font-semibold mb-2 sticky top-14 z-10 bg-white">
      Preview
    </h3>
    <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] border rounded overflow-hidden">
      <iframe
        title="Template Preview"
        srcDoc={templateFile}
        className="w-full h-full border-0"
      />
    </div>
  </div>
));

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
        const combined = templateFile?.data?.templateFields ?? {}; // templateFields
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

    return {
      fields: Array.from(new Set(fields)),
      blocks: Array.from(new Set(blocks)),
    };
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

      const newFieldValues: Record<string, string> = {};
      fields.forEach((field) => (newFieldValues[field] = ''));
      blocks.forEach((block) => (newFieldValues[block] = `${block}s[]`));

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

    const trimmedJobCardData = stringService.trimKeys(
      UpdatedJobCardData,
      ['name'],
      { toCamelCase: true }
    );

    const templateJson = {
      templateFields: templateFieldValues,
      ...trimmedJobCardData,
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

  // 🔹 Derived state for cleaner checks
  const hasTemplateFields = templateFields.length > 0;
  const hasTemplateFile = !!templateFile;

  return (
    <div
      className={clsx(
        'grid w-full gap-4 p-4 h-[calc(100vh-3rem)]',
        hasTemplateFields
          ? 'lg:grid-cols-[minmax(300px,400px)_1fr]'
          : 'grid-cols-1'
      )}
    >
      {/* Left: Template Builder Form */}
      {hasTemplateFields && hasTemplateFile && (
        <div className="w-full max-w-full lg:max-w-[400px]  rounded shadow bg-white flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4">
            <FormBuilder
              ref={formBuilderRef}
              jobCardData={jobCardData}
              onFormSubmit={handleTemplateSave}
            />
          </ScrollArea>
        </div>
      )}

      {/* Right: Preview & File Upload */}
      <div className="bg-white border rounded shadow p-4 overflow-auto ">
        <div className="flex justify-between items-center mb-4 gap-4 sticky top-0 z-20 bg-white pb-2 border-b">
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
              className="text-lg font-semibold capitalize"
              title="Click to edit"
            >
              {templateName}
            </h3>
          )}

          <Button
            onClick={() => formBuilderRef.current?.saveTemplate()}
            disabled={!hasTemplateFile || isSaving}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {hasTemplateFile ? (
          <TemplatePreview templateFile={templateFile} />
        ) : (
          <FileDropzone
            accept={{ 'text/html': ['.htm', '.html'] }}
            onFilesSelected={handleDrop}
          />
        )}
      </div>

      {/* Bottom: Template Fields */}
      {hasTemplateFile && (
        <div className="col-span-full">
          <div className="bg-white border rounded shadow p-4 overflow-auto max-h-[60vh] sm:max-h-[400px]">
            <div className="sticky top-0 bg-white z-10 pb-2 border-b mb-4">
              <h2 className="text-lg font-semibold">Template Fields</h2>
            </div>

            <div className="space-y-2">
              {templateBlocks.map((blockName, i) => (
                <TemplateFieldRow
                  key={`block-${i}`}
                  label={blockName}
                  value={`${blockName}s[]`}
                  readOnly
                  templateName={templateName}
                />
              ))}

              {templateFields.map((field, i) => (
                <TemplateFieldRow
                  key={`field-${i}`}
                  label={field}
                  value={templateFieldValues[field] || ''}
                  onChange={(val) =>
                    setTemplateFieldValues((prev) => ({
                      ...prev,
                      [field]: val,
                    }))
                  }
                  templateName={templateName}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateBuilder;
