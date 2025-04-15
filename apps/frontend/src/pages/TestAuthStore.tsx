
import { useAuthStore } from '@prodgenie/libs/store'; 
import { Button } from '@prodgenie/libs/ui';

export function TestAuthStore() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Auth Store Test</h2>

      <pre className="bg-gray-100 p-2 rounded">
        {JSON.stringify(user, null, 2)}
      </pre>

      <Button onClick={() => setUser({ id: '123', email: 'test@example.com' })}>
        Set User
      </Button>

      <Button onClick={logout} variant="outline">
        Logout
      </Button>
    </div>
  );
}
