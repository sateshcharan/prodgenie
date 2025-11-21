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
              console.log(resolved);
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
        className="space-y-8 p-6 border rounded-lg bg-white shadow-sm"
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
                        disabled
                        type="number"
                        id={field.name}
                        {...register(field.name, { valueAsNumber: true })}
                        placeholder={field.placeholder}
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
