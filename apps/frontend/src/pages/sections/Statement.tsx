const Statement = () => {
  return (
    <section className="py-12">
      <figure className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-6 gap-y-4 p-4 text-gray-500 lg:gap-x-10">
        {/* Quote Section */}
        <div className="relative col-span-2 lg:col-start-1 lg:row-start-2">
          <svg
            className="absolute -left-16 -top-12 -z-10 h-32 w-32 text-brand/30"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="currentColor"
          >
            <path d="M7.17 4A7.17 7.17 0 0 0 0 11.17c0 3.67 2.97 6.66 6.64 6.66a6.6 6.6 0 0 0 4.71-1.94 7.16 7.16 0 0 1-2.08 4.85c-.35.36-.73.7-1.12 1.02a1 1 0 0 0 1.24 1.56 10.03 10.03 0 0 0 3.37-3.82C14.05 15.69 14 11 14 11 14 5.48 10.34 4 7.17 4Zm12 0A7.17 7.17 0 0 0 12 11.17c0 3.67 2.97 6.66 6.64 6.66a6.6 6.6 0 0 0 4.71-1.94 7.16 7.16 0 0 1-2.08 4.85c-.35.36-.73.7-1.12 1.02a1 1 0 0 0 1.24 1.56 10.03 10.03 0 0 0 3.37-3.82C26.05 15.69 26 11 26 11c0-5.52-3.66-7-6.83-7Z" />
          </svg>

          <blockquote className="text-xl font-semibold italic leading-8 text-foreground sm:text-2xl sm:leading-9">
            “We are able to automate sorting, transcribing, and filing of
            thousands of emails our company receives daily.”
          </blockquote>
        </div>

        {/* Author */}
        <figcaption className="text-base sm:flex sm:items-center lg:col-start-1 lg:row-start-3">
          <div className="text-base font-medium text-foreground">
            Scott Miyazaki
          </div>
          <svg
            className="mx-1 hidden h-5 w-5 text-brand sm:block"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M11 0h3L9 20H6l5-20z" />
          </svg>
          <div className="text-base font-medium text-muted-foreground">
            swaggseats.com
          </div>
        </figcaption>
      </figure>
    </section>
  );
};

export default Statement;
