import { z } from 'zod';
import { Trash2, Plus, X } from 'lucide-react';
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
} from '@prodgenie/libs/ui';

export const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  label: z.string().min(1, 'Field label is required'),
  placeholder: z.union([z.string(), z.number()]).optional(),
  defaultValue: z.union([z.string(), z.number()]).optional(),
  type: z.enum(['text', 'number', 'select']),
  options: z.array(z.string()).optional(),
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
                  className="grid grid-cols-12 items-center gap-4 border p-2 rounded-md"
                >
                  <Input
                    className="col-span-3"
                    {...register(
                      `formSections.${sectionIndex}.fields.${fieldIndex}.name`
                    )}
                    placeholder="Name"
                  />
                  <Input
                    className="col-span-3"
                    {...register(
                      `formSections.${sectionIndex}.fields.${fieldIndex}.label`
                    )}
                    placeholder="Label"
                  />
                  <Input
                    className="col-span-3"
                    {...register(
                      `formSections.${sectionIndex}.fields.${fieldIndex}.placeholder`
                    )}
                    placeholder="Placeholder"
                  />
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(sectionIndex, fieldIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
      />
    </div>
  );
});

const DynamicForm = ({
  sections,
  form,
  handleSaveTemplate,
}: {
  sections: any[];
  form: any;
  handleSaveTemplate: any;
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
                {field.type === 'select' && (
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
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </form>
  );
};

export default FormBuilder;
