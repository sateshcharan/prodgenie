import { toast } from '@prodgenie/libs/ui';
import { Button } from '@prodgenie/libs/ui';
import { useAuthModalStore } from '@prodgenie/libs/store';
import { Sparkles, Users } from 'lucide-react';

const CTA = () => {
  const { openModal } = useAuthModalStore();

  return (
    <section className="relative z-10 px-6 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              TRANSFORM YOUR
            </span>
            <br />
            <span className="text-white">MANUFACTURING TODAY</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of manufacturers who've automated their job card
            generation with ProdGenie
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Start 30-Day Free Trial</span>
            </button>
            <button className="border border-gray-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/5 transition-all duration-300 flex items-center justify-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Schedule Demo</span>
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            No credit card required • Setup in minutes • 24/7 support
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
