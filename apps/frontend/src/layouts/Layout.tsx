import { Outlet } from 'react-router-dom';
import { Footer, Header } from '@prodgenie/apps/ui';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4">
        <Outlet /> {/* This will render the current route's component */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
