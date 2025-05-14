import { Button } from '@prodgenie/libs/ui';
import { useNavigate } from 'react-router-dom';
import { toast } from '@prodgenie/libs/ui';
import PricingCard from '../components/PricingCard';
import { useAuthModalStore } from '@prodgenie/libs/store';

const Home = () => {
  const navigate = useNavigate();
  const { openModal } = useAuthModalStore();
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
            <Button
              size="lg"
              onClick={() => {
                openModal('signup');
              }}
            >
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
      <PricingCard />

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
              openModal('signup');
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
