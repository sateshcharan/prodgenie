import { z } from 'zod';

export const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  label: z.string().min(1, 'Field label is required'),
  placeholder: z.union([z.string(), z.number()]).optional(),
  defaultValue: z.union([z.string(), z.number()]).optional(),
  type: z.enum(['text', 'number', 'select']),
  dataSource: z
    .object({
      table: z.string(),
      column: z.string(),
      options: z.array(z.string()).optional(),
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
