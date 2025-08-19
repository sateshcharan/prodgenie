export function useOAuthLogin() {
  const login = (provider: 'google' | 'apple') => {
    window.location.href = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/auth/login/${provider}`;
  };
  return { login };
}
