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

const Stats = () => {
  return (
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
      </section>  )
}

export default Stats