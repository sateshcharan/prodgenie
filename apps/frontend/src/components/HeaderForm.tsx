import { useForm, useFieldArray } from 'react-hook-form';
import {
  Button,
  Input,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@prodgenie/libs/ui';

const sections = ['bom', 'titleBlock', 'printingDetail'];

type HeaderField = { name: string };

type SchemaInput = {
  [key: string]: {
    expected: HeaderField[];
    required: HeaderField[];
  };
};

export default function SchemaForm() {
  const form = useForm<SchemaInput>({
    defaultValues: sections.reduce((acc, section) => {
      acc[section] = { expected: [{ name: '' }], required: [] };
      return acc;
    }, {} as SchemaInput),
  });

  const renderSection = (section: string) => {
    const expectedArray = useFieldArray({
      control: form.control,
      name: `${section}.expected` as const,
    });

    const requiredArray = useFieldArray({
      control: form.control,
      name: `${section}.required` as const,
    });

    return (
      <div key={section} className="border p-4 rounded-md space-y-2">
        <h3 className="text-lg font-semibold capitalize">{section}</h3>

        <div className="space-y-2">
          <h4 className="font-medium">Expected</h4>
          {expectedArray.fields.map((field, idx) => (
            <FormItem key={field.id}>
              <FormLabel>Field</FormLabel>
              <FormControl>
                <Input {...form.register(`${section}.expected.${idx}.name`)} />
              </FormControl>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => expectedArray.remove(idx)}
              >
                Remove
              </Button>
            </FormItem>
          ))}
          <Button
            type="button"
            onClick={() => expectedArray.append({ name: '' })}
            variant="outline"
            size="sm"
          >
            ➕ Add Expected
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Required</h4>
          {requiredArray.fields.map((field, idx) => (
            <FormItem key={field.id}>
              <FormLabel>Field</FormLabel>
              <FormControl>
                <Input {...form.register(`${section}.required.${idx}.name`)} />
              </FormControl>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => requiredArray.remove(idx)}
              >
                Remove
              </Button>
            </FormItem>
          ))}
          <Button
            type="button"
            onClick={() => requiredArray.append({ name: '' })}
            variant="outline"
            size="sm"
          >
            ➕ Add Required
          </Button>
        </div>
      </div>
    );
  };

  const onSubmit = (data: SchemaInput) => {
    const cleaned = Object.fromEntries(
      Object.entries(data).map(([section, { expected, required }]) => [
        section,
        {
          header: {
            expected: expected.map((f) => f.name).filter(Boolean),
            required: required.map((f) => f.name).filter(Boolean),
          },
        },
      ])
    );

    console.log('🔧 Generated Schema Config:', cleaned);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {sections.map(renderSection)}
        <Button type="submit">✅ Generate JSON</Button>
      </form>
    </Form>
  );
}
