import { useNavigate } from 'react-router-dom';

import { api } from '../utils';

import { AuthForm, toast } from '@prodgenie/libs/ui';
import { loginSchema } from '@prodgenie/libs/schema';
import { apiRoutes, loginFields } from '@prodgenie/libs/constant';

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
