export function useOAuth() {
  const login = (provider: 'google' | 'apple') => {
    window.location.href = `${
      import.meta.env.VITE_API_URL
    }/api/auth/login/${provider}`;
  };

  const signup = (provider: 'google' | 'apple') => {
    window.location.href = `${
      import.meta.env.VITE_API_URL
    }/api/auth/signup/${provider}`;
  };

  const continueWithProvider = (provider: 'google' | 'apple') => {
    window.location.href = `${
      import.meta.env.VITE_API_URL
    }/api/auth/continueWithProvider/${provider}`;
  };

  return { login, signup, continueWithProvider };
}
