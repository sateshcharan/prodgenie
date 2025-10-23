import React, { useState } from 'react';

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/form/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('Something went wrong. Please try again later.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl pb-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="mx-auto mb-4 max-w-4xl px-4 md:mt-12">
        <div className="prose mx-auto lg:prose-lg">
          <h1 className="text-center text-pretty hyphens-auto font-semibold text-3xl sm:text-4xl">
            How can we help?
          </h1>
        </div>
      </div>

      {/* Intro Text */}
      <div className="relative mx-auto max-w-2xl">
        <div className="text-gray-500 mb-8 prose prose-lg md:prose-xl">
          <p>
            Thank you for your interest in our services! Whether you have a
            question about our features or need help with something, we’re here
            to assist you.
          </p>
        </div>

        {/* Info Box */}
        <div className="mb-12">
          <div className="flex flex-col gap-2 text-pretty rounded-md bg-blue-50 p-4 text-sm text-gray-800">
            <p>
              We’re a <b>self-service platform</b>, allowing you to explore and
              use it at your own pace. You can get started by{' '}
              <a
                href="https://app.parseur.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-blue-500 decoration-[3px] hover:bg-blue-600 hover:text-white px-1 rounded"
              >
                creating a free account
              </a>
              . If you have any questions after your trial, feel free to reach
              out via the contact form below, or call us at{' '}
              <a
                href="tel:+18884861987"
                className="underline decoration-blue-500 decoration-[3px] hover:bg-blue-600 hover:text-white px-1 rounded"
              >
                +1 888 486 1987
              </a>
              .
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Your name<span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Parser"
              required
              className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Your email address<span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject<span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Question about parsing"
              required
              className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message<span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Hi there, I would like to ..."
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </button>

            <p className="mt-2 text-center text-sm text-gray-500">
              We&apos;ll get back to you as soon as possible, typically within
              one business day. <br />
              You can also contact us via chat when signed into your account.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
