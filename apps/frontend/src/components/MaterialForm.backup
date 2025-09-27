import { useForm, useFieldArray } from 'react-hook-form';
import {
  Button,
  Input,
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from '@prodgenie/libs/ui';

type MaterialInput = {
  materials: { type: string; thickness: number }[];
};

export default function MaterialForm() {
  const form = useForm<MaterialInput>({
    defaultValues: {
      materials: [{ type: '', thickness: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'materials',
  });

  const onSubmit = (data: MaterialInput) => {
    const materialMap = Object.fromEntries(
      data.materials.map((mat) => [mat.type, Number(mat.thickness)])
    );
    console.log('Generated JSON:', materialMap);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-center">
            <FormField
              control={form.control}
              name={`materials.${index}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 3ply" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`materials.${index}.thickness`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thickness</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
              className="self-end"
            >
              Remove
            </Button>
          </div>
        ))}

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={() => append({ type: '', thickness: 0 })}
            variant="secondary"
          >
            ➕ Add Material
          </Button>

          <Button type="submit">✅ Generate JSON</Button>
        </div>
      </form>
    </Form>
  );
}

export { MaterialForm };
