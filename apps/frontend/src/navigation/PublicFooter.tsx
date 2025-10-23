import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Twitter, Linkedin, Youtube } from 'lucide-react';
import { Button, Input, logo, Separator } from '@prodgenie/libs/ui';

const FOOTER_SECTIONS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Integrations', href: '/integrations' },
    ],
  },
  {
    title: 'Industries',
    links: [
      { label: 'E-commerce', href: '/industries/ecommerce' },
      { label: 'Agencies', href: '/industries/agencies' },
      { label: 'Manufacturing', href: '/industries/manufacturing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/policy/privacy' },
      { label: 'Refund & Cancellation Policy', href: '/policy/refunds' },
      { label: 'Terms of Service', href: '/policy' },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Mail, href: '/contact', title: 'Contact' },
  { icon: Phone, href: 'tel:+18884861987', title: 'Call' },
  { icon: Twitter, href: 'https://x.com/parseur', title: 'Twitter / X' },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/company/parseur.com',
    title: 'LinkedIn',
  },
  { icon: Youtube, href: 'https://www.youtube.com/@parseur', title: 'YouTube' },
];

const PublicFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-foreground border-t border-border">
      {/* Upper Section */}
      <div className="max-w-7xl mx-auto px-0 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
        {/* Newsletter Section */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2">
          <img
            src={logo}
            alt="Website Logo"
            className="h-8 w-auto cursor-pointer mb-4"
            onClick={() => navigate('/')}
          />

          <h3 className="text-sm font-semibold mb-2 text-background">
            Subscribe to our newsletter
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Get tips, technical guides, and best practices. Twice a month.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Input type="email" placeholder="Your email" className="w-full" />
            <Button variant="outline" className="w-full sm:w-auto">
              Subscribe
            </Button>
          </div>
        </div>

        {/* Footer link sections */}
        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title} className="pl-6">
            <h4 className="text-background font-semibold mb-4">
              {section.title}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {section.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Lower Footer Bar */}
      <div className="bg-gray-950 text-white px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-6 sm:space-y-0">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Prodgenie. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Get in touch</span>
            <ul className="flex gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href, title }) => (
                <li key={title}>
                  <a
                    href={href}
                    title={title}
                    className="flex h-8 w-8 items-center justify-center rounded bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition"
                  >
                    <Icon size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
