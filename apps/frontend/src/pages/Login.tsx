import { AuthForm } from '@prodgenie/apps/ui';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const loginFields = [
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

  const handleLogin = async (data: any) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, data);
      localStorage.setItem('token', res.data.token);
      navigate('/templates');
      // Store token, redirect, toast, etc.
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <AuthForm
        fields={loginFields}
        onSubmit={handleLogin}
        buttonLabel="Login"
        className={undefined}
      />
    </div>
  );
};

export default Login;
