import { PricingCard, Button } from '@prodgenie/libs/ui';
import { useNavigate } from 'react-router-dom';
import { toast } from '@prodgenie/libs/ui';
import { useState } from 'react';
import { handleCheckout } from '../components/HandleCheckout';
import api from '../utils/api';

const Home = () => {
  const navigate = useNavigate();

  const PRICE_IDS = {
    starter: {
      monthly: 'price_StarterMonthly',
      annual: 'price_StarterAnnual',
    },
    pro: {
      monthly: 'price_ProMonthly',
      annual: 'price_ProAnnual',
    },
    enterprise: {
      monthly: 'price_EnterpriseMonthly',
      annual: 'price_EnterpriseAnnual',
    },
  };

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    'monthly'
  );

  const handleCheckout = async (priceId: string) => {
    // const response = await api.post('/api/payment/stripe/session', {
    //   priceId,
    // });

    console.log('Going to checkout with', priceId);
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform Your Production Workflow
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Streamline your manufacturing process with our intelligent job
              card management system
            </p>
            <Button size="lg" onClick={() => navigate('/signup')}>
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-4">Smart Templates</h3>
              <p className="text-muted-foreground">
                Create and manage job cards with intelligent templates that
                adapt to your needs
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-4">PDF Processing</h3>
              <p className="text-muted-foreground">
                Extract data automatically from PDF documents with advanced
                processing
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-4">Real-time Updates</h3>
              <p className="text-muted-foreground">
                Track and manage your production workflow in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Choose Your Plan</h2>

          {/* Toggle */}
          <div className="inline-flex rounded-lg bg-white p-1 mb-12">
            {(['monthly', 'annual'] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`
                px-4 py-2 rounded-lg
                ${
                  billingCycle === cycle
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              >
                {cycle === 'monthly' ? 'Monthly' : 'Annual (2 months free)'}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
            {/* Starter */}
            <PricingCard
              title="Starter"
              price={billingCycle === 'monthly' ? 29 : 29 * 10} // e.g. 10 months paid instead of 12
              cycle={billingCycle}
              features={[
                'Up to 50 job cards / month',
                'Basic drawing import',
                'Email support',
              ]}
              onClick={() => handleCheckout(PRICE_IDS.starter[billingCycle])}
            />

            {/* Pro */}
            <PricingCard
              title="Pro"
              price={billingCycle === 'monthly' ? 99 : 99 * 10}
              cycle={billingCycle}
              features={[
                'Up to 500 job cards / month',
                'BOM extraction',
                'Standard integrations',
                'Priority email support',
              ]}
              onClick={() => handleCheckout(PRICE_IDS.pro[billingCycle])}
            />

            {/* Enterprise */}
            <PricingCard
              title="Enterprise"
              price={billingCycle === 'monthly' ? 299 : 299 * 10}
              cycle={billingCycle}
              features={[
                'Unlimited job cards',
                'Custom workflows & API access',
                'Dedicated account manager',
                '24/7 phone support',
              ]}
              onClick={() => handleCheckout(PRICE_IDS.enterprise[billingCycle])}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of companies that trust our platform
          </p>
          <Button
            size="lg"
            onClick={() => {
              navigate('/signup');
              toast.success('Welcome to ProdGenie!');
            }}
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Pre Footer */}
      <footer className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>Support</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>GitHub</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
