import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { AuthForm, toast } from '@prodgenie/apps/ui';
import { apiRoutes, signupFields } from '@prodgenie/libs/constants';
import { signupSchema } from '@prodgenie/libs/schemas';

const Signup = () => {
  const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const handleSignup = async (data: any) => {
    try {
      console.log(data);
      const res = await axios.post(`${API_URL}/${apiRoutes.signup.url}`, data);
      console.log('Signup response:', res.data);
      toast.success('Signup successful!');
      navigate('/dashboard');
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
        schema={signupSchema}
      />
    </div>
  );
};

export default Signup;
