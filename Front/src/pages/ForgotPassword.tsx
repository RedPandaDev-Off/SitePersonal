import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || "Une erreur est survenue.");
      }
    } catch {
      setError("Erreur réseau ou serveur.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-2xl bg-gradient-card border border-border/50 shadow-lg">
        <h2 className="font-heading text-2xl font-bold mb-2 text-gradient text-center">
          Mot de passe oublié
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="text-green-500 font-medium">
              Si un compte existe pour cet email, vous recevrez un lien de réinitialisation dans quelques minutes.
            </div>
            <a href="/login" className="text-primary hover:underline text-sm font-medium block">
              Retour à la connexion
            </a>
          </div>
        ) : (
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
                autoComplete="email"
                placeholder="Votre adresse email"
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground shadow-button hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] font-semibold py-2 rounded-lg transition text-lg"
              disabled={loading}
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
            <div className="text-center">
              <a href="/login" className="text-primary hover:underline text-sm font-medium">
                Retour à la connexion
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
