import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
  Button,
  Input,
} from '@prodgenie/libs/ui';
import { apiRoutes } from '@prodgenie/libs/constant';
import { useModalStore } from '@prodgenie/libs/store';
import { api } from '../../utils';

interface ReplacePasswordForm {
  newPassword: string;
  confirmPassword: string;
}

const ReplacePassword = () => {
  const { closeModal } = useModalStore();
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ReplacePasswordForm>({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword');

  const onSubmit = async (data: ReplacePasswordForm) => {
    try {
      setLoading(true);

      const response = await api.post(
        `${apiRoutes.auth.base}${apiRoutes.auth.updatePassword}`,
        { password: data.newPassword },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Password updated successfully!');
        reset();
        closeModal();
      } else {
        toast.error(response.data.error || 'Something went wrong.');
      }
    } catch (err: any) {
      console.error('Password update failed:', err);
      toast.error(
        err.response?.data?.error || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Replace Password
        </CardTitle>
        <CardDescription>
          Enter and confirm your new password to complete reset
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          {/* New Password Field */}
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="New Password"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long',
                },
              })}
              disabled={loading}
              className="pr-10"
            />
            <Button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              size="icon"
              variant="ghost"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </Button>
            {errors.newPassword && (
              <p className="text-sm text-red-500 mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === newPasswordValue || 'Passwords do not match',
              })}
              disabled={loading}
              className="pr-10"
            />
            <Button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              size="icon"
              variant="ghost"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </Button>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReplacePassword;
