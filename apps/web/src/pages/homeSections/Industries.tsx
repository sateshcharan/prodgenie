import {
  Cog,
  Package,
  Cpu,
  Settings,
  Shield,
  Box,
  Wrench,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

const Industries = () => {
  const industries = [
    { name: 'Automotive', icon: Cog },
    { name: 'Aerospace', icon: Package },
    { name: 'Electronics', icon: Cpu },
    { name: 'Machinery', icon: Settings },
    { name: 'Medical Devices', icon: Shield },
    { name: 'Consumer Goods', icon: Box },
    { name: 'Industrial Tools', icon: Wrench },
    { name: 'Manufacturing', icon: BarChart3 },
  ];

  return (
    <section className="relative z-10 px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-primary">
          Industries We Serve
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
          From aerospace to automotive, ProdGenie adapts to your industry's
          specific needs.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {industries.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <div
                key={industry.name}
                className="group cursor-pointer transform hover:scale-105 transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border hover:shadow-lg">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {industry.name}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary">
                    <span>Learn More</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
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
