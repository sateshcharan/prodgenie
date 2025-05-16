import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthForm, toast } from '@prodgenie/libs/ui';
import { loginSchema } from '@prodgenie/libs/schema';
import { apiRoutes, loginFields } from '@prodgenie/libs/constant';
import { api } from '../utils';

const Login = () => {
  const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleLogin = async (data: any) => {
    try {
      const res = await axios.post(
        `${apiRoutes.auth.base}${apiRoutes.auth.login}`,
        data
      );
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      toast.error('Incorrect Password');
    }
  };

  return (
    <div className="flex justify-center items-center ">
      <AuthForm
        fields={loginFields}
        onSubmit={handleLogin}
        buttonLabel="Login"
        className={undefined}
        validationSchema={loginSchema}
      />
    </div>
  );
};

export default Login;
