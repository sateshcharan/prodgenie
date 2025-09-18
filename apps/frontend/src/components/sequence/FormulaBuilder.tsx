// import { object } from 'zod';
import { Plus, Trash } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

// import { api } from '../utils';
import SuggestionInput from '../SuggestionInput';

import { apiRoutes } from '@prodgenie/libs/constant';
import {
  Button,
  Input,
  Card,
  CardContent,
  toast,
  FormField,
} from '@prodgenie/libs/ui';

type FormulaConfig = {
  key: string | null;
  common: { key: string; value: string }[];
  depField: { key: string; value: string }[];
};

type FormulaBuilderProps = {
  fileData: any;
  sequenceFormulas: any;
  onFormulaSave: (formula: any) => void;
};

const FormulaBuilder = forwardRef(
  ({ fileData, sequenceFormulas, onFormulaSave }: FormulaBuilderProps, ref) => {
    const defaultProduct: FormulaConfig = {
      key: 'Consolidated Formulas',
      common: [],
      depField: [],
    };

    const {
      control,
      handleSubmit,
      register,
      reset,
      watch,
      setValue,
      getValues,
    } = useForm<{
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

    const watchedSections = watch('products');
    const originalConfigRef = useRef<string | null>(null);
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    const jobCardFormSuggestions: string[] = fileData.flatMap((file: any) => {
      const sections = file.data.jobCardForm.sections || [];
      return sections.flatMap((section: any) =>
        section.fields.map((field: any) => {
          const fieldKey = field.name?.split('.')[1] || field.name;
          return `jobCardForm_${section.name}_${fieldKey}`;
        })
      );
    });

    useImperativeHandle(ref, () => ({
      saveTemplate: onSubmit,
    }));

    // Extract data from file
    useEffect(() => {
      const extractFromFileData = async () => {
        if (Object.keys(fileData).length > 0) {
          originalConfigRef.current = JSON.stringify(fileData); // Save original

          const transformed = fileData.flatMap((file: any) =>
            Object.entries(file.data).map(([key, value]: [string, any]) => ({
              key,
              common: value.common || {},
              depField: value.computed || {},
            }))
          );

          const merged = transformed.reduce(
            (acc: any, item: any) => {
              Object.assign(acc.common, item.common);
              Object.assign(acc.depField, item.depField);
              return acc;
            },
            {
              key: 'consolidated formulas',
              common: {},
              depField: {},
            }
          );

          const hydrated = {
            ...merged,
            common: { ...merged.common, ...sequenceFormulas.common },
            depField: { ...merged.depField, ...sequenceFormulas.depField },
          };

          reset({
            products: [
              {
                key: hydrated.key,
                common: Object.entries(hydrated.common).map(([k, v]) => ({
                  key: k,
                  value: v,
                })),
                depField: Object.entries(hydrated.depField).map(([k, v]) => ({
                  key: k,
                  value: v,
                })),
              },
            ],
          });
        }
      };

      extractFromFileData();
    }, [fileData, reset]);

    // Reset the form when id changes
    useEffect(() => {
      if (!id) {
        reset({ products: [defaultProduct] });
      }
    }, [id]);

    const onSubmit = async () => {
      if (!watchedSections.length) {
        alert('Please add at least one product');
        return;
      }

      const product = products[0];

      const toObject = (arr: { key: string; value: string }[]) =>
        Object.fromEntries(arr.map(({ key, value }) => [key, value]));

      const output = {
        key: product.key,
        common: toObject(product.common),
        depField: toObject(product.depField),
      };

      onFormulaSave(output);
      // originalConfigRef.current = outputString;
    };

    // Dynamically extract all depField keys from all products
    const commonFieldKeys = Object.keys(products[0].common);

    return (
      <div className="bg-white border rounded shadow p-2  h-[400px] flex flex-col">
        <h2 className="text-lg font-semibold ">Formula Builder</h2>

        <h3
          className="font-medium capitalize "
          {...register(`products.${0}.key`)}
        >
          {products[0].key}
        </h3>
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit(onSubmit)}>
            {products.map((product, index) => (
              <Card key={product.id}>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 ">
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

                  <div className="overflow-auto">
                    <h4 className="font-medium">Common Fields</h4>
                    <FormulaFields
                      control={control}
                      index={index}
                      fieldName="common"
                      extraSuggestions={commonFieldKeys}
                      jobCardFormSuggestions={jobCardFormSuggestions}
                    />
                  </div>

                  <div className="overflow-auto">
                    <h4 className="font-medium">Dependent Fields</h4>
                    <FormulaFields
                      control={control}
                      index={index}
                      fieldName="depField"
                      extraSuggestions={commonFieldKeys}
                      jobCardFormSuggestions={jobCardFormSuggestions}
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

            {/* <Button type="submit">Save Formulas</Button> */}
          </form>
        </div>
      </div>
    );
  }
);

type FormulaFieldsProps = {
  control: any;
  index: number;
  fieldName: 'common' | 'depField';
  extraSuggestions?: string[];
  jobCardFormSuggestions?: any;
};

function FormulaFields({
  control,
  index,
  fieldName,
  extraSuggestions = [],
  jobCardFormSuggestions,
}: FormulaFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `products.${index}.${fieldName}`,
  });

  const allSuggestions = [
    ...extraSuggestions.map((k) => `formula_${k}`),
    ...jobCardFormSuggestions,
  ];

  return (
    <div className="space-y-2">
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => remove(i)}>
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
          <Input
            className="w-fit"
            placeholder="Key (e.g. flatLen)"
            {...control.register(`products.${index}.${fieldName}.${i}.key`)}
          />
          =
          <SuggestionInput
            value={field.value}
            extraSuggestions={allSuggestions}
            onChange={(val) => console.log(val)}
            {...control.register(`products.${index}.${fieldName}.${i}.value`)}
          />
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

export default FormulaBuilder;
