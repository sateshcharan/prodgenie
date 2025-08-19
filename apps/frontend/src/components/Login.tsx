// import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

import { api } from '../utils';
import { useOAuthLogin } from '../hooks/useOAuthLogin';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  toast,
} from '@prodgenie/libs/ui';
import { cn } from '@prodgenie/libs/utils';
import { loginSchema } from '@prodgenie/libs/schema';
import { useAuthStore } from '@prodgenie/libs/store';
import { apiRoutes, loginFields } from '@prodgenie/libs/constant';

const Login = () => {
  const navigate = useNavigate();
  const { setAuthType } = useAuthStore();
  const { login } = useOAuthLogin();

  const {
    register,
    handleSubmit,
    // watch,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
    resolver: zodResolver(loginSchema),
  });

  // Optional: Watch field changes
  // useEffect(() => {
  //   const subscription = watch((value, { name }) => {
  //     // You could log or track field changes here
  //   });
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  const handleEmailLogin = async (data: any) => {
    try {
      const res = await api.post(
        `${apiRoutes.auth.base}${apiRoutes.auth.login}`,
        data
      );

      if (!res.data.success) {
        toast.error(res.data.message || 'Login failed');
        return;
      }

      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleEmailLogin)}>
          <div className="flex flex-col gap-6">
            {loginFields.map(({ name, label, type, placeholder }) => (
              <div key={name} className="grid gap-2">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  type={type}
                  {...register(name)}
                  placeholder={placeholder}
                />
                <p className="text-sm text-red-500">
                  {errors?.[name as keyof typeof errors]?.message as string}
                </p>
              </div>
            ))}

            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </form>

        <Button
          type="button"
          className="w-full mt-4"
          onClick={(e) => {
            e.preventDefault();
            login('google');
          }}
          variant="outline"
          size="sm"
        >
          <FaGoogle /> Login with Google
        </Button>

        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Button
            variant="link"
            type="button"
            onClick={() => setAuthType('signup')}
          >
            Sign up
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Login;
