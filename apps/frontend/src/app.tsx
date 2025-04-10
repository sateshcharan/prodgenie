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
      {/* Public Routes with Main Layout */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>

      {/* Protected Dashboard Routes with Sidebar */}
      <Route path="/" element={<DashLayout />}>
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="drawings"
          element={
            <PrivateRoute>
              <Drawings />
            </PrivateRoute>
          }
        />
        <Route
          path="drawings/:id"
          element={
            <PrivateRoute>
              <DrawingDetails />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
