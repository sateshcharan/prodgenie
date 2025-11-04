import { NavLink, Outlet } from 'react-router-dom';

const NavButton = ({ to, label, highlight = false }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `border border-collapse p-2 lg:p-4 transition-colors ${
        isActive
          ? 'bg-blue-200 border-blue-400 text-blue-800 ' // active tab
          : highlight
          ? 'bg-blue-50 border-blue-300 hover:bg-white'
          : 'bg-gray-100 border-gray-300 hover:bg-white'
      }`
    }
  >
    {label}
  </NavLink>
);

const ComplianceBadge = ({
  flag,
  country,
}: {
  flag: string;
  country: string;
}) => (
  <span className="inline-flex items-center gap-1">
    <span className="text-lg">{flag}</span>
    <span>{country}</span>
  </span>
);

const PublicLayout = () => {
  const navItems = [
    { to: '/policy', label: 'Terms & Conditions', highlight: true },
    { to: '/policy/refunds', label: 'Refund / Cancellation', highlight: false },
    { to: '/policy/privacy', label: 'Privacy Policy', highlight: false },
    { to: '/policy/cookies', label: 'Cookies', highlight: false },
  ];

  const complianceItems = [
    { flag: '🇪🇺', country: 'EU GDPR' },
    { flag: '🇬🇧', country: 'UK GDPR' },
    { flag: '🇨🇭', country: 'Swiss FADP' },
    { flag: '🇺🇸', country: 'California CCPA' },
    { flag: '🇸🇬', country: 'Singapore PDPA' },
  ];

  return (
    <div className="mx-auto max-w-7xl pb-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="mx-auto my-8 max-w-3xl text-center lg:my-16 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Legal and Data Protection Documents
        </h1>

        <p className="mb-4 text-gray-500 dark:text-gray-400">
          You will find below all legal documents. Our data protection policies
          are compliant with:
        </p>

        {/* Compliance Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 text-sm">
          {complianceItems.map((item, idx) => (
            <ComplianceBadge
              key={idx}
              flag={item.flag}
              country={item.country}
            />
          ))}
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 lg:sticky lg:top-20 lg:mb-4">
          {navItems.map((item) => (
            <NavButton
              key={item.to}
              to={item.to}
              label={item.label}
              highlight={item.highlight}
            />
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default PublicLayout;
