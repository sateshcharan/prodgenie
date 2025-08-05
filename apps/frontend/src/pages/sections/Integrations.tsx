import { Zap } from 'lucide-react';

const Integrations = () => {
  return (
    <section className="relative z-10 px-6 py-20">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="text-white">Seamless</span>{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Integration
          </span>
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Connect with your existing manufacturing systems and workflows
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            'ERP Systems',
            'MES Platforms',
            'CAD Software',
            'Quality Systems',
          ].map((system, index) => (
            <div
              key={system}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-400/30 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold">{system}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
