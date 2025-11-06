import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@prodgenie/libs/ui';

const faqs = [
  {
    question: 'What is a credit?',
    answer: (
      <>
        <p>
          Parseur offers both monthly and yearly self-service plans based on
          your usage volume. Each plan includes a set number of credits, where{' '}
          <strong>1 credit equals 1 page processed</strong>. Unused credits
          expire at the end of each billing period.
        </p>
        <p>
          For more information, visit our{' '}
          <a
            href="https://help.parseur.com/en/articles/4237000-credits-subscription-and-pricing-faq"
            className="text-primary hover:underline"
          >
            pricing support page
          </a>
          .
        </p>
      </>
    ),
  },
  {
    question: 'What is a page?',
    answer: (
      <>
        <p>
          For PDFs, the total number of pages in the document is used to
          calculate your usage. Emails and spreadsheets count as one page
          regardless of length.
        </p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Processing an email costs 1 credit.</li>
          <li>Processing a CSV file costs 1 credit.</li>
          <li>Processing a one-page PDF costs 1 credit.</li>
          <li>Processing a three-page PDF costs 3 credits.</li>
        </ul>
      </>
    ),
  },
  {
    question: 'What is a mailbox?',
    answer: (
      <p>
        A mailbox accepts your documents for data extraction. Each mailbox has
        its own fields and settings. You can create multiple mailboxes to handle
        different document types or sources.
      </p>
    ),
  },
  {
    question: 'How does the AI parsing engine work?',
    answer: (
      <p>
        The AI engine extracts fields automatically based on your descriptions.
        Unlike templates, it adapts to layout variations without needing
        predefined formats.
      </p>
    ),
  },
  {
    question: 'How does the Template parsing engine work?',
    answer: (
      <p>
        You create templates for each document layout. Parseur matches incoming
        documents to the correct template automatically for precise data
        extraction.
      </p>
    ),
  },
  {
    question: 'What is post-processing?',
    answer: (
      <p>
        Post-Processing lets you write small Python scripts for advanced data
        manipulation. Available in Scale tier plans (10,000+ credits/month).
      </p>
    ),
  },
  {
    question: 'What are multi-user accounts?',
    answer: (
      <p>
        Multi-user accounts allow sharing mailboxes and templates across your
        team. Available in Scale tier plans (10,000+ credits/month).
      </p>
    ),
  },
  {
    question: 'Can I change my subscription?',
    answer: (
      <p>
        Yes. You can upgrade or downgrade anytime in the app. Upgrades are
        immediate; downgrades take effect next billing cycle.
      </p>
    ),
  },
  {
    question: 'Can I cancel my subscription?',
    answer: (
      <p>
        Yes. Cancel anytime in the app. Your subscription ends at the current
        billing period.
      </p>
    ),
  },
  {
    question: 'Can I get an invoice?',
    answer: (
      <p>
        Yes. You’ll receive an invoice by email after payment, and copies are
        available under <em>Invoices & Usage</em> in your account settings.
      </p>
    ),
  },
  {
    question: 'What is your data retention policy?',
    answer: (
      <p>
        You can set data retention between 1 day and unlimited, depending on
        your plan. Configure this in your mailbox settings.
      </p>
    ),
  },
  {
    question: 'I have specific needs in terms of volume, billing, or contract',
    answer: (
      <p>
        Check out our Enterprise plans. Complete{' '}
        <a href="/quote" className="text-primary hover:underline">
          this quote form
        </a>{' '}
        and we’ll get back to you shortly.
      </p>
    ),
  },
  {
    question: 'What are your Terms and Conditions?',
    answer: (
      <p>
        By signing up you agree to our{' '}
        <a href="/terms" className="text-primary hover:underline">
          terms
        </a>
        ,{' '}
        <a href="/dpa" className="text-primary hover:underline">
          data processing agreement
        </a>
        ,{' '}
        <a href="/privacy" className="text-primary hover:underline">
          privacy policy
        </a>
        , and{' '}
        <a href="/cookies" className="text-primary hover:underline">
          cookie policy
        </a>
        .
      </p>
    ),
  },
];

const FAQ = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Left Column */}
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Can’t find the answer you’re looking for?{' '}
            <a href="/contact" className="text-primary hover:underline">
              Contact us
            </a>{' '}
            today.
          </p>
        </div>

        {/* Accordion Column */}
        <div className="mt-12 lg:col-span-2 lg:mt-0">
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-4"
            defaultValue="item-0"
          >
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground mt-2 prose dark:prose-invert">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
