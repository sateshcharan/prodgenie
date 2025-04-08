import { AuthForm } from '@prodgenie/apps/ui';
import axios from 'axios';

const Signup = () => {
  const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;

  const signupFields = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      validation: { required: 'Email is required' },
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      validation: { required: 'Password is required' },
    },
  ];

  const handleSignup = async (data: any) => {
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, data);
      console.log('Signup response:', res.data);
      // Store token, redirect, toast, etc.
    } catch (err) {
      console.error('Signup failed:', err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <AuthForm
        fields={signupFields}
        onSubmit={handleSignup}
        buttonLabel="Signup"
        className={undefined}
      />
    </div>
  );
};

export default Signup;
