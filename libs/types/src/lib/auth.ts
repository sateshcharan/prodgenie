import { ZodSchema } from 'zod';

export type AuthFormField = {
  name: string;
  label: string;
  type: string;
};

export type AuthFormProps = {
  fields: AuthFormField[];
  onSubmit: (data: Record<string, unknown>) => void;
  buttonLabel: string;
  className?: string;
  schema: ZodSchema<any>;
};
