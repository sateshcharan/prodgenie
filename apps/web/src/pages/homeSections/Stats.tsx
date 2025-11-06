const Stats = () => {
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

  return (
    <section className="relative z-10 px-6 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group hover:scale-105 transition-transform"
          >
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {stat.value}
            </div>
            <div className="text-foreground text-lg font-semibold mb-1">
              {stat.label}
            </div>
            <div className="text-muted-foreground text-sm">
              {stat.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
