import { Routes, Route } from 'react-router-dom';

import { PublicLayout, DashLayout } from './layouts/index';
import {
  Home,
  Login,
  Signup,
  Dashboard,
  Drawings,
  DrawingDetails,
} from './pages/index';
import { PrivateRoute } from './routes';

export function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        path="dashboard"
        element={
          <PrivateRoute>
            <DashLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="drawings" element={<Drawings />} />
        <Route path="drawings/:id" element={<DrawingDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
