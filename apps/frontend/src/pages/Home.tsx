import { PricingCard } from '@prodgenie/apps/ui';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleProPlanClick = () => {
    console.log('Pro plan clicked');
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
    </div>
  );
};

export default Home;
