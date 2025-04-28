import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout, DashLayout } from './layouts/index';
import { Home, Dashboard } from './pages';
import { Login, Signup, Files, FileDetails } from './components';
import { PrivateRoute } from './routes';
import { TestAuthStore } from './pages/TestAuthStore';
import { fileTypes } from '@prodgenie/libs/constant';

export function App() {
  const files = fileTypes;

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

        {/* Dynamically generated routes for file types */}
        {files.map((fileType) => (
          <React.Fragment key={fileType}>
            {/* Adjust path to be relative */}
            <Route path=":fileType" element={<Files />} />
            <Route path=":fileType/:fileId" element={<FileDetails />} />
          </React.Fragment>
        ))}
      </Route>

      <Route path="state" element={<TestAuthStore />} />

      <Route path="*" element={'404'} />
    </Routes>
  );
}

export default App;
