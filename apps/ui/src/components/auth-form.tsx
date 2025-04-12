import { useForm } from 'react-hook-form';
import { AuthFormProps } from '@prodgenie/libs/types';
import { cn } from '@prodgenie/apps/utils';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '..';
import { userSchema, User } from '@prodgenie/libs/schemas';
import { zodResolver } from '@hookform/resolvers/zod';

const AuthForm = ({
  fields,
  onSubmit,
  buttonLabel,
  className,
  ...props
}: AuthFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({
    resolver: zodResolver(userSchema),
  });

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
              {fields.map(({ name, label, type, validation }) => (
                <div key={name} className="grid gap-2">
                  <Label htmlFor={name}>{label}</Label>
                  <Input id={name} type={type} {...register('name')} />
                  <p>{errors.name?.message}</p>
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
            {buttonLabel === 'Login' ? (
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <a href="/signup" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            ) : (
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <a href="/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { AuthForm };
