import { AuthForm, toast } from '@prodgenie/apps/ui';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

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
    {
      name: 'orgName',
      label: 'Organization Name',
      type: 'text',
      validation: { required: 'Organization name is required' },
    }
  ];

  const handleSignup = async (data: any) => {
    try {
      console.log()
      const res = await axios.post(`${API_URL}/auth/signup`, data);
      console.log('Signup response:', res.data);
      toast.success('Signup successful!');
      navigate('/dashboard');
      // Store token, redirect, toast, etc.
    } catch (err) {
      console.error('Signup failed:', err);
      toast.error('Signup failed!');
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
