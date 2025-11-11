import { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  toast,
} from '@prodgenie/libs/ui';
import { loginSchema } from '@prodgenie/libs/schema';
import { apiRoutes, loginFields } from '@prodgenie/libs/constant';
import { useAuthStore, useModalStore } from '@prodgenie/libs/store';

import { api } from '../../utils';
import { useOAuth } from '../../hooks/useOAuth';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

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

      console.log(res);

      if (res.status === 200) {
        toast.success('Login successful!');
        closeModal();
        navigate('/dashboard');
      } else if (res.status === 401) {
        toast.error(res.data.message || 'Invalid email or password');
      }
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
          <div className="flex flex-col gap-4">
            {loginFields.map(({ name, label, type, placeholder }) => (
              <div key={name} className="grid gap-2 relative">
                <Label htmlFor={name}>{label}</Label>

                {type === 'password' ? (
                  <div className="relative">
                    <Input
                      id={name}
                      type={showPassword ? 'text' : 'password'}
                      {...register(name)}
                      placeholder={placeholder}
                      className="pr-10" // gives space for the eye icon
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <Input
                    id={name}
                    type={type}
                    {...register(name)}
                    placeholder={placeholder}
                  />
                )}

                {errors?.[name as keyof typeof errors]?.message && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[name as keyof typeof errors]?.message as string}
                  </p>
                )}
              </div>
            ))}

            <Button type="submit" className="w-full mt-2">
              Login
            </Button>

            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                continueWithProvider('google');
              }}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 mt-2"
            >
              <FaGoogle className="text-lg" /> Continue with Google
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-4">
              Don&apos;t have an account?{' '}
              <Button
                variant="link"
                type="button"
                onClick={() => openModal('auth:signup')}
                className="p-0 text-primary"
              >
                Sign up
              </Button>
            </div>

            <Button
              variant="link"
              type="button"
              onClick={() => openModal('auth:resetPassword')}
              className="p-0 text-sm text-muted-foreground"
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
