import { Button } from '@prodgenie/libs/ui';
import { useAuthModalStore } from '@prodgenie/libs/store';
import { ArrowRight, Play, Sparkles, Upload } from 'lucide-react';

const Hero = ({ isVisible }: any) => {
  const { openModal } = useAuthModalStore();

  return (
    // <section className="bg-gradient-to-b from-primary/10 to-background py-20">
    //   <div className="container mx-auto px-4">
    //     <div className="text-center max-w-3xl mx-auto">
    //       <h1 className="text-4xl md:text-6xl font-bold mb-6">
    //         Transform Your Production Workflow
    //       </h1>
    //       <p className="text-lg text-muted-foreground mb-8">
    //         Streamline your manufacturing process with our intelligent job card
    //         management system
    //       </p>
    //       <Button
    //         size="lg"
    //         onClick={() => {
    //           openModal('signup');
    //         }}
    //       >
    //         Get Started Now
    //       </Button>
    //     </div>
    //   </div>
    // </section>
    <section className="relative z-10 px-6 py-20">
      <div className="max-w-7xl mx-auto text-center">
        <div
          className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">
              AI-Powered Manufacturing Intelligence
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Automate
            </span>
            <br />
            <span className="text-white">Job Card</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Generation
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Transform your production drawings into comprehensive job cards
            instantly. ProdGenie's AI analyzes CAD files and generates detailed
            manufacturing instructions automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border border-gray-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/5 transition-all duration-300 flex items-center justify-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Drawing</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
