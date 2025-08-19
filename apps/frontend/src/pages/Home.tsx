import { useRef } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Box,
  CheckCircle,
  ChevronRight,
  Clock,
  Cog,
  Cpu,
  Download,
  FileText,
  Package,
  Play,
  Settings,
  Shield,
  Sparkles,
  Upload,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';

import { logo } from '@prodgenie/libs/ui';

type SectionWrapperProps = {
  children: React.ReactNode;
  from?: 'top' | 'bottom' | 'left' | 'right';
};

const stats = [
  {
    value: '95%',
    label: 'Time Reduction',
    description: 'in job card creation',
  },
  {
    value: '99.8%',
    label: 'Accuracy Rate',
    description: 'in drawing analysis',
  },
  { value: '500+', label: 'Manufacturers', description: 'trust ProdGenie' },
];

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

const SectionWrapper = ({ children, from = 'bottom' }: SectionWrapperProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Determine initial offset based on direction
  const getInitialOffset = () => {
    switch (from) {
      case 'top':
        return { y: -50 };
      case 'bottom':
        return { y: 50 };
      case 'left':
        return { x: -50 };
      case 'right':
        return { x: 50 };
      default:
        return { y: 50 };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...getInitialOffset() }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-40 left-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-10 opacity-0'
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
              instantly. ProdGenie's AI analyzes CAD files and generates
              detailed manufacturing instructions automatically.
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

      {/* Stats */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="group hover:scale-105 transition-transform duration-300"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-white text-lg font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-gray-400 text-sm">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="text-white">Simple</span>{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              3-Step Process
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                1. Upload Drawings
              </h3>
              <p className="text-gray-300 text-lg">
                Upload your CAD files, technical drawings, or blueprints in any
                format (DWG, PDF, STEP, etc.)
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Cpu className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                2. AI Analysis
              </h3>
              <p className="text-gray-300 text-lg">
                Our AI analyzes dimensions, tolerances, materials, and
                manufacturing requirements automatically
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Download className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                3. Generate Job Cards
              </h3>
              <p className="text-gray-300 text-lg">
                Get comprehensive job cards with operations, tooling,
                parameters, and quality checkpoints
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
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

      <SectionWrapper from="right">
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
      </SectionWrapper>

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

      <SectionWrapper from="left">
        <section className="py-12 bg-gray-950">
          <img
            src={logo}
            alt="Website Logo"
            className="h-8 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-gray-400">
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  API
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Industries</h4>
              <div className="space-y-2 text-gray-400">
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Automotive
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Aerospace
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Manufacturing
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <div className="space-y-2 text-gray-400">
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Documentation
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Case Studies
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Blog
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-gray-400">
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  About
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Contact
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Support
                </a>
              </div>
            </div>
          </div>
        </section>
      </SectionWrapper>
    </div>
  );
};

export default Home;
