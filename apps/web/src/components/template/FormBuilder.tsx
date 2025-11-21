import { z } from 'zod';
import axios from 'axios';
import {
  Controller,
  useForm,
  useFieldArray,
  FormProvider,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash, Plus, X, Check, RefreshCcw } from 'lucide-react';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from '@prodgenie/libs/ui/select';
import { Input } from '@prodgenie/libs/ui/input';
import { Button } from '@prodgenie/libs/ui/button';
import { Label } from '@prodgenie/libs/ui/label';
import { Separator } from '@prodgenie/libs/ui/separator';
import { ScrollArea } from '@prodgenie/libs/ui/scroll-area';
import { apiRoutes } from '@prodgenie/libs/constant';
import { formBuilderSchema } from '@prodgenie/libs/schema';
import { StringService } from '@prodgenie/libs/shared-utils';

import api from '../../utils/api';
import PreviewForm from './PreviewForm';

const stringService = new StringService();

export type FormBuilderSchema = z.infer<typeof formBuilderSchema>;

const FormBuilder = forwardRef(({ jobCardData, onFormSubmit }: any, ref) => {
  const [schema, setSchema] = useState<any>(null);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [tableColumns, setTableColumns] = useState<Record<string, string[]>>(
    {}
  );

  const builderForm = useForm<FormBuilderSchema>({
    resolver: zodResolver(formBuilderSchema),
    defaultValues: {
      formSections: [],
    },
  });

  const {
    control,
    handleSubmit: handleBuilderSubmit,
    watch,
    register,
    setValue,
    formState: { errors },
  } = builderForm;

  const {
    fields: sectionFields,
    append,
    remove,
    replace,
  } = useFieldArray({
    control,
    name: 'formSections',
  });

  const watchedSections = watch('formSections');

  useImperativeHandle(ref, () => ({
    saveTemplate: handleSaveTemplate,
  }));

  useEffect(() => {
    if (!jobCardData || !Array.isArray(jobCardData.sections)) return;

    // If schema is already provided, just use it
    const mappedSections = jobCardData.sections.map((section: any) => ({
      ...section,
      schema: section.schema || generateZodSchemaString(section.fields),
    }));
    // setValue('formSections', mappedSections);
    replace(mappedSections);
  }, [jobCardData]);

  useEffect(() => {
    const getTables = async () => {
      try {
        const res = await api.get(`${apiRoutes.files.base}/table/list`);
        const tables = res.data?.data || [];
        setAvailableTables(tables);
      } catch (err) {
        console.error('Error fetching tables:', err);
      }
    };
    getTables();
  }, []);

  useEffect(() => {
    if (!watchedSections.length) return;

    const parsedSchemas = watchedSections.map((section) => {
      try {
        const schemaFn = new Function('z', `return (${section.schema})`);
        return schemaFn(z);
      } catch (e) {
        console.error(`Error parsing schema for section "${section.name}":`, e);
        return z.object({});
      }
    });

    const merged = z.object(
      watchedSections.reduce((acc, section, idx) => {
        const key = section.name || `section${idx}`;
        acc[key] = parsedSchemas[idx];
        return acc;
      }, {} as Record<string, z.ZodTypeAny>)
    );

    setSchema(merged);

    // console.log(watchedSections);
  }, [watchedSections]);

  useEffect(() => {
    if (!watchedSections.length) return;

    const updatedSections = watchedSections.map((section) => ({
      ...section,
      fields: section.fields.map((f: any) => ({ ...f })),
      schema: generateZodSchemaString(section.fields),
    }));

    replace(updatedSections);

    // console.log(watchedSections);
  }, [
    watchedSections.length,
    watchedSections.map((s) => s.fields.length).join(','),
  ]);

  useEffect(() => {
    watchedSections.forEach((section, sectionIndex) => {
      section.fields.forEach(async (field, fieldIndex) => {
        if (field.type === 'select' && field.dataSource?.table) {
          const tableUrl = availableTables.find(
            (t) => t.name === field.dataSource.table
          )?.path;

          if (!tableUrl) return;

          try {
            const res = await axios.get(tableUrl);

            // Same logic you already have
            // const cols =
            //   res.data?.columns?.map((c: any) => c.name || c.label) ||
            //   (Array.isArray(res.data.rows) && res.data.rows.length > 0
            //     ? Object.keys(res.data.rows[0])
            //     : []);

            const cols =
              res.data?.columns?.map((c: any) => ({
                key: c.key, // key to use in rows
                label: c.label || c.name, // fallback if no label
              })) ||
              (Array.isArray(res.data.rows) && res.data.rows.length > 0
                ? Object.keys(res.data.rows[0]).map((key) => ({
                    key: key,
                    label: key,
                  }))
                : []);

            setTableColumns((prev) => ({
              ...prev,
              [`${sectionIndex}-${fieldIndex}`]: cols,
            }));
          } catch (err) {
            console.error('Error fetching initial table columns:', err);
          }
        }
      });
    });
  }, [watchedSections, availableTables]);

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
  });

  const generateZodSchemaString = (fields: any[]): string => {
    const schemaTree: any = {};

    const getZodType = (type: string) => {
      if (type === 'number') return 'z.number().min(1)';
      if (type === 'text') return 'z.string().min(1)';
      return 'z.any()';
    };

    // Builds a nested object structure
    for (const field of fields) {
      const keys = field.name.split('.');
      const zodType = getZodType(field.type);

      let current = schemaTree;
      keys.forEach((key: string, index: number) => {
        if (index === keys.length - 1) {
          current[key] = zodType;
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      });
    }

    const buildZod = (obj: any, indent = 2): string => {
      const pad = (level: number) => ' '.repeat(level);
      const entries = Object.entries(obj)
        .map(([key, val]) => {
          if (typeof val === 'string') {
            return `${pad(indent)}${key}: ${val}`;
          } else {
            return `${pad(indent)}${key}: z.object({${buildZod(
              val,
              indent + 2
            )}${pad(indent)}})`;
          }
        })
        .join(',');
      return entries;
    };

    return `z.object({${buildZod(schemaTree)}})`;
  };

  const addSection = () => {
    const newFields = [
      {
        name: 'name',
        label: 'Label',
        placeholder: 'Placeholder',
        defaultValue: '',
        type: 'text',
      },
    ];

    append({
      name: `Section ${sectionFields.length + 1}`,
      fields: newFields as any,
      schema: generateZodSchemaString(newFields),
    });
  };

  const handleRemoveSection = (indexToRemove: number) => remove(indexToRemove);

  const addFieldToSection = (sectionIndex: number) => {
    const current = watch(`formSections.${sectionIndex}.fields`);
    setValue(`formSections.${sectionIndex}.fields`, [
      ...current,
      {
        name: 'name',
        label: 'Label',
        placeholder: 'Placeholder',
        defaultValue: '',
        type: 'text',
      },
    ]);
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    const current = watch(`formSections.${sectionIndex}.fields`);
    const updated = current.filter((_, idx) => idx !== fieldIndex);
    setValue(`formSections.${sectionIndex}.fields`, updated);
  };

  const handleSaveTemplate = () => {
    const builderResult = formBuilderSchema.safeParse({
      formSections: builderForm.getValues('formSections'),
    });

    if (!builderResult.success) {
      console.error(builderResult.error.format());
      alert('Fix issues in form builder before saving.');
      return;
    }

    const formData = {
      jobCardForm: { sections: builderResult.data.formSections },
    };

    onFormSubmit(formData);
  };

  const fetchTableColumns = async (
    tableName: string,
    sectionIndex: number,
    fieldIndex: number
  ) => {
    const tableUrl = availableTables.find((t) => t.name === tableName)?.path;
    if (!tableUrl) return;

    try {
      const res = await axios.get(tableUrl);

      // const cols =
      //   res.data?.columns?.map((c: any) => c.name || c.label) ||
      //   (Array.isArray(res.data.rows) && res.data.rows.length > 0
      //     ? Object.keys(res.data.rows[0])
      //     : []);

      const cols =
        res.data?.columns?.map((c: any) => ({
          key: c.key || c.name,
          label: c.label || c.name,
        })) ||
        (Array.isArray(res.data.rows) && res.data.rows.length > 0
          ? Object.keys(res.data.rows[0]).map((key) => ({ key, label: key }))
          : []);

      console.log(cols); // check this

      setTableColumns((prev) => ({
        ...prev,
        [`${sectionIndex}-${fieldIndex}`]: cols,
      }));

      const currentColumn = watch(
        `formSections.${sectionIndex}.fields.${fieldIndex}.dataSource.column`
      );
      if (currentColumn) {
        const rows = Array.isArray(res.data) ? res.data : res.data.rows || [];
        const columnOptions = rows
          .map((row: any) => row[currentColumn])
          .filter(Boolean);

        setValue(
          `formSections.${sectionIndex}.fields.${fieldIndex}.dataSource.options`,
          columnOptions
        );
      }
    } catch (err) {
      console.error('Error fetching table columns:', err);
    }
  };

  return (
    <div className="bg-white  rounded shadow  overflow-auto ">
      <div className="flex justify-between items-center  gap-4">
        <h3 className="text-md font-semibold">Job Card Form Sections</h3>
        <div className="flex flex-row gap-2 p-2">
          <Button onClick={addSection} variant="outline">
            <Plus className="mr-2 w-4 h-4" />
            Add Section
          </Button>
        </div>
      </div>

      <ScrollArea>
        {sectionFields.map((section, sectionIndex) => (
          <div key={section.id} className="mb-6 border p-4 rounded-md">
            <div className="flex  justify-between items-center mb-2">
              <Input
                {...register(`formSections.${sectionIndex}.name`)}
                className="text-md font-bold px-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none w-auto"
                placeholder="Section Title"
              />
              <div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => addFieldToSection(sectionIndex)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSection(sectionIndex)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {watch(`formSections.${sectionIndex}.fields`)?.map(
                (field, fieldIndex) => (
                  <div key={fieldIndex} className="flex flex-col gap-4">
                    <div className="flex gap-2 items-center">
                      <Input
                        className="col-span-3"
                        {...register(
                          `formSections.${sectionIndex}.fields.${fieldIndex}.name`
                        )}
                        placeholder="Name"
                      />
                      <Button
                        // onClick={() => removeField(sectionIndex, fieldIndex)}
                        className=" text-bold  p-1"
                        title="Save section"
                        variant="ghost"
                        size="icon"
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        onClick={() => removeField(sectionIndex, fieldIndex)}
                        className=" p-1"
                        title="Delete section"
                        variant="ghost"
                        size="icon"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <h3>Label: </h3>
                      <Input
                        className="col-span-3"
                        {...register(
                          `formSections.${sectionIndex}.fields.${fieldIndex}.label`
                        )}
                        placeholder="Label"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <h3>Placeholder: </h3>
                      <Input
                        className="col-span-3"
                        {...register(
                          `formSections.${sectionIndex}.fields.${fieldIndex}.placeholder`
                        )}
                        placeholder="Placeholder"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <h3>Field Type: </h3>
                      <div className="col-span-2 border">
                        <Select
                          value={field.type}
                          onValueChange={(val) =>
                            setValue(
                              `formSections.${sectionIndex}.fields.${fieldIndex}.type`,
                              val as any
                            )
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="select data type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {field.type === 'select' && (
                        <div className="col-span-12 grid grid-cols-12 gap-2">
                          {/* Table dropdown */}
                          <div className="col-span-6">
                            <Select
                              value={field.dataSource?.table || ''}
                              onValueChange={async (val) => {
                                setValue(
                                  `formSections.${sectionIndex}.fields.${fieldIndex}.dataSource.table`,
                                  val
                                );

                                fetchTableColumns(
                                  val,
                                  sectionIndex,
                                  fieldIndex
                                );
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select table" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTables.map((table) => (
                                  <SelectItem key={table.id} value={table.name}>
                                    {table.name.split('.')[0]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Column dropdown */}
                          <div className="col-span-6">
                            <Select
                              value={field.dataSource?.column || ''}
                              onValueChange={async (val) => {
                                setValue(
                                  `formSections.${sectionIndex}.fields.${fieldIndex}.dataSource.column`,
                                  val
                                );

                                console.log(val);

                                // Fetch rows for this table to populate options
                                const tableUrl = availableTables.find(
                                  (t) => t.name === field.dataSource?.table
                                )?.path;

                                if (tableUrl) {
                                  try {
                                    const res = await axios.get(tableUrl);
                                    const rows = res.data.rows || [];

                                    console.log('API response:', res.data);
                                    console.log('Rows:', rows);
                                    console.log('Selected column:', val);

                                    const columnOptions = rows
                                      .map((row: any) => row[val.toLowerCase()])
                                      .filter(Boolean);

                                    setValue(
                                      `formSections.${sectionIndex}.fields.${fieldIndex}.dataSource.options`,
                                      columnOptions,
                                      {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      }
                                    );
                                    console.log(
                                      'Final options:',
                                      columnOptions
                                    );
                                  } catch (err) {
                                    console.error('Error fetching rows:', err);
                                  }
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select column" />
                              </SelectTrigger>
                              <SelectContent>
                                {
                                  // console.log(tableColumns),
                                  (
                                    tableColumns[
                                      `${sectionIndex}-${fieldIndex}`
                                    ] || []
                                  ).map((col, index) => (
                                    <SelectItem key={index} value={col.key}>
                                      {col.label}
                                    </SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                    <Separator />
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </ScrollArea>

      <div className="flex justify-between items-center  gap-4">
        <h3 className="text-md font-semibold">Preview</h3>
        <div className="flex flex-row gap-2 p-2">
          <Button
            onClick={() => console.log('update preview logic')}
            // onClick={() => window.location.reload()}
            variant="outline"
          >
            <RefreshCcw className="mr-2 w-4 h-4" />
            Update Preview
          </Button>
        </div>
      </div>
      <PreviewForm
        sections={watchedSections}
        form={form}
        handleSaveTemplate={handleSaveTemplate}
        availableTables={availableTables}
      />
    </div>
  );
});

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

export default FormBuilder;
