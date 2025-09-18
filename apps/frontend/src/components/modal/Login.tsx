import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

import { api } from '../../utils';
import { useOAuth } from '../../hooks/useOAuth';

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
import { loginSchema } from '@prodgenie/libs/schema';
import { useAuthStore, useModalStore } from '@prodgenie/libs/store';
import { apiRoutes, loginFields } from '@prodgenie/libs/constant';

const Login = () => {
  const navigate = useNavigate();
  const { setAuthType } = useAuthStore();
  const { continueWithProvider } = useOAuth();
  const { openModal, closeModal } = useModalStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    mode: 'onTouched',
    resolver: zodResolver(loginSchema),
  });

  const handleEmailLogin = async (data: any) => {
    try {
      const res = await api.post(
        `${apiRoutes.auth.base}${apiRoutes.auth.login.email}`,
        data
      );

      if (!res.data.success) {
        toast.error(res.data.message || 'Login failed');
        return;
      }

      closeModal();
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const handlePasswordReset = async () => {
    const email = getValues('email');
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }

    try {
      const res = await api.post(
        `${apiRoutes.auth.base}${apiRoutes.auth.resetPassword}`,
        { email }
      );

      if (!res.data.success) {
        toast.error(res.data.message || 'Password reset failed');
        return;
      }

      toast.success('Password reset link sent to your email');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Password reset failed');
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
          <div className="flex flex-col gap-2">
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

            <Button
              type="button"
              className="w-full mt-4"
              onClick={(e) => {
                e.preventDefault();
                continueWithProvider('google');
              }}
              variant="outline"
              size="sm"
            >
              <FaGoogle /> Continue with Google
            </Button>

            <div className=" text-center text-sm text-muted-foreground mt-4">
              Don&apos;t have an account?{' '}
              <Button
                variant="link"
                type="button"
                onClick={() => openModal('auth:signup')}
              >
                Sign up
              </Button>
            </div>

            <Button
              variant="link"
              type="button"
              // onClick={handlePasswordReset}
              onClick={(e) => {
                openModal('auth:resetPassword');
              }}
            >
              Forgot password?
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Login;
