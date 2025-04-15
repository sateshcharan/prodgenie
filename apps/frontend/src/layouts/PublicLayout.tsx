import { Outlet } from 'react-router-dom';
import { Footer, Header } from '@prodgenie/libs/ui';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
