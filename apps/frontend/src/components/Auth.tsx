import { ReactNode } from 'react';

export default function Auth({
  children,
  imageUrl = '/assets/auth-illustration.jpg', // fallback image
  imageAlt = 'Authentication illustration',
}: {
  children: ReactNode;
  imageUrl?: string;
  imageAlt?: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">
      {/* Left side: Image */}
      <div className="hidden md:block bg-muted">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side: Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-8 ">
        {children}
      </div>
    </div>
  );
}
