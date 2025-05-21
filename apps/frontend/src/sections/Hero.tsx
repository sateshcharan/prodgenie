
import { Button } from '@prodgenie/libs/ui';
import { useAuthModalStore } from '@prodgenie/libs/store';

const Hero = () => {
  const { openModal } = useAuthModalStore();

  return (
    <section className="bg-gradient-to-b from-primary/10 to-background py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transform Your Production Workflow
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Streamline your manufacturing process with our intelligent job card
            management system
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
  );
};

export default Hero;
