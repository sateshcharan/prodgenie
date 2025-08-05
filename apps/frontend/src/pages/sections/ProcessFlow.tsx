import { Cpu, Download, Upload } from "lucide-react";

const ProcessFlow = () => {
  return     <section className="relative z-10 px-6 py-20">
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
      </section>;
};

export default ProcessFlow;
