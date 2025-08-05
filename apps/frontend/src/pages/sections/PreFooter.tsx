import { logo } from '@prodgenie/libs/ui';
import { useNavigate } from 'react-router-dom';

const PreFooter = () => {
  const navigate = useNavigate();
  return (
    <section className="py-12 bg-gray-950">
      <img
        src={logo}
        alt="Website Logo"
        className="h-8 w-auto cursor-pointer"
        onClick={() => navigate('/')}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <div className="space-y-2 text-gray-400">
            <a href="#" className="block hover:text-white transition-colors">
              Features
            </a>
            <a href="#" className="block hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#" className="block hover:text-white transition-colors">
              API
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Industries</h4>
          <div className="space-y-2 text-gray-400">
            <a href="#" className="block hover:text-white transition-colors">
              Automotive
            </a>
            <a href="#" className="block hover:text-white transition-colors">
              Aerospace
            </a>
            <a href="#" className="block hover:text-white transition-colors">
              Manufacturing
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Resources</h4>
          <div className="space-y-2 text-gray-400">
            <a href="#" className="block hover:text-white transition-colors">
              Documentation
            </a>
            <a href="#" className="block hover:text-white transition-colors">
              Case Studies
            </a>
            <a href="#" className="block hover:text-white transition-colors">
              Blog
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <div className="space-y-2 text-gray-400">
            <a href="#" className="block hover:text-white transition-colors">
              About
            </a>
            <a href="#" className="block hover:text-white transition-colors">
              Contact
            </a>
            <a href="#" className="block hover:text-white transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreFooter;
