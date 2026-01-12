import { ExternalLink } from "lucide-react";

import { Button } from "./ui/button";


const projects = [
  {
    title: "FinTrack Dashboard",
    category: "SaaS Application",
    description: "A comprehensive financial tracking platform with real-time analytics and automated reporting.",
    tags: ["React", "Node.js", "PostgreSQL"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
  },
  {
    title: "EcoShop Marketplace",
    category: "E-Commerce",
    description: "Sustainable products marketplace with carbon footprint tracking and eco-score ratings.",
    tags: ["Next.js", "Stripe", "MongoDB"],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
  },
  {
    title: "MindFlow App",
    category: "Health & Wellness",
    description: "Mental wellness application with guided meditation, mood tracking, and community features.",
    tags: ["React Native", "Firebase", "AI"],
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=400&fit=crop",
  },
];

const Portfolio = () => {
  return (
    <section id="portfolio" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Recent <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A selection of custom-built solutions that helped clients achieve their business goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="group rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-glow animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <Button variant="hero" size="sm">
                    View Project
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs text-primary font-medium mb-2">{project.category}</div>
                <h3 className="font-heading text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
