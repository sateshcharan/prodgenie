import { z } from 'zod';
import { Trash, Plus, X, Check } from 'lucide-react';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Input,
  Button,
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  Label,
  SelectValue,
  ScrollArea,
  Separator,
} from '@prodgenie/libs/ui';
import { api } from '../utils';
import { apiRoutes } from '@prodgenie/libs/constant';
import axios from 'axios';

export const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  label: z.string().min(1, 'Field label is required'),
  placeholder: z.union([z.string(), z.number()]).optional(),
  defaultValue: z.union([z.string(), z.number()]).optional(),
  type: z.enum(['text', 'number', 'select']),
  options: z.array(z.string()).optional(),
  dataSource: z
    .object({
      table: z.string(),
      column: z.string(),
      // labelKey: z.string(),
      // apiUrl: z.string().url().optional(),
    })
    .optional(),
});

export const sectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  fields: z.array(fieldSchema),
  schema: z.string().optional(),
});
export const formBuilderSchema = z.object({
  formSections: z.array(sectionSchema),
});

export type FormBuilderSchema = z.infer<typeof formBuilderSchema>;

const FormBuilder = forwardRef(({ jobCardData, onFormSubmit }: any, ref) => {
  const [schema, setSchema] = useState<any>(null);
  const [availableTables, setAvailableTables] = useState<string[]>([]);

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

  // 💡 Hook up builderForm to formSections
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
  }, [watchedSections]);

  useEffect(() => {
    if (!watchedSections.length) return;

    const updatedSections = watchedSections.map((section) => ({
      ...section,
      schema: generateZodSchemaString(section.fields),
    }));

    replace(updatedSections);
  }, [
    watchedSections.length,
    watchedSections.map((s) => s.fields.length).join(','),
  ]);

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
  });

  // function generateZodSchemaString(fields: any[]): string {
  //   const nested: Record<string, string[]> = {};
  //   const flat: string[] = [];

  //   for (const field of fields) {
  //     const zodType =
  //       field.type === 'number'
  //         ? 'z.number().min(1)'
  //         : field.type === 'text'
  //         ? 'z.string().min(1)'
  //         : 'z.any()';

  //     const parts = field.name.split('.');
  //     if (parts.length === 1) {
  //       flat.push(`${JSON.stringify(field.name)}: ${zodType}`);
  //     } else {
  //       const [parent, child] = parts;
  //       if (!nested[parent]) nested[parent] = [];
  //       nested[parent].push(`${JSON.stringify(child)}: ${zodType}`);
  //     }
  //   }

  //   const nestedObjects = Object.entries(nested).map(
  //     ([key, fields]) =>
  //       `${JSON.stringify(key)}: z.object({\n  ${fields.join(',\n  ')}\n})`
  //   );

  //   const allEntries = [...flat, ...nestedObjects];

  //   return `z.object({\n${allEntries.join(',\n')}\n})`;
  // }

  function generateZodSchemaString(fields: any[]): string {
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
  }

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
      formSections: watchedSections,
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

  return (
    <div className="bg-white border rounded shadow p-2 overflow-auto ">
      <div className="flex justify-between items-center  gap-4">
        <h2 className="text-lg font-semibold">Job Card Form Sections</h2>
        <div className="flex flex-row gap-2 p-2">
          <Button onClick={addSection} variant="outline">
            <Plus className="mr-2 w-4 h-4" />
            Add Section
          </Button>
          {/* 
          <Button type="button" onClick={handleSaveTemplate}>
            Save Template
          </Button> */}
        </div>
      </div>

      {sectionFields.map((section, sectionIndex) => (
        <div key={section.id} className="mb-6 border p-4 rounded-md">
          <div className="flex  justify-between items-center mb-2">
            {/* <h3 className="text-md font-bold">
              {watch(`formSections.${sectionIndex}.name`)}
            </h3> */}
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
                <div
                  key={fieldIndex}
                  // className="grid grid-cols-12 items-center gap-4  p-2 rounded-md"
                  className="flex flex-col gap-4"
                >
                  <div className="flex gap-2 items-center">
                    <Input
                      className="col-span-3"
                      {...register(
                        `formSections.${sectionIndex}.fields.${fieldIndex}.name`
                      )}
                      placeholder="Name"
                    />
                    <Button
                      onClick={() => removeField(sectionIndex, fieldIndex)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete section"
                      variant="ghost"
                      size="icon"
                    >
                      <Trash size={16} />
                    </Button>
                    <Button
                      // onClick={() => removeField(sectionIndex, fieldIndex)}
                      className=" text-bold text-green-500 hover:text-green-700 p-1"
                      title="Save section"
                      variant="ghost"
                      size="icon"
                    >
                      <Check size={16} />
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
                        <div className="col-span-6">
                          <Select
                            value={field.dataSource?.table || ''}
                            onValueChange={(val) =>
                              setValue(
                                `formSections.${sectionIndex}.fields.${fieldIndex}.dataSource.table`,
                                val
                              )
                            }
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

                        {/* column dropdown */}
                        <ColumnSelect
                          availableTables={availableTables}
                          tableName={field.dataSource?.table}
                          value={field.dataSource?.column || ''}
                          onChange={(val) =>
                            setValue(
                              `formSections.${sectionIndex}.fields.${fieldIndex}.dataSource.column`,
                              val
                            )
                          }
                        />
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

      <h3 className="text-lg font-semibold mt-8">Preview</h3>
      <DynamicForm
        sections={watchedSections}
        form={form}
        handleSaveTemplate={handleSaveTemplate}
        availableTables={availableTables}
      />
    </div>
  );
});

const DynamicForm = ({
  sections,
  form,
  handleSaveTemplate,
  availableTables,
}: {
  sections: any[];
  form: any;
  handleSaveTemplate: any;
  availableTables: any;
}) => {
  const { register, handleSubmit, control } = form;

  return (
    <form
      onSubmit={handleSubmit(handleSaveTemplate)}
      className="grid grid-cols-12 gap-4 p-4 border rounded-md"
    >
      {sections.map((section, i) => (
        <div key={i} className="col-span-12 mb-4">
          <h4 className="text-md font-semibold mb-2 ">{section.name}</h4>
          <div className="grid grid-cols-12 gap-4">
            {section.fields.map((field: any, j: number) => (
              <div key={j} className={`col-span-3`}>
                <Label>{field.label}</Label>

                {field.type === 'text' && (
                  <Input
                    disabled
                    id={field.name}
                    {...register(field.name)}
                    placeholder={field.placeholder}
                  />
                )}

                {field.type === 'number' && (
                  <Input
                    disabled
                    type="number"
                    id={field.name}
                    {...register(field.name, { valueAsNumber: true })}
                    placeholder={field.placeholder}
                  />
                )}
                {/* {field.type === 'select' && (
                  <Controller
                    control={form.control}
                    name={`${field.name}`}
                    render={({ field: controllerField }) => (
                      <Select {...controllerField}>
                        {(field.options || []).map((opt: any, idx: number) => (
                          <SelectItem key={idx} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                )} */}

                {field.type === 'select' && (
                  <Controller
                    control={form.control}
                    name={`${field.name}`}
                    render={({ field: controllerField }) => (
                      <DynamicSelect
                        field={field}
                        controllerField={controllerField}
                        availableTables={availableTables}
                      />
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </form>
  );
};

// const DynamicSelect = ({
//   field,
//   controllerField,
// }: {
//   field: any;
//   controllerField: any;
// }) => {
//   const [options, setOptions] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchOptions = async () => {
//       try {
//         if (field.dataSource?.table) {
//           const res = await api.get(`${apiRoutes.files.base}/table/list`);

//           // Ensure response shape
//           const rows = res.data?.data || [];

//           console.log(rows);

//           setOptions(
//             rows.map(
//               (row: any) =>
//                 row[field.dataSource.labelKey] ?? row[field.dataSource.valueKey]
//             )
//           );
//         } else {
//           setOptions(field.options || []);
//         }
//       } catch (err) {
//         console.error('Error fetching select options:', err);
//       }
//     };

//     fetchOptions();
//   }, []);

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
//           <SelectItem key={idx} value={opt}>
//             {opt}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// };

const DynamicSelect = ({
  field,
  controllerField,
  availableTables,
}: {
  field: any;
  controllerField: any;
  availableTables: any[];
}) => {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if (field.dataSource?.table && field.dataSource?.column) {
          // find table url from availableTables
          const tableUrl = availableTables.find(
            (t) => t.name === field.dataSource.table
          )?.path;

          if (!tableUrl) return;

          const res = await axios.get(tableUrl);

          // if API returns an array directly
          const rows = Array.isArray(res.data) ? res.data : res.data.rows || [];

          setOptions(
            rows.map(
              (row: any) =>
                row[field.dataSource.column] ??
                row[field.dataSource.column.toLowerCase()]
            )
          );
        } else {
          setOptions(field.options || []);
        }
      } catch (err) {
        console.error('Error fetching select options:', err);
        setOptions([]);
      }
    };

    fetchOptions();
  }, [field.dataSource?.table, field.dataSource?.column, availableTables]);

  return (
    <Select
      value={controllerField.value}
      onValueChange={controllerField.onChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select option" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt, idx) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const ColumnSelect = ({
  availableTables,
  tableName,
  value,
  onChange,
}: {
  availableTables: any[];
  tableName?: string;
  value: string;
  onChange: (val: string) => void;
}) => {
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    const fetchColumns = async () => {
      if (!tableName) {
        setColumns([]);
        return;
      }

      const tableUrl = availableTables.find((t) => t.name === tableName)?.path;
      try {
        const res = await axios.get(tableUrl); // 🔑 fetch directly from availableTables.url
        const columnLabels = res.data.columns.map((col: any) => col.label);
        if (columnLabels.length > 0) {
          setColumns(columnLabels); // first row → keys
        } else {
          setColumns([]);
        }
      } catch (err) {
        console.error('Error fetching columns:', err);
        setColumns([]);
      }
    };

    fetchColumns();
  }, [tableName]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full col-span-4">
        <SelectValue placeholder="Select column" />
      </SelectTrigger>
      <SelectContent>
        {columns.map((col) => (
          <SelectItem key={col} value={col}>
            {col}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FormBuilder;
