import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Send, CheckCircle, Loader2 } from "lucide-react";


import { z } from "zod";

const quoteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  service_type: z.string().min(1, "Please select a service"),
  budget_range: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select a timeline"),
  description: z.string().min(20, "Please provide at least 20 characters").max(2000),
});

const QuoteForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service_type: "",
    budget_range: "",
    timeline: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});


  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    try {
      quoteSchema.parse(formData);
      setErrors({});
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.issues.forEach((e) => {
          if (e.path[0]) {
            newErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setIsLoading(true);
    // Simulate successful submission (replace with actual API or logic as needed)
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
  
    }, 1200);
  };

  if (isSubmitted) {
    return (
      <section id="quote" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-heading text-3xl font-bold mb-4">Request Received!</h2>
            <p className="text-muted-foreground">
              Thank you for your interest. I'll review your project details and send you a personalized quote within 24 hours.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="quote" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Get Your <span className="text-gradient">Custom Quote</span>
            </h2>
            <p className="text-muted-foreground">
              Tell me about your project and I'll prepare a detailed proposal within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-8 rounded-2xl bg-gradient-card border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="John Doe"
                  className="bg-muted/50 border-border focus:border-primary"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="john@example.com"
                  className="bg-muted/50 border-border focus:border-primary"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="service">Service Type</Label>
                <Select value={formData.service_type} onValueChange={(v: string) => handleChange("service_type", v)}>
                  <SelectTrigger className="bg-muted/50 border-border focus:border-primary">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-development">Custom Web Development</SelectItem>
                    <SelectItem value="ui-ux">Scripts & Automations</SelectItem>
                    <SelectItem value="mvp">Progressive Web Apps (PWA)</SelectItem>
                    <SelectItem value="api">API Integration</SelectItem>
                    <SelectItem value="ecommerce">E-Commerce Solutions</SelectItem>
                    <SelectItem value="optimization">Performance Optimization</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.service_type && <p className="text-sm text-destructive">{errors.service_type}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <Select value={formData.budget_range} onValueChange={(v: string) => handleChange("budget_range", v)}>
                  <SelectTrigger className="bg-muted/50 border-border focus:border-primary">
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000-3000">$1,000 - $3,000</SelectItem>
                    <SelectItem value="3000-5000">$3,000 - $5,000</SelectItem>
                    <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10000+">$10,000+</SelectItem>
                    <SelectItem value="not-sure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
                {errors.budget_range && <p className="text-sm text-destructive">{errors.budget_range}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Desired Timeline</Label>
              <Select value={formData.timeline} onValueChange={(v: string) => handleChange("timeline", v)}>
                <SelectTrigger className="bg-muted/50 border-border focus:border-primary">
                  <SelectValue placeholder="When do you need it?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asap">ASAP</SelectItem>
                  <SelectItem value="1-month">Within 1 month</SelectItem>
                  <SelectItem value="2-3-months">2-3 months</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
              {errors.timeline && <p className="text-sm text-destructive">{errors.timeline}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Tell me about your project, goals, and any specific features you need..."
                rows={5}
                className="bg-muted/50 border-border focus:border-primary resize-none"
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Request Quote
                  <Send className="w-5 h-5" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              No commitment required. Free consultation included.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default QuoteForm;
