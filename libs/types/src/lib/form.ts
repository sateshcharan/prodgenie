import { SubmitHandler } from 'react-hook-form';
import { ZodSchema } from 'zod';

type Field = {
  name: string;
  label: string;
  type: string;
};

type AuthFormProps<T> = {
  fields: Field[];
  onSubmit: SubmitHandler<T>;
  buttonLabel: 'Login' | 'Signup';
  validationSchema: ZodSchema<T>;
  showOAuthButton?: boolean;
  className?: string;
  onFieldChange?: (fieldName: string, value: string) => void;
};

export type { AuthFormProps, Field };
