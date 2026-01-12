
import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };


  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#portfolio", label: "Portfolio" },
    { href: "#process", label: "Process" },
    { href: "#testimonials", label: "Testimonials" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-heading font-bold text-xl text-gradient">
            Redpandadev
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
            <a href="#quote">
              <Button variant="hero" size="sm">
                Get a Quote
              </Button>
            </a>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{user.name || user.email}</span>
                {user.role && user.role.toLowerCase() === "admin" ? (
                  <Link to="/admin">
                    <Button variant="secondary" size="sm">Admin</Button>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <Button variant="secondary" size="sm">Dashboard</Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login" className="ml-2">
                <Button variant="hero" size="sm">
                  Sign in
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a href="#quote" onClick={() => setIsOpen(false)}>
                <Button variant="hero" size="sm" className="w-full mt-2">
                  Get a Quote
                </Button>
              </a>
              {user ? (
                <>
                  {user.role && user.role.toLowerCase() === "admin" ? (
                    <Link to="/admin" className="w-full mt-2" onClick={() => setIsOpen(false)}>
                      <Button variant="secondary" size="sm" className="w-full">Admin</Button>
                    </Link>
                  ) : (
                    <Link to="/dashboard" className="w-full mt-2" onClick={() => setIsOpen(false)}>
                      <Button variant="secondary" size="sm" className="w-full">Dashboard</Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { handleLogout(); setIsOpen(false); }}>
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/login" className="w-full mt-2" onClick={() => setIsOpen(false)}>
                  <Button variant="hero" size="sm" className="w-full">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
