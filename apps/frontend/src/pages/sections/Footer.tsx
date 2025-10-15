import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = ({ logo }) => {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 px-6 py-12 bg-muted">
      <div className="grid grid-cols-[25%_repeat(5,1fr)] gap-8 mb-8 mt-8 max-w-7xl mx-auto">
        {/* Grid */}
        <div className="flex flex-col space-y-4">
          {/* Logo */}
          <div>
            <img
              src={logo}
              alt="Website Logo"
              className="h-8 w-auto cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-4 text-muted-foreground">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        {['Product', 'Industries', 'Resources', 'Company', 'AI Tools'].map((col) => (
          <div key={col}>
            <h4 className="text-foreground font-semibold mb-4">{col}</h4>
            <div className="space-y-2 text-muted-foreground">
              <a href="#" className="block hover:text-foreground">
                Link 1
              </a>
              <a href="#" className="block hover:text-foreground">
                Link 2
              </a>
              <a href="#" className="block hover:text-foreground">
                Link 3
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Footer;
