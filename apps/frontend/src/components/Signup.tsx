import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { AuthForm, toast } from '@prodgenie/libs/ui';
import { apiRoutes, signupFields } from '@prodgenie/libs/constant';
import { signupSchema } from '@prodgenie/libs/schema';

const Signup = () => {
  const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const handleSignup = async (data: any) => {
    console.log(data)
    try {
      const res = await axios.post(`${API_URL}${apiRoutes.signup.url}`, data);
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
        validationSchema={signupSchema}
      />
    </div>
  );
};

export default Signup;
