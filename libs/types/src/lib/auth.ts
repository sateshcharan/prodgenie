import { ZodSchema } from 'zod';
import { FormFileds } from './form.js';

export type AuthFormProps = {
  fields: FormFileds[];
  onSubmit: (data: Record<string, unknown>) => void;
  buttonLabel: string;
  className?: string;
  schema: ZodSchema<any>;
};
