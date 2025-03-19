import { Routes, Route } from 'react-router-dom';

import { Button } from '../../../ui/src/button';

import { Home, Login, Signup, Dashboard } from '../pages/index';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
