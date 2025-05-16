const Features = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-4">Smart Templates</h3>
            <p className="text-muted-foreground">
              Create and manage job cards with intelligent templates that adapt
              to your needs
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-4">PDF Processing</h3>
            <p className="text-muted-foreground">
              Extract data automatically from PDF documents with advanced
              processing
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-4">Real-time Updates</h3>
            <p className="text-muted-foreground">
              Track and manage your production workflow in real-time
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
