import FAQ from './homeSections/FAQ';
import PricingTable from './homeSections/PricingTable';
import PricingSlider from './homeSections/PricingSlider';

const Pricing = () => {
  return (
    <div className="p-6 max-w-8xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">
          Simple volume-based pricing
        </h1>
      </header>

      {/* pricing slider sections */}
      <PricingSlider />

      {/* pricing table sections */}
      <PricingTable />

      <FAQ />
    </div>
  );
};

export default Pricing;
