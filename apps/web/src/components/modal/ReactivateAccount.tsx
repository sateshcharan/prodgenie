import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@prodgenie/libs/ui/card';
import { Input } from '@prodgenie/libs/ui/input';
import { Button } from '@prodgenie/libs/ui/button';
import { Label } from '@prodgenie/libs/ui/label';
import { useModalStore } from '@prodgenie/libs/store';
import { apiRoutes } from '@prodgenie/libs/constant';

import api from '../../utils/api';

interface ReactivateForm {
  email: string;
}

const ReactivateAccount = () => {
  const { closeModal } = useModalStore();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReactivateForm>({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ReactivateForm) => {
    try {
      setLoading(true);

      await api.post(`${apiRoutes.auth.base}${apiRoutes.auth.reactivate}`, {
        email: data.email,
      });

      setEmailSent(true);
      toast.success('Verification email sent!');
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to send reactivation email'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <MailCheck className="h-6 w-6 text-primary" />
          Reactivate Account
        </CardTitle>

        <CardDescription>
          {emailSent
            ? 'Check your email to complete account reactivation.'
            : 'Your account was previously deleted. Enter your email to reactivate it.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!emailSent ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reactivation Email'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              We’ve sent a secure verification link to your email. Click the
              link to reactivate your account.
            </p>

            <Button onClick={closeModal}>Close</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReactivateAccount;
