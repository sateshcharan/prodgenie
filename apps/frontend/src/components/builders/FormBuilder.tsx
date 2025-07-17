import { Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SelectContent, SelectTrigger } from '@radix-ui/react-select';

import {
  Input,
  Button,
  Select,
  SelectItem,
  Label,
  ScrollArea,
} from '@prodgenie/libs/ui';

// Types
export type Field = {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  colSpan?: number;
};

type Section = {
  title: string;
  fields: Field[];
};

const FormBuilder = ({ jobCardData: initialConfig }: any) => {
  const [formFields, setFormFields] = useState<Field[]>([]);
  const [formSections, setFormSections] = useState<Section[]>([]);

  useEffect(() => {
    if (initialConfig?.fields) {
      const enriched = initialConfig.fields.map((f: any, i: any) => ({
        ...f,
        colSpan: f.colSpan || 3,
        defaultValue: f.defaultValue || '',
      }));
      setFormFields(enriched);
    }
    console.log(formFields);
  }, [initialConfig]);

  const addField = () =>
    setFormFields([
      ...formFields,
      {
        name: `Name`,
        label: 'Label',
        placeholder: 'Placeholder',
        defaultValue: 'Default Value',
        type: 'select',
        colSpan: 3,
      },
    ]);

  // const addSection = () =>
  //   setFormFields([
  //     ...formFields,
  //     {
  //       name: `Name`,
  //       label: 'Label',
  //       placeholder: 'Placeholder',
  //       defaultValue: 'Default Value',
  //       type: 'select',
  //       colSpan: 3,
  //     },
  //   ]);

  const addSection = () =>
    setFormSections([
      ...formSections,
      {
        title: `Section ${formSections.length + 1}`,
        fields: [
          {
            name: `name`,
            label: 'Label',
            placeholder: 'Placeholder',
            defaultValue: '',
            type: 'text',
            colSpan: 3,
          },
        ],
      },
    ]);

  const addFieldToSection = (sectionIndex: number) => {
    const updated = [...formSections];
    updated[sectionIndex].fields.push({
      name: `name`,
      label: 'Label',
      placeholder: 'Placeholder',
      defaultValue: '',
      type: 'text',
      colSpan: 3,
    });
    setFormSections(updated);
  };

  const updateField = (index: number, updated: Partial<Field>) => {
    const newFields = [...formFields];
    newFields[index] = { ...newFields[index], ...updated };
    setFormFields(newFields);
  };

  // const updateField = (
  //   sectionIndex: number,
  //   fieldIndex: number,
  //   updated: Partial<Field>
  // ) => {
  //   const updatedSections = [...formSections];
  //   updatedSections[sectionIndex].fields[fieldIndex] = {
  //     ...updatedSections[sectionIndex].fields[fieldIndex],
  //     ...updated,
  //   };
  //   setFormSections(updatedSections);
  // };

  const removeField = (index: number) => {
    const newFields = [...formFields];
    newFields.splice(index, 1);
    setFormFields(newFields);
  };

  return (
    <div className="p-2 mt-4 border max-w-[700px]">
      <ScrollArea>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold mb-4">Job Card Form Fields</h2>
          <Button onClick={addSection} variant="outline">
            <Plus className="mr-2 w-4 h-4" /> Add Section
          </Button>
          <Button onClick={addField} variant="outline">
            <Plus className="mr-2 w-4 h-4" /> Add Field
          </Button>
        </div>

        {formFields.length === 0 && <p>No fields added yet.</p>}

        <div className="grid gap-4">
          {formFields.map((field, index) => (
            <div
              key={index}
              className="grid grid-cols-12 items-center gap-4 border p-4 rounded-md"
            >
              <div className="col-span-3">
                <Input
                  value={field.name}
                  onChange={(e) => updateField(index, { name: e.target.value })}
                  placeholder={field.placeholder}
                />
              </div>

              <div className="col-span-3">
                <Input
                  value={field.label}
                  onChange={(e) =>
                    updateField(index, { label: e.target.value })
                  }
                  placeholder={field.placeholder}
                />
              </div>

              <div className="col-span-2">
                <Input
                  value={field.placeholder}
                  onChange={(e) =>
                    updateField(index, { placeholder: e.target.value })
                  }
                  placeholder={field.placeholder}
                />
              </div>

              <div className="col-span-2">
                {field.type === 'select' && (
                  <Input
                    placeholder="Option1,Option2"
                    onChange={(e) =>
                      updateField(index, {
                        options: e.target.value.split(',').map((v) => v.trim()),
                      })
                    }
                  />
                )}
              </div>

              <div className="col-span-2">
                <Select
                  value={field.type}
                  onValueChange={(val) =>
                    updateField(index, { type: val as Field['type'] })
                  }
                >
                  <SelectContent>
                    <SelectTrigger className="w-full" />
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                    </SelectContent>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Input
                  type="number"
                  value={field.colSpan || 1}
                  onChange={(e) =>
                    updateField(index, { colSpan: Number(e.target.value) })
                  }
                  min={1}
                  max={12}
                  placeholder="Col Span"
                />
              </div>

              <div className="col-span-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}

          {/* {formSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6 border p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-bold">{section.title}</h3>
                <Button
                  onClick={() => addFieldToSection(sectionIndex)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="mr-1 w-4 h-4" />
                  Add Field
                </Button>
              </div>

              <div className="grid gap-4">
                {section.fields.map((field, fieldIndex) => (
                  <div
                    key={fieldIndex}
                    className="grid grid-cols-12 items-center gap-4 border p-2 rounded-md"
                  >
                    // Field editors: name, label, placeholder, type, options, etc. 
                    <Input
                      value={field.name}
                      onChange={(e) =>
                        updateField(sectionIndex, fieldIndex, {
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))} */}
        </div>

        <h3 className="text-lg font-semibold mt-8">Preview</h3>
        <DynamicForm fields={formFields} />
        {/* <DynamicForm
          sections={[
            {
              title: 'Basic Info',
              fields: [
                {
                  name: 'name',
                  label: 'Name',
                  placeholder: 'Enter name',
                  type: 'text',
                  colSpan: 6,
                },
                {
                  name: 'age',
                  label: 'Age',
                  placeholder: 'Enter age',
                  type: 'number',
                  colSpan: 6,
                },
              ],
            },
          ]}
        /> */}
      </ScrollArea>
    </div>
  );
};

function DynamicForm({ fields }: { fields: Field[] }) {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    function flattenJobCardFormObject(
      obj: Record<string, any>,
      parentKey = 'jobCardForm',
      result: Record<string, string> = {}
    ): Record<string, string> {
      for (const key in obj) {
        const value = obj[key];
        const newKey = `${parentKey}_${key}`;
        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          flattenJobCardFormObject(value, newKey, result);
        } else {
          result[newKey] = String(value); // Ensure string output
        }
      }
      return result;
    }

    const flattenedData = flattenJobCardFormObject(data);
    console.log(flattenedData);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-12 gap-4 p-4 border rounded-md"
    >
      {fields.map((field, i) => {
        const col = `col-span-${Math.min(field.colSpan || 3, 12)}`;
        return (
          <div key={i} className="col-span-3">
            <label className="block mb-1 text-sm font-medium">
              {field.label}
            </label>
            {field.type === 'text' && (
              <Input
                {...register(field.name)}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue}
              />
            )}
            {field.type === 'number' && (
              <Input
                {...register(field.name)}
                type="number"
                placeholder={field.placeholder}
                defaultValue={field.defaultValue}
              />
            )}
            {field.type === 'select' && (
              <Select {...register(field.name)}>
                {(field.options || []).map((opt, idx) => (
                  <SelectItem key={idx} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </Select>
            )}
          </div>
        );
      })}
      <div className="col-span-12">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}

// function DynamicForm({ sections }: { sections: Section[] }) {
//   const { register, handleSubmit } = useForm();

//   const onSubmit = (data: any) => {
//     console.log(data);
//   };

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="grid grid-cols-12 gap-4 p-4 border rounded-md"
//     >
//       {sections.map((section, i) => (
//         <div key={i} className="col-span-12 mb-4">
//           <h4 className="text-md font-semibold mb-2">{section.title}</h4>
//           <div className="grid grid-cols-12 gap-4">
//             {section.fields.map((field, j) => (
//               <div key={j} className={`col-span-${field.colSpan || 3}`}>
//                 <Label>{field.label}</Label>
//                 {field.type === 'text' && (
//                   <Input
//                     {...register(`${section.title}.${field.name}`)}
//                     placeholder={field.placeholder}
//                     defaultValue={field.defaultValue}
//                   />
//                 )}
//                 {field.type === 'number' && (
//                   <Input
//                     {...register(`${section.title}.${field.name}`)}
//                     type="number"
//                     placeholder={field.placeholder}
//                     defaultValue={field.defaultValue}
//                   />
//                 )}
//                 {field.type === 'select' && (
//                   <Select {...register(`${section.title}.${field.name}`)}>
//                     {(field.options || []).map((opt, idx) => (
//                       <SelectItem key={idx} value={opt}>
//                         {opt}
//                       </SelectItem>
//                     ))}
//                   </Select>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//       <div className="col-span-12">
//         <Button type="submit">Submit</Button>
//       </div>
//     </form>
//   );
// }

export default FormBuilder;
