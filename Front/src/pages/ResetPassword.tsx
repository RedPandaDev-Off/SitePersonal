import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const token = new URLSearchParams(window.location.search).get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!token) {
      setError("Lien invalide ou expiré.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch {
      setError("Erreur réseau ou serveur.");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md p-8 rounded-2xl bg-gradient-card border border-border/50 shadow-lg text-center">
          <h2 className="font-heading text-2xl font-bold mb-4 text-gradient">Lien invalide</h2>
          <p className="text-muted-foreground mb-6">Ce lien de réinitialisation est invalide ou a expiré.</p>
          <a href="/forgot-password" className="text-primary hover:underline text-sm font-medium">
            Demander un nouveau lien
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-2xl bg-gradient-card border border-border/50 shadow-lg">
        <h2 className="font-heading text-2xl font-bold mb-2 text-gradient text-center">
          Nouveau mot de passe
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>

        {success ? (
          <div className="text-center space-y-4">
            <div className="text-green-500 font-medium">
              Mot de passe réinitialisé avec succès !
            </div>
            <a href="/login" className="text-primary hover:underline text-sm font-medium block">
              Se connecter
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm text-muted-foreground font-medium" htmlFor="password">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                type="password"
                className="w-full border border-border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:border-primary text-black bg-muted/30"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Au moins 8 caractères"
                minLength={8}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-muted-foreground font-medium" htmlFor="confirm">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm"
                type="password"
                className="w-full border border-border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:border-primary text-black bg-muted/30"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Répétez le mot de passe"
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground shadow-button hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] font-semibold py-2 rounded-lg transition text-lg"
              disabled={loading}
            >
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
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

export default ResetPassword;
