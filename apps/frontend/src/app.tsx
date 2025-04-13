import { Routes, Route } from 'react-router-dom';
import React from 'react';

import { PublicLayout, DashLayout } from './layouts/index';
import { Home, Dashboard } from './pages';
import { Login, Signup, Files, FileDetails } from './components';
import { PrivateRoute } from './routes';
import { TestAuthStore } from './pages/TestAuthStore';

export function App() {
  const files = ['drawings', 'templates', 'sequences', 'job_cards'];

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
        {files.map((fileType) => (
          <React.Fragment key={fileType}>
            <Route path={`${fileType}`} element={<Files />} />
            <Route path={`${fileType}/:id`} element={<FileDetails />} />
          </React.Fragment>
        ))}
      </Route>

      <Route path="state" element={<TestAuthStore />} />
    </Routes>
  );
}

export default App;
