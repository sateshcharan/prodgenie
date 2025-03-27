import NxWelcome from './nx-welcome';

import { Route, Routes, Link } from 'react-router-dom';

import { Button } from '@prodgenie/apps/ui/button';

export function App() {
  return (
    <div>
      <NxWelcome title="frontend" />

      {/* START: routes */}
      {/* These routes and navigation have been generated for you */}
      {/* Feel free to move and update them to fit your needs */}
      <br />
      <hr />
      <br />
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/page-2">Page 2</Link>
          </li>
        </ul>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <Button variant={'destructive'}>
              This is the generated root route.{' '}
              <Link to="/page-2">Click here for page 2.</Link>
            </Button>
          }
        />
        <Route
          path="/page-2"
          element={
            <Button>
              <Link to="/">Click here to go back to root page.</Link>
            </Button>
          }
        />
      </Routes>
      {/* END: routes */}
    </div>
  );
}

export default App;
