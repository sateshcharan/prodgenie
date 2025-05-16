import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import debounce from 'lodash.debounce';

import { AuthForm, toast } from '@prodgenie/libs/ui';
import { apiRoutes, signupFields } from '@prodgenie/libs/constant';
import { signupSchema } from '@prodgenie/libs/schema';

export default function SignupPage() {
  const navigate = useNavigate();
  const [orgExists, setOrgExists] = useState(false);
  const [fields, setFields] = useState(signupFields);

  const handleSignup = async (data: any) => {
    try {
      const endpoint = orgExists
        ? `${apiRoutes.auth.base}${apiRoutes.auth.signup.invite}`
        : `${apiRoutes.auth.base}${apiRoutes.auth.signup.owner}`;
      await api.post(endpoint, data);
      toast.success('Signup successful! Logging in...');

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup failed:', err);
      toast.error('Signup failed! ' + err.response.data.error);
    }
  };

  // Memoize the debounced function
  const debouncedCheckOrgExists = useMemo(
    () =>
      debounce(async (orgName: string) => {
        if (!orgName || orgName.length < 2) {
          setOrgExists(false);
          setFields(signupFields);
          return;
        }

        try {
          const { data } = await api.get(
            `${apiRoutes.orgs.base}/check?orgName=${orgName}`
          );
          const exists = data.data;
          setOrgExists(exists);

          if (exists) {
            const hasInviteField = signupFields.some(
              (f) => f.name === 'inviteCode'
            );
            if (!hasInviteField) {
              setFields([
                ...signupFields,
                { name: 'inviteCode', label: 'Invite Code', type: 'text' },
              ]);
            }
          } else {
            setFields(signupFields);
          }
        } catch (error) {
          console.error('Error checking organization existence:', error);
          setOrgExists(false);
          setFields(signupFields);
        }
      }, 500),
    []
  );

  const handleFieldChange = (fieldName: string, value: string) => {
    if (fieldName === 'orgName') {
      debouncedCheckOrgExists(value);
    }
  };

  useEffect(() => {
    return () => {
      debouncedCheckOrgExists.cancel();
    };
  }, []);

  return (
    <div className="flex justify-center items-center ">
      <AuthForm
        fields={fields}
        validationSchema={signupSchema}
        buttonLabel="Signup"
        onSubmit={handleSignup}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
}
