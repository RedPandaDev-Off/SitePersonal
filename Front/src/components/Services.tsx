import { Code, Settings, Globe, Zap, ScrollText, Smartphone } from "lucide-react";

const services = [
  {
    icon: Code,
    title: "Custom Web Development",
    description: "Full-stack web applications built with modern technologies, tailored to your specific business requirements.",
    price: "From €3,000",
  },
  {
icon: ScrollText,   // ← l’icône script / automation
    title: "Scripts & Automations",
    description: "Custom scripts (Node.js, Python, Bash…) to automate your tasks: data scraping, file processing, API bots, cron jobs, etc.",
    price: "From €500",
  },
{
    icon: Smartphone,                // ← le vrai remplaçant du MVP
    title: "Progressive Web Apps (PWA)",
    description: "Web apps that work offline, send push notifications and feel like native mobile apps – installable on phone & desktop.",
    price: "From €4,500",
  },
  {
    icon: Settings,
    title: "API Integration",
    description: "Seamless integration with third-party services, payment gateways, and custom API development.",
    price: "From €2,000",
  },
  {
    icon: Globe,
    title: "E-Commerce Solutions",
    description: "Complete online stores with inventory management, secure payments, and analytics dashboards.",
    price: "From €4,000",
  },
  {
    icon: Zap,
    title: "Performance Optimization",
    description: "Speed up your existing applications with code optimization, caching strategies, and best practices.",
    price: "From €900",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Services <span className="text-gradient">Tailored</span> for You
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every project is unique. I offer flexible solutions that adapt to your needs and budget.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-glow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
              <div className="font-heading text-primary font-semibold">{service.price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
