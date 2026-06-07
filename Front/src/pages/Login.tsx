import React, { useState } from "react";
import { useAuth } from "../lib/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        if (data.user && data.token) {
          // Utiliser le contexte auth avec le token JWT
          login(data.user, data.token);
        }
        // Redirige selon le rôle ou autre logique
        if (data.user && data.user.role && data.user.role.toLowerCase() === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Erreur réseau ou serveur");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-2xl bg-gradient-card border border-border/50 shadow-lg">
        <h2 className="font-heading text-2xl font-bold mb-6 text-gradient text-center">Sign in</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm text-muted-foreground font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border border-border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:border-primary text-black bg-muted/30"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-muted-foreground font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full border border-border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:border-primary text-black bg-muted/30"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="text-red-500 mb-2 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-primary text-primary-foreground shadow-button hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] font-semibold py-2 rounded-lg transition text-lg"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <a
          href="/"
          className="block mt-6 text-center w-full"
        >
          <button
            type="button"
            className="w-full bg-muted/40 border border-border text-foreground py-2 rounded-lg hover:bg-muted/60 transition mt-2"
          >
            Back to site
          </button>
        </a>
        <div className="mt-4 text-center space-y-2">
          <a href="/forgot-password" className="text-muted-foreground hover:underline text-sm block">
            Mot de passe oublié ?
          </a>
          <a href="/register" className="text-primary hover:underline text-sm font-medium">
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;