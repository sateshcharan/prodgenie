import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Sparkles,
  Zap,
} from 'lucide-react';

const features = [
  {
    title: 'AI-Powered Drawing Analysis',
    subtitle: 'Smart production drawing interpretation',
    description:
      'Advanced AI analyzes your CAD files, technical drawings, and blueprints to automatically extract manufacturing specifications and requirements.',
    icon: Sparkles,
    gradient: 'from-violet-600 via-purple-600 to-blue-600',
  },
  {
    title: 'Automated Job Card Generation',
    subtitle: 'Instant job card creation from drawings',
    description:
      'Generate comprehensive job cards with operations, tooling requirements, machining parameters, and quality checkpoints in seconds.',
    icon: FileText,
    gradient: 'from-pink-600 via-rose-600 to-orange-600',
  },
  {
    title: 'Production Planning Intelligence',
    subtitle: 'Smart manufacturing workflow optimization',
    description:
      'Optimize production sequences, estimate cycle times, and allocate resources efficiently based on drawing specifications.',
    icon: BarChart3,
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
  },
  {
    title: 'Real-time Integration',
    subtitle: 'Seamless ERP and MES connectivity',
    description:
      'Connect directly with your existing ERP, MES, and production systems for seamless workflow automation.',
    icon: Zap,
    gradient: 'from-amber-600 via-yellow-600 to-lime-600',
  },
];

const Features = () => {
  return (
    <section className="relative z-10 px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          <span className="text-white">Powerful</span>{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Manufacturing Intelligence
          </span>
        </h2>
        <p className="text-xl text-gray-300 text-center mb-16 max-w-3xl mx-auto">
          Advanced AI and automation tools designed specifically for modern
          manufacturing workflows
        </p>

        <div className="space-y-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={feature.title}
                className={`flex flex-col ${
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } items-center gap-12`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-blue-400 font-medium">
                      {feature.subtitle}
                    </div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    {feature.title}
                  </h3>
                  <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                    {feature.description}
                  </p>
                  <button
                    className={`group bg-gradient-to-r ${feature.gradient} px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2`}
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="flex-1">
                  <div
                    className={`relative bg-gradient-to-br ${feature.gradient} rounded-3xl p-8 transform hover:scale-105 transition-all duration-500`}
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <div className="h-3 bg-white/30 rounded flex-1 animate-pulse"></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <div
                              className="h-3 bg-white/30 rounded flex-1 animate-pulse"
                              style={{ animationDelay: '0.5s' }}
                            ></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-yellow-400" />
                            <div
                              className="h-3 bg-white/30 rounded w-3/4 animate-pulse"
                              style={{ animationDelay: '1s' }}
                            ></div>
                          </div>
                        </div>
                        <div className="pt-4">
                          <div className="w-16 h-16 bg-white/30 rounded-xl mx-auto animate-bounce flex items-center justify-center">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
