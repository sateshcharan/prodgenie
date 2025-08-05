import {
  BarChart3,
  Box,
  ChevronRight,
  Cog,
  Cpu,
  Package,
  Settings,
  Shield,
  Wrench,
} from 'lucide-react';

const industries = [
  { name: 'Automotive', icon: Cog, color: 'from-blue-500 to-purple-600' },
  { name: 'Aerospace', icon: Package, color: 'from-green-500 to-teal-600' },
  { name: 'Electronics', icon: Cpu, color: 'from-pink-500 to-rose-600' },
  {
    name: 'Machinery',
    icon: Settings,
    color: 'from-yellow-500 to-orange-600',
  },
  {
    name: 'Medical Devices',
    icon: Shield,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    name: 'Consumer Goods',
    icon: Box,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    name: 'Industrial Tools',
    icon: Wrench,
    color: 'from-red-500 to-pink-600',
  },
  {
    name: 'Manufacturing',
    icon: BarChart3,
    color: 'from-emerald-500 to-green-600',
  },
];

const Industries = () => {
  return (
    <section className="relative z-10 px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Industries We Serve
          </span>
        </h2>
        <p className="text-xl text-gray-300 text-center mb-16 max-w-3xl mx-auto">
          From aerospace to automotive, ProdGenie adapts to your industry's
          specific manufacturing requirements
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {industries.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <div
                key={industry.name}
                className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${industry.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">
                    {industry.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-400 group-hover:text-blue-400 transition-colors">
                    <span>Learn More</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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

export default Industries;
