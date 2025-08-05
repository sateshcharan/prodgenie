import { useNavigate } from 'react-router-dom';

import { api } from '../utils';

import { AuthForm, toast } from '@prodgenie/libs/ui';
import { loginSchema } from '@prodgenie/libs/schema';
import { apiRoutes, loginFields } from '@prodgenie/libs/constant';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async (data: any) => {
    try {
      const res = await api.post(
        `${apiRoutes.auth.base}${apiRoutes.auth.login}`,
        data
      );
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response.data.message || 'Login failed');
    }
  };

  // const handleLogin = async (data: { email: string; password: string }) => {
  //   const { email, password } = data;

  //   const { data: authData, error } = await supabase.auth.signInWithPassword({
  //     email,
  //     password,
  //   });

  //   if (error) {
  //     toast.error(error.message || 'Login failed');
  //     return;
  //   }

  //   // Save access token to localStorage (if you need to manually send it in headers)
  //   const accessToken = authData.session?.access_token;
  //   if (accessToken) {
  //     localStorage.setItem('token', accessToken);
  //   }

  //   navigate('/dashboard');
  // };

  return (
    <AuthForm
      fields={loginFields}
      onSubmit={handleLogin}
      buttonLabel="Login"
      validationSchema={loginSchema}
    />
  );
};

export default Login;
