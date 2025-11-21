import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@prodgenie/libs/ui/button';
import { Input } from '@prodgenie/libs/ui/input';
import { Label } from '@prodgenie/libs/ui/label';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@prodgenie/libs/ui/card';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useModalStore } from '@prodgenie/libs/store';

import api from '../../utils/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ResetPassword = () => {
  const { openModal, closeModal } = useModalStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    mode: 'onTouched',
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleForgotPassword = async (data: ForgotPasswordForm) => {
    try {
      const res = await api.post(
        `${apiRoutes.auth.base}${apiRoutes.auth.resetPassword}`,
        { email: data.email }
      );

      if (!res.data.success) {
        toast.error(res.data.message || 'Failed to send reset link');
        return;
      }

      toast.success('Password reset link sent to your email');
      closeModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleForgotPassword)}
          className="space-y-2"
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="you@example.com"
            />
            <p className="text-sm text-red-500">{errors.email?.message}</p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={() => {
              openModal('auth:login');
            }}
          >
            Back to Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
