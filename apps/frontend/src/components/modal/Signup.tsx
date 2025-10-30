// import debounce from 'lodash.debounce';
// import { useForm } from 'react-hook-form';
// import { FaGoogle } from 'react-icons/fa';
// import { useNavigate } from 'react-router-dom';
// import { useEffect, useMemo, useState } from 'react';
// import { zodResolver } from '@hookform/resolvers/zod';

// import { api } from '../utils';

// import {
//   Button,
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   Input,
//   Label,
//   toast,
// } from '@prodgenie/libs/ui';
// import { cn } from '@prodgenie/libs/utils';
// import { signupSchema } from '@prodgenie/libs/schema';
// import { apiRoutes, signupFields } from '@prodgenie/libs/constant';
// import { useAuthStore, useModalStore } from '@prodgenie/libs/store';

// export default function SignupPage() {
//   const navigate = useNavigate();
//   const { setAuthType } = useAuthStore();
//   const { openModal, closeModal } = useModalStore();

//   const [workspaceExists, setWorkspaceExists] = useState(false);
//   const [fields, setFields] = useState(signupFields);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm({
//     mode: 'onTouched',
//     resolver: zodResolver(signupSchema),
//   });

//   const handleSignup = async (data: any) => {
//     try {
//       const endpoint = workspaceExists
//         ? `${apiRoutes.auth.base}${apiRoutes.auth.signup.invite}`
//         : `${apiRoutes.auth.base}${apiRoutes.auth.signup.owner}`;
//       await api.post(endpoint, data);

//       toast.success('Signup successful! Logging in...');
//       navigate('/dashboard');
//     } catch (err: any) {
//       console.error('Signup failed:', err);
//       toast.error('Signup failed! ' + err.response?.data?.error);
//     }
//   };

//   const debouncedCheckWorkspaceExists = useMemo(
//     () =>
//       debounce(async (workspaceName: string) => {
//         if (!workspaceName || workspaceName.length < 2) {
//           setWorkspaceExists(false);
//           setFields(signupFields);
//           return;
//         }

//         try {
//           const { data } = await api.get(
//             `${apiRoutes.workspaces.base}${apiRoutes.workspaces.check}?workspaceName=${workspaceName}`
//           );
//           const exists = data.data;
//           setWorkspaceExists(exists);

//           if (exists) {
//             const hasInviteField = signupFields.some(
//               (f) => f.name === 'inviteCode'
//             );
//             if (!hasInviteField) {
//               setFields([
//                 ...signupFields,
//                 { name: 'inviteCode', label: 'Invite Code', type: 'text' },
//               ]);
//             }
//           } else {
//             setFields(signupFields);
//           }
//         } catch (error) {
//           console.error('Error checking workspace existence:', error);
//           setWorkspaceExists(false);
//           setFields(signupFields);
//         }
//       }, 500),
//     []
//   );

//   const handleFieldChange = (fieldName: string, value: string) => {
//     if (fieldName === 'workspaceName') {
//       debouncedCheckWorkspaceExists(value);
//     }
//   };

//   useEffect(() => {
//     const subscription = watch((value, { name }) => {
//       if (name) {
//         handleFieldChange(name, value[name]);
//       }
//     });
//     return () => {
//       subscription.unsubscribe();
//       debouncedCheckWorkspaceExists.cancel();
//     };
//   }, [watch]);

//   const handleGoogleSignup = async () => {
//     // await supabase.auth.signInWithOAuth({
//     //   provider: 'google',
//     //   options: {
//     //     redirectTo: `${window.location.origin}/auth/callback`,
//     //   },
//     // });
//   };

//   const handleAppleSignup = async () => {
//     // Handle Apple signup flow here
//   };

//   return (
//     <div className={cn('flex flex-col gap-6')}>
//       <Card className="border-none">
//         <CardHeader>
//           <CardTitle className="text-2xl">Signup</CardTitle>
//           <CardDescription>
//             Fill in the form to create a new account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit(handleSignup)}>
//             <div className="flex flex-col gap-6">
//               {fields.map(({ name, label, type, placeholder }) => (
//                 <div key={name} className="grid gap-2">
//                   <Label htmlFor={name}>{label}</Label>
//                   <Input
//                     id={name}
//                     type={type}
//                     {...register(name)}
//                     placeholder={placeholder}
//                   />
//                   <p className="text-sm text-red-500">
//                     {errors?.[name as keyof typeof errors]?.message as string}
//                   </p>
//                 </div>
//               ))}
//               <Button type="submit" className="w-full">
//                 Signup
//               </Button>
//             </div>

//             <div className="mt-4 text-center text-sm">
//               Already have an account?{' '}
//               <button
//                 type="button"
//                 onClick={() => openModal('auth:login')}
//                 className="underline underline-offset-4 text-primary hover:text-primary/80"
//               >
//                 Login
//               </button>
//               {/* Social login buttons */}
//               <div className="grid grid-cols-2 gap-4 mt-4">
//                 <Button
//                   variant="outline"
//                   className="w-full"
//                   onClick={handleAppleSignup}
//                 >
//                   {/* Apple Icon */}
//                   <svg
//                     viewBox="0 0 24 24"
//                     fill="currentColor"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
//                   </svg>
//                 </Button>

//                 <Button
//                   variant="outline"
//                   className="w-full"
//                   onClick={handleGoogleSignup}
//                 >
//                   {/* Google Icon */}
//                   <svg
//                     viewBox="0 0 24 24"
//                     fill="currentColor"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
//                   </svg>
//                 </Button>
//               </div>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

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
import { signupSchema } from '@prodgenie/libs/schema';
import { useModalStore } from '@prodgenie/libs/store';
import { apiRoutes } from '@prodgenie/libs/constant';

import { api } from '../../utils';
import { useOAuth } from '../../hooks/useOAuth';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { openModal, closeModal } = useModalStore();
  const { continueWithProvider } = useOAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
    resolver: zodResolver(signupSchema),
  });

  const handleEmailSignup = async (data: any) => {
    try {
      const res = await api.post(
        `${apiRoutes.auth.base}${apiRoutes.auth.signup.email}`,
        data
      );

      if (!res.data.success) {
        toast.error(res.data.message || 'Signup failed');
        return;
      }

      toast.success('Signup successful! Logging in...');
      closeModal();
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Sign up</CardTitle>
        <CardDescription>
          Create a new account with your email and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleEmailSignup)}>
          <div className="flex flex-col gap-2">
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                {...register('name')}
                placeholder="John Doe"
              />
              <p className="text-sm text-red-500">
                {errors?.name?.message as string}
              </p>
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="you@example.com"
              />
              <p className="text-sm text-red-500">
                {errors?.email?.message as string}
              </p>
            </div>

            {/* Password */}
            <div className="grid gap-2 ">
              <Label htmlFor="password">Password</Label>
              {/* <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="********"
              /> */}
              <div className="relative">
                <Input
                  id={'password'}
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="********"
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
              <p className="text-sm text-red-500">
                {errors?.password?.message as string}
              </p>
            </div>

            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </div>
        </form>

        {/* Social login */}
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

        {/* Switch to login */}
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Button
            variant="link"
            type="button"
            onClick={() => openModal('auth:login')}
          >
            Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Signup;
