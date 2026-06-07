import { Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-card border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo et description */}
          <div>
            <a href="#" className="font-heading font-bold text-xl text-gradient">
              Redpandadev
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              Building digital solutions that matter.
            </p>
          </div>

          {/* Liens légaux */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Informations légales</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/cgu" className="text-muted-foreground hover:text-primary transition-colors">
                  Conditions Générales d'Utilisation
                </Link>
              </li>
              <li>
                <Link to="/cgv" className="text-muted-foreground hover:text-primary transition-colors">
                  Conditions Générales de Vente
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-muted-foreground hover:text-primary transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Suivez-nous</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/RedPandaDev-Off"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/adrien-beluriee-81159023a/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:redpandadev.contact@gmail.com"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/30 text-center text-sm text-muted-foreground">
          © {currentYear} Redpandadev. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
