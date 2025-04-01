import { Routes, Route } from 'react-router-dom';

import { Layout, DashLayout } from './layouts/index';
import { Home, Login, Signup, Dashboard, Templates } from './pages/index';

export function App() {
  return (
    <Routes>
      {/* Public Routes with Main Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>

      {/* Protected Dashboard Routes with Sidebar */}
      <Route path="/" element={<DashLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="templates" element={<Templates />} />
      </Route>
    </Routes>
  );
}

export default App;
