import React from 'react';

const ErrorPage = () => {
  return (
    <div className="mx-auto max-w-7xl pb-8 px-4 sm:px-6 h-[calc(100vh-400px)]">
      {/* Header */}
      <div className="mx-auto mb-4 max-w-4xl px-4 md:mt-12">
        <div className="prose mx-auto lg:prose-lg text-center">
          <h1 className="text-pretty hyphens-auto font-semibold text-3xl sm:text-4xl">
            Something went wrong
          </h1>
        </div>
      </div>

      {/* Intro Text */}
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="text-gray-500 mb-8 prose prose-lg md:prose-xl">
          We couldn’t process your request at the moment. Please try again
          later, or contact support if the issue persists.
        </p>

        {/* Info Box */}
        <div className="mb-12">
          <div className="flex flex-col gap-2 text-pretty rounded-md bg-red-50 p-4 text-sm text-gray-800">
            <p>
              If you believe this is a mistake, feel free to reach out via our{' '}
              <a
                href="/contact"
                className="underline decoration-red-500 decoration-[3px] hover:bg-red-600 hover:text-white px-1 rounded"
              >
                Contact Form
              </a>{' '}
              or call us at{' '}
              <a
                href="tel:+18884861987"
                className="underline decoration-red-500 decoration-[3px] hover:bg-red-600 hover:text-white px-1 rounded"
              >
                +1 888 486 1987
              </a>
              .
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 items-center justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go back home
          </a>

          <a
            href="/contact"
            className="text-sm text-blue-600 hover:text-blue-700 underline decoration-blue-500 decoration-[3px]"
          >
            Need help? Contact support
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
