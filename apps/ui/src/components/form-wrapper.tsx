import { useState } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { Toast } from './toast/toast';

interface FormWrapperProps<T extends FieldValues> {
  onSubmit: (data: T) => Promise<void>;
  render: (form: {
    register: ReturnType<typeof useForm<T>>['register'];
    handleSubmit: ReturnType<typeof useForm<T>>['handleSubmit'];
    errors: ReturnType<typeof useForm<T>>['formState']['errors'];
    isLoading: boolean;
  }) => React.ReactNode;
  successMessage?: string;
  errorMessage?: string;
}

export function FormWrapper<T extends FieldValues>({
  onSubmit,
  render,
  successMessage = 'Success!',
  errorMessage = 'Something went wrong.',
}: FormWrapperProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<T>();
  const [isLoading, setIsLoading] = useState(false);

  const wrappedSubmit = async (data: T) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      Toast({
        title: successMessage,
        variant: 'default',
      });
    } catch (err) {
      Toast({
        title: 'Error',
        // description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(wrappedSubmit)}>
      {render({ register, handleSubmit, errors, isLoading })}
    </form>
  );
}
