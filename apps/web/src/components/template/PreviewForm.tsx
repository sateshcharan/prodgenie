import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, FormProvider } from 'react-hook-form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@prodgenie/libs/ui/select';
import { Input } from '@prodgenie/libs/ui/input';
import { Label } from '@prodgenie/libs/ui/label';

const PreviewForm = ({
  sections,
  form,
  handleSaveTemplate,
  availableTables,
}: {
  sections: any[];
  form: any;
  handleSaveTemplate: any;
  availableTables: any[];
}) => {
  const { register, handleSubmit, control } = form;

  // Keep options per field (keyed by sectionIndex-fieldIndex)
  const [fieldOptions, setFieldOptions] = useState<Record<string, string[]>>(
    {}
  );

  useEffect(() => {
    const fetchOptions = async () => {
      for (let i = 0; i < sections.length; i++) {
        for (let j = 0; j < sections[i].fields.length; j++) {
          const field = sections[i].fields[j];
          if (field.type !== 'select') continue;

          let resolved: string[] = [];

          try {
            if (field.dataSource?.table && field.dataSource?.column) {
              const tableUrl = availableTables.find(
                (t) => t.name === field.dataSource.table
              )?.path;

              if (tableUrl) {
                const res = await axios.get(tableUrl);
                const rows = Array.isArray(res.data)
                  ? res.data
                  : res.data.rows || [];

                resolved = rows.map(
                  (row: any) =>
                    row[field.dataSource.column] ??
                    row[field.dataSource.column.toLowerCase()]
                );
              }
            } else {
              resolved = field.options || [];
              // console.log(resolved);
            }
          } catch (err) {
            console.error(`Error fetching options for ${field.name}:`, err);
          }

          setFieldOptions((prev) => ({
            ...prev,
            [`${i}-${j}`]: resolved,
          }));
        }
      }
    };

    fetchOptions();
  }, [sections, availableTables]);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(handleSaveTemplate)}
        className="space-y-8 p-6 border rounded-lg bg-background shadow-sm"
      >
        {sections.map((section, i) => (
          <div key={i} className="space-y-4">
            {/* Section Title */}
            <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
              {section.name}
            </h4>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.fields.map((field: any, j: number) => {
                const fieldKey = `${i}-${j}`;
                const options = fieldOptions[fieldKey] || [];

                return (
                  <div key={j} className="flex flex-col gap-2">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-gray-700"
                    >
                      {field.label}
                    </Label>

                    {field.type === 'text' && (
                      <Input
                        disabled
                        id={field.name}
                        {...register(field.name)}
                        placeholder={field.placeholder}
                        className="w-full"
                      />
                    )}

                    {field.type === 'number' && (
                      <Input
                        type="number"
                        id={field.name}
                        {...register(field.name, { valueAsNumber: true })}
                        placeholder={field.placeholder}
                        className="w-full"
                      />
                    )}

                    {field.type === 'time' && (
                      <Input
                        type="time"
                        id={field.name}
                        {...register(field.name)}
                        className="w-full"
                      />
                    )}

                    {field.type === 'select' && (
                      <Controller
                        control={control}
                        name={field.name}
                        render={({ field: controllerField }) => (
                          <Select
                            value={controllerField.value}
                            onValueChange={controllerField.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              {options.map((opt, idx) => (
                                <SelectItem key={idx} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </form>
    </FormProvider>
  );
};

export default PreviewForm;

// const PreviewForm = ({
//   sections,
//   form,
//   handleSaveTemplate,
//   availableTables,
// }: {
//   sections: any[];
//   form: any;
//   handleSaveTemplate: any;
//   availableTables: any;
// }) => {
//   const { register, handleSubmit, control } = form;

//   return (
//     <form
//       onSubmit={handleSubmit(handleSaveTemplate)}
//       className="grid grid-cols-12 gap-4 p-4 border rounded-md"
//     >
//       {sections.map((section, i) => (
//         <div key={i} className="col-span-12 mb-4">
//           <h4 className="text-md font-semibold mb-2 ">{section.name}</h4>
//           <div className="grid grid-cols-12 gap-4">
//             {section.fields.map((field: any, j: number) => (
//               <div key={j} className={`col-span-3`}>
//                 <Label>{field.label}</Label>

//                 {field.type === 'text' && (
//                   <Input
//                     disabled
//                     id={field.name}
//                     {...register(field.name)}
//                     placeholder={field.placeholder}
//                   />
//                 )}

//                 {field.type === 'number' && (
//                   <Input
//                     disabled
//                     type="number"
//                     id={field.name}
//                     {...register(field.name, { valueAsNumber: true })}
//                     placeholder={field.placeholder}
//                   />
//                 )}
//                 {/* {field.type === 'select' && (
//                   <Controller
//                     control={form.control}
//                     name={`${field.name}`}
//                     render={({ field: controllerField }) => (
//                       <Select {...controllerField}>
//                         {(field.options || []).map((opt: any, idx: number) => (
//                           <SelectItem key={idx} value={opt}>
//                             {opt}
//                           </SelectItem>
//                         ))}
//                       </Select>
//                     )}
//                   />
//                 )} */}

//                 {field.type === 'select' && (
//                   <Controller
//                     control={form.control}
//                     name={`${field.name}`}
//                     render={({ field: controllerField }) => (
//                       <DynamicSelect
//                         field={field}
//                         controllerField={controllerField}
//                         availableTables={availableTables}
//                       />
//                     )}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </form>
//   );
// };

// const PreviewForm = ({
//   sections,
//   form,
//   handleSaveTemplate,
//   availableTables,
// }: {
//   sections: any[];
//   form: any;
//   handleSaveTemplate: any;
//   availableTables: any;
// }) => {
//   const { register, handleSubmit } = form;

//   return (
//     <FormProvider {...form}>
//       <form
//         onSubmit={handleSubmit(handleSaveTemplate)}
//         className="grid grid-cols-12 gap-4 p-4 border rounded-md"
//       >
//         {sections.map((section, i) => (
//           <div key={i} className="col-span-12 mb-4">
//             <h4 className="text-md font-semibold mb-2 ">{section.name}</h4>
//             <div className="grid grid-cols-12 gap-4">
//               {section.fields.map((field: any, j: number) => (
//                 <div key={j} className={`col-span-3`}>
//                   <Label>{field.label}</Label>

//                   {field.type === 'text' && (
//                     <Input
//                       disabled
//                       id={field.name}
//                       {...register(field.name)}
//                       placeholder={field.placeholder}
//                     />
//                   )}

//                   {field.type === 'number' && (
//                     <Input
//                       disabled
//                       type="number"
//                       id={field.name}
//                       {...register(field.name, { valueAsNumber: true })}
//                       placeholder={field.placeholder}
//                     />
//                   )}

//                   {field.type === 'select' && (
//                     <Controller
//                       control={form.control}
//                       name={`${field.name}`}
//                       render={({ field: controllerField }) => (
//                         <DynamicSelect
//                           field={field}
//                           form={form}
//                           controllerField={controllerField}
//                           availableTables={availableTables}
//                         />
//                       )}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </form>
//     </FormProvider>
//   );
// };

// const DynamicSelect = ({
//   field,
//   controllerField,
//   availableTables,
// }: {
//   field: any;
//   controllerField: any;
//   availableTables: any[];
// }) => {
//   const [options, setOptions] = useState<string[]>([]);
//   const { setValue } = useFormContext();

//   useEffect(() => {
//     const fetchOptions = async () => {
//       try {
//         let resolved: string[] = [];

//         if (field.dataSource?.table && field.dataSource?.column) {
//           // find table url from availableTables
//           const tableUrl = availableTables.find(
//             (t) => t.name === field.dataSource.table
//           )?.path;

//           if (!tableUrl) return;

//           const res = await axios.get(tableUrl);
//           const rows = Array.isArray(res.data) ? res.data : res.data.rows || [];

//           resolved = rows.map(
//             (row: any) =>
//               row[field.dataSource.column] ??
//               row[field.dataSource.column.toLowerCase()]
//           );
//         } else {
//           resolved = field.options || [];
//         }

//         setOptions(resolved);

//         setValue(`${controllerField.name}.options`, resolved, {
//           shouldDirty: true,
//           shouldValidate: false,
//         });
//       } catch (err) {
//         console.error('Error fetching select options:', err);
//         setOptions([]);
//       }
//     };

//     fetchOptions();
//   }, [field.dataSource?.table, field.dataSource?.column, availableTables]);

//   return (
//     <Select
//       value={controllerField.value}
//       onValueChange={controllerField.onChange}
//     >
//       <SelectTrigger className="w-full">
//         <SelectValue placeholder="Select option" />
//       </SelectTrigger>
//       <SelectContent>
//         {options.map((opt, idx) => (
//           <SelectItem key={opt} value={opt}>
//             {opt}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// };

// const ColumnSelect = ({
//   availableTables,
//   tableName,
//   value,
//   onChange,
// }: {
//   availableTables: any[];
//   tableName?: string;
//   value: string;
//   onChange: (val: string) => void;
// }) => {
//   const [columns, setColumns] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchColumns = async () => {
//       if (!tableName) {
//         setColumns([]);
//         return;
//       }

//       const tableUrl = availableTables.find((t) => t.name === tableName)?.path;
//       try {
//         const res = await axios.get(tableUrl); // 🔑 fetch directly from availableTables.url
//         const columnLabels = res.data.columns.map((col: any) => col.label);
//         if (columnLabels.length > 0) {
//           setColumns(columnLabels); // first row → keys
//         } else {
//           setColumns([]);
//         }
//       } catch (err) {
//         console.error('Error fetching columns:', err);
//         setColumns([]);
//       }
//     };

//     fetchColumns();
//   }, [tableName]);

//   return (
//     <Select value={value} onValueChange={onChange}>
//       <SelectTrigger className="w-full col-span-4">
//         <SelectValue placeholder="Select column" />
//       </SelectTrigger>
//       <SelectContent>
//         {columns.map((col) => (
//           <SelectItem key={col} value={col}>
//             {col}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// };
