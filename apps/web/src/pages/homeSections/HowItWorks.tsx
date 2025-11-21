import { useNavigate } from 'react-router-dom';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@prodgenie/libs/ui/accordion';

import { Button } from '@prodgenie/libs/ui/button';

import integrations from '../../assets/integrations.webp';
import selectProjectType from '../../assets/selectProjectType.webp';
import supportedDocumentFormats from '../../assets/supportedDocumentFormats.webp';
import aiParsingEngine from '../../assets/aiParsingEngine.mp4';
import { ChevronRight } from 'lucide-react';

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 px-6 py-12  max-w-7xl mx-auto">
      <h2 className="text-4xl  font-bold text-center mb-4 text-primary">
        Prodgenie to the rescue. How does it work?
      </h2>
      <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
        Using Prodgenie is easy. No technical skills required, no complex rules
        to write, and no need to train an AI model with hundreds of samples.
      </p>
      <div className="flex flex-col gap-16">
        {/* Step 1 */}
        <div className="overflow-hidden lg:grid lg:grid-cols-3 lg:gap-16">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
            <div className="lg:self-center">
              <h2 className="text-xl font-semibold sm:text-2xl lg:text-3xl">
                1. Choose what to extract
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-700">
                Upload your first document. Parseur analyzes your document and
                suggests fields to extract.
                <br />
                <br />
                Review and adjust fields for your use case.
              </p>
            </div>
          </div>
          <div className="flex items-center lg:col-span-2">
            <div className="p-4">
              <img
                src={selectProjectType}
                alt="List of all parser types available"
                className="mb-4 mr-4 h-auto w-full rounded-xl border border-gray-100 p-2 shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="overflow-hidden lg:grid lg:grid-cols-2">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
            <div className="lg:self-center">
              <h2 className="text-xl font-semibold sm:text-2xl lg:text-3xl">
                2. Automate imports
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-700">
                Parseur supports{' '}
                <mark>
                  emails, PDFs (native and scanned), spreadsheets, text files,
                  HTML pages
                </mark>
                , and more.
                <br />
                <br />
                Our OCR reads many languages and scripts, including handwriting.
                <br />
                <br />
                Upload in the app, set up automatic imports by email, via the
                API, or through Zapier, Make, or Power Automate.
              </p>

              <div className="mx-auto my-4 max-w-md sm:my-8 sm:flex sm:justify-center">
                <a
                  href="https://app.parseur.com/signup"
                  className="flex items-center justify-center rounded-xl border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-md hover:bg-amber-700 md:px-10 md:py-4 md:text-lg"
                >
                  Import your first document
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 512 512"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M505 273c9.4-9.4 9.4-24.6 0-33.9L337 71c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l127 127H24c-13.3 0-24 10.7-24 24s10.7 24 24 24h406l-127 127c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l168-168z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center lg:order-first">
            <div className="flex items-center justify-center p-4">
              <img
                src={supportedDocumentFormats}
                alt="List of all document formats supported by Parseur"
                className="h-auto w-full max-w-md rounded-xl border border-gray-100 shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Step 3 (simplified accordion removed for React) */}
        <div className="overflow-hidden lg:grid lg:grid-cols-1">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
            <div className="lg:self-center">
              <h2 className="text-xl font-semibold sm:text-2xl lg:text-3xl">
                3. Extract data
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-700">
                Pick the engine that fits the document: AI, OCR templates for
                PDFs, or Text templates for emails and HTML. We recommend
                starting with the AI engine and using a template engine when
                strict rules are required.
              </p>

              <Accordion
                type="single"
                collapsible
                className="w-full s"
                defaultValue="item-1"
              >
                <AccordionItem
                  value="item-1"
                  className="border rounded px-4 mt-4"
                >
                  <AccordionTrigger className="text-xl font-semibold hover:no-underline hover:text-blue">
                    Product Information
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mx-auto max-w-2xl text-gray-700">
                        <p>
                          List the fields you need (invoice number, total, due
                          date, etc.) and Parseur’s AI will extract them for
                          you.
                        </p>
                        <p className="mt-4">
                          Add short instructions when you want extra precision.
                          Because it's layout-aware, it keeps working even when
                          formats change.
                        </p>
                      </div>
                      <video
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="mt-6 rounded-lg border border-gray-300 lg:h-96"
                      >
                        <source src={aiParsingEngine} type="video/mp4" />
                      </video>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-2"
                  className="border rounded px-4 mt-4"
                >
                  <AccordionTrigger className="text-xl font-semibold hover:no-underline hover:text-blue">
                    Shipping Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mx-auto max-w-2xl text-gray-700">
                        <p>
                          List the fields you need (invoice number, total, due
                          date, etc.) and Parseur’s AI will extract them for
                          you.
                        </p>
                        <p className="mt-4">
                          Add short instructions when you want extra precision.
                          Because it's layout-aware, it keeps working even when
                          formats change.
                        </p>
                      </div>
                      <video
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="mt-6 rounded-lg border border-gray-300 lg:h-96"
                      >
                        <source
                          src="/videos/ai-parsing-engine.mp4"
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-3"
                  className="border rounded px-4 mt-4"
                >
                  <AccordionTrigger className="text-xl font-semibold hover:no-underline hover:text-blue">
                    Return Policy
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mx-auto max-w-2xl text-gray-700">
                        <p>
                          List the fields you need (invoice number, total, due
                          date, etc.) and Parseur’s AI will extract them for
                          you.
                        </p>
                        <p className="mt-4">
                          Add short instructions when you want extra precision.
                          Because it's layout-aware, it keeps working even when
                          formats change.
                        </p>
                      </div>
                      <video
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="mt-6 rounded-lg border border-gray-300 lg:h-96"
                      >
                        <source
                          src="/videos/ai-parsing-engine.mp4"
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="overflow-hidden lg:grid lg:grid-cols-2">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
            <div className="lg:self-center">
              <h2 className="text-xl font-semibold sm:text-2xl lg:text-3xl">
                4. Send data to your applications
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-700">
                Connect to Zapier, Make, Power Automate, and other platforms to{' '}
                <mark>push results in real time</mark>.
                <br />
                <br />
                Deliver directly to your systems with webhooks or the API.
                <br />
                <br />
                Export anytime as CSV, Excel, or JSON.
              </p>
            </div>
          </div>
          <div className="mb-4 flex items-center justify-center lg:order-first">
            <div className="flex items-center justify-center p-4">
              <img
                src={integrations}
                alt="List of some of the integrations supported by Parseur"
                className="h-auto w-full max-w-md rounded-xl border border-gray-100 shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mx-auto max-w-md sm:flex sm:justify-center">
          <button
            onClick={() => navigate('/signup')}
            className="flex w-full items-center justify-center rounded-xl border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-md hover:bg-amber-700 md:px-10 md:py-4 md:text-lg"
          >
            Try Prodgneie for free
            <svg
              className="ml-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M505 273c9.4-9.4 9.4-24.6 0-33.9L337 71c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l127 127H24c-13.3 0-24 10.7-24 24s10.7 24 24 24h406l-127 127c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l168-168z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
