import { object } from 'zod';
import { useEffect, useRef } from 'react';
import { Plus, Trash } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';

import { api } from '../utils';
import SuggestionInput from './SuggestionInput';

import { apiRoutes } from '@prodgenie/libs/constant';
import { Button, Input, Card, CardContent, toast } from '@prodgenie/libs/ui';

type FormulaConfig = {
  key: string;
  common: { key: string; value: string }[];
  depField: { key: string; value: string }[];
};

export default function FormulaBuilder({ fileData }: { fileData: any }) {
  const defaultProduct: FormulaConfig = {
    key: Object.keys(fileData)[0],
    common: [],
    depField: [],
  };

  const { control, handleSubmit, register, reset, setValue, getValues } =
    useForm<{
      products: FormulaConfig[];
    }>({
      defaultValues: {
        products: [defaultProduct],
      },
    });

  const {
    fields: products,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'products',
  });

  const originalConfigRef = useRef<string | null>(null);

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    const extractFromFileData = async () => {
      if (Object.keys(fileData).length > 0) {
        originalConfigRef.current = JSON.stringify(fileData); // Save original
        const transformed = Object.entries(fileData).map(
          ([key, value]: [string, any]) => ({
            key,
            common: Object.entries(value.common || {}).map(([k, v]) => ({
              key: k,
              value: v,
            })),
            depField: Object.entries(value.depField || {}).map(([k, v]) => ({
              key: k,
              value: v,
            })),
          })
        );
        reset({ products: transformed });
      }
    };

    extractFromFileData();
  }, [fileData, reset]);

  const onSubmit = async (data: { products: FormulaConfig[] }) => {
    const output: Record<string, any> = {};

    data.products.forEach((product) => {
      const commonObj: Record<string, string> = {};
      const depObj: Record<string, string> = {};

      product.common.forEach(({ key, value }) => {
        if (key) commonObj[key] = value;
      });

      product.depField.forEach(({ key, value }) => {
        if (key) depObj[key] = value;
      });

      output[product.key] = {
        common: commonObj,
        depField: depObj,
      };
    });

    const outputString = JSON.stringify(output);

    if (originalConfigRef.current === outputString) {
      console.log('⚠️ No changes detected. Skipping save.');
      return;
    }

    try {
      await api.patch(`${apiRoutes.files.base}/${id}/update`, output);
      originalConfigRef.current = outputString;
      toast('✅ File updated successfully.');
    } catch (err) {
      console.error('❌ Error updating file:', err);
    }
  };

  // Dynamically extract all depField keys from all products
  const commonFieldKeys = products
    .flatMap((product) => product.common)
    .map((field) => field.key)
    .filter((key, i, arr) => key && arr.indexOf(key) === i); // unique non-empty keys

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Formula Builder</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {products.map((product, index) => (
          <Card key={product.id}>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <h3
                  className="font-medium capitalize mt-4"
                  {...register(`products.${index}.key`)}
                >
                  {products[index].key}
                </h3>
                {/* <Input
                  placeholder="Product Key (e.g. rsc)"
                  {...register(`products.${index}.key`)}
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button> */}
              </div>

              <div>
                <h4 className="font-medium">Common Formulas</h4>
                <FormulaFields
                  control={control}
                  index={index}
                  fieldName="common"
                  extraSuggestions={commonFieldKeys}
                />
              </div>

              <div>
                <h4 className="font-medium">Dependent Fields</h4>
                <FormulaFields
                  control={control}
                  index={index}
                  fieldName="depField"
                  extraSuggestions={commonFieldKeys}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* <Button
          type="button"
          onClick={() =>
            append({
              key: '',
              common: [],
              depField: [],
            })
          }
        >
          Add Product
        </Button> */}

        <Button type="submit">Save Formulas</Button>
      </form>
    </div>
  );
}

type FormulaFieldsProps = {
  control: any;
  index: number;
  fieldName: 'common' | 'depField';
  extraSuggestions?: string[];
};

function FormulaFields({
  control,
  index,
  fieldName,
  extraSuggestions = [],
}: FormulaFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `products.${index}.${fieldName}`,
  });

  const prefixedSuggestions = extraSuggestions.map((k) => `formula_${k}`);

  return (
    <div className="space-y-2">
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-center gap-2">
          <Input
            className="max-w-xs"
            placeholder="Key (e.g. flatLen)"
            {...control.register(`products.${index}.${fieldName}.${i}.key`)}
          />
          ={/* fix this input */}
          <SuggestionInput
            value={field.value}
            extraSuggestions={prefixedSuggestions}
            onChange={(val) => console.log(val)}
            {...control.register(`products.${index}.${fieldName}.${i}.value`)}
          />
          <Button type="button" variant="ghost" onClick={() => remove(i)}>
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ key: '', value: '' })}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Field
      </Button>
    </div>
  );
}
