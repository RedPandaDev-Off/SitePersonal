import { MessageSquare, FileSearch, Code2, Rocket, CheckCircle } from "lucide-react";

const steps = [
{
  icon: MessageSquare,
  step: "01",
  title: "Email Exchange",
  description: "You send me your project details, goals, timeline & budget. I reply within 72h with questions and a clear proposal.",
},
  {
    icon: FileSearch,
    step: "02",
    title: "Proposal & Quote",
    description: "You receive a detailed proposal with project scope, milestones, timeline, and transparent pricing.",
  },
  {
    icon: Code2,
    step: "03",
    title: "Development",
    description: "I build your project with regular updates and feedback sessions to ensure everything meets expectations.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Review & Revisions",
    description: "You test the deliverables and request any adjustments. Two revision rounds are included.",
  },
  {
    icon: Rocket,
    step: "05",
    title: "Launch & Support",
    description: "We deploy your project and I provide 30 days of free support to ensure a smooth launch.",
  },
];

const Process = () => {
  return (
    <section id="process" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden lg:block" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            How We <span className="text-gradient">Work Together</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A transparent, structured approach to bring your project from idea to reality.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={`flex items-start gap-6 mb-12 last:mb-0 animate-fade-in ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`flex-1 ${index % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                <div className="p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300 inline-block w-full">
                  <div className="flex items-center gap-4 mb-4 lg:justify-start">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-heading text-4xl font-bold text-muted/30">{step.step}</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2 text-left">{step.title}</h3>
                  <p className="text-muted-foreground text-sm text-left">{step.description}</p>
                </div>
              </div>
              <div className="hidden lg:flex w-4 shrink-0 justify-center">
                <div className="w-4 h-4 rounded-full bg-primary shadow-glow" />
              </div>
              <div className="flex-1 hidden lg:block" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
