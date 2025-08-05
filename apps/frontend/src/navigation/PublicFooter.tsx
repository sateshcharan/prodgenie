import { Settings } from 'lucide-react';

const PublicFooter = () => {
  return (
    <footer className="bg-gray-950 text-white px-4 py-6 mt-auto text-center flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:items-center">
      <h3 className="text-sm">
        © {new Date().getFullYear()} Prodgenie. All rights reserved.
      </h3>
      <ul className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm">
        <li>
          <a href="/privacy" className="hover:underline">
            Privacy Policy
          </a>
        </li>
        <li>
          <a href="/terms" className="hover:underline">
            Terms of Service
          </a>
        </li>
      </ul>
    </footer>
  );
};

export default PublicFooter;
