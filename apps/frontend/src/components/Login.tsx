import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { AuthForm } from '@prodgenie/apps/ui';
import { apiRoutes, loginFields } from '@prodgenie/libs/constants';
import { loginSchema } from '@prodgenie/libs/schemas';

const Login = () => {
  const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleLogin = async (data: any) => {
    try {
      const res = await axios.post(`${API_URL}/${apiRoutes.login.url}`, data);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
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
        schema={loginSchema}
      />
    </div>
  );
};

export default Login;
