import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '../';
import { cn } from '@prodgenie/libs/utils';

import { useAuthModalStore } from '@prodgenie/libs/store';

type Field = {
  name: string;
  label: string;
  type: string;
};

type AuthFormProps = {
  fields: Field[];
  onSubmit: (data: any) => void;
  buttonLabel: 'Login' | 'Signup';
  validationSchema: any;
  className?: string;
  onFieldChange?: (fieldName: string, value: string) => void;
};

const AuthForm = ({
  fields,
  onSubmit,
  buttonLabel,
  className,
  validationSchema,
  onFieldChange,
  ...props
}: AuthFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
    resolver: zodResolver(validationSchema),
  });

  const { openModal } = useAuthModalStore();

  // Track changes to all fields and notify parent
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && onFieldChange) {
        onFieldChange(name, value[name]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onFieldChange]);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{buttonLabel}</CardTitle>
          <CardDescription>
            {buttonLabel === 'Login'
              ? 'Enter your email below to login to your account'
              : 'Fill in the form to create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {fields.map(({ name, label, type }) => (
                <div key={name} className="grid gap-2">
                  <Label htmlFor={name}>{label}</Label>
                  <Input id={name} type={type} {...register(name)} />
                  <p className="text-sm text-red-500">
                    {errors?.[name as keyof typeof errors]?.message as string}
                  </p>
                </div>
              ))}
              <Button type="submit" className="w-full">
                {buttonLabel}
              </Button>
              {buttonLabel === 'Login' && (
                <Button variant="outline" className="w-full">
                  Login with Google
                </Button>
              )}
            </div>
            <div className="mt-4 text-center text-sm">
              {buttonLabel === 'Login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => openModal('signup')}
                    className="underline underline-offset-4 text-primary hover:text-primary/80"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => openModal('login')}
                    className="underline underline-offset-4 text-primary hover:text-primary/80"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { AuthForm };
