import { toast } from '@prodgenie/libs/ui';
import { Button } from '@prodgenie/libs/ui';
import { useAuthModalStore } from '@prodgenie/libs/store';

const CTA = () => {
  const { openModal } = useAuthModalStore();

  return (
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
  );
};

export default CTA;
