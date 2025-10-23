import { Button } from '@prodgenie/libs/ui';
import { ArrowRight, Play, Sparkles, Upload } from 'lucide-react';

const Hero = ({ isVisible }) => {
  return (
    <section className="relative z-10 px-6 py-20">
      <div className="max-w-7xl mx-auto text-center">
        <div
          className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">
              AI-Powered Manufacturing Intelligence
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="text-primary">Automate</span>
            <br />
            <span className="text-foreground">Job Card</span>
            <br />
            <span className="text-primary">Generation</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
            Transform your production drawings into comprehensive job cards
            instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="group p-6 rounded-2xl text-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300">
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="p-6 rounded-2xl text-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Drawing</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
