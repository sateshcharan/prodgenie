import { PricingCard, Button } from '@prodgenie/apps/ui';
import { useNavigate } from 'react-router-dom';
import { toast } from '@prodgenie/apps/ui';

const Home = () => {
  const navigate = useNavigate();

  const handleProPlanClick = () => {
    navigate('/signup');
  };
  const handleFreePlanClick = () => {
    navigate('/signup');
  };

  return (
    <div>
      <section>
        <div className="flex justify-center items-center h-screen gap-4 p-4">
          <PricingCard
            title="Free Plan"
            price={0}
            onClick={handleFreePlanClick}
          />
          <PricingCard
            title="Pro Plan"
            price={9.99}
            onClick={handleProPlanClick}
          />
        </div>
      </section>
      <Button
        variant="outline"
        onClick={() => {
          toast.success('Job order created successfully!');
        }}
      >
        Show Toast
      </Button>
    </div>
  );
};

export default Home;
