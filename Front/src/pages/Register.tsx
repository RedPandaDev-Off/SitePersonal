import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || email.split('@')[0], email, password }),
      });
      if (response.ok) {
        setSuccess("Compte créé avec succès ! Vous pouvez vous connecter.");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la création du compte");
      }
    } catch {
      setError("Erreur réseau ou serveur");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-2xl bg-gradient-card border border-border/50 shadow-lg">
        <h2 className="font-heading text-2xl font-bold mb-6 text-gradient text-center">Create an account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm text-muted-foreground font-medium" htmlFor="name">
              Nom
            </label>
            <input
              id="name"
              type="text"
              className="w-full border border-border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:border-primary text-black bg-muted/30"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
              placeholder="Votre nom"
            />
          </div>
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
              placeholder="Votre email"
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
              autoComplete="new-password"
              placeholder="Enter your password"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-muted-foreground font-medium" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full border border-border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:border-primary text-black bg-muted/30"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
            />
          </div>
          {error && <div className="text-red-500 mb-2 text-sm text-center">{error === "Les mots de passe ne correspondent pas" ? "Passwords do not match" : error}</div>}
          {success && <div className="text-green-600 mb-2 text-sm text-center">Account created successfully! You can now sign in.</div>}
          <button
            type="submit"
            className="w-full bg-gradient-primary text-primary-foreground shadow-button hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] font-semibold py-2 rounded-lg transition text-lg"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <a
          href="/login"
          className="block mt-6 text-center w-full"
        >
          <button
            type="button"
            className="w-full bg-muted/40 border border-border text-foreground py-2 rounded-lg hover:bg-muted/60 transition mt-2"
          >
            Back to login
          </button>
        </a>
        <a
          href="/"
          className="block mt-2 text-center w-full"
        >
          <button
            type="button"
            className="w-full bg-muted/40 border border-border text-foreground py-2 rounded-lg hover:bg-muted/60 transition"
          >
            Back to site
          </button>
        </a>
      </div>
    </div>
  );
};

export default Register;