import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "cookie_consent";

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: 0,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) {
      const parsed = JSON.parse(savedConsent) as CookieConsent;
      // Vérifier si le consentement a plus de 13 mois (RGPD)
      const thirteenMonths = 13 * 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > thirteenMonths) {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    const consentWithTimestamp = { ...newConsent, timestamp: Date.now() };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentWithTimestamp));
    setShowBanner(false);
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    });
  };

  const rejectAll = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
  };

  const savePreferences = () => {
    saveConsent(consent);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="container mx-auto p-4 md:p-6">
        {!showDetails ? (
          // Vue simple
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Nous utilisons des cookies
              </h3>
              <p className="text-sm text-muted-foreground">
                Ce site utilise des cookies pour améliorer votre expérience.
                Consultez notre{" "}
                <Link to="/confidentialite" className="text-primary hover:underline">
                  politique de confidentialité
                </Link>{" "}
                pour en savoir plus.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition"
              >
                personalize
              </button>
              <button
                onClick={rejectAll}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition"
              >
                refuse everything
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // Vue détaillée
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">
                Cookie settings
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Cookies essentiels */}
              <div className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Cookies essentiels</h4>
                  <p className="text-sm text-muted-foreground">
                    Nécessaires au fonctionnement du site (authentification, sécurité).
                    Ces cookies ne peuvent pas être désactivés.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1 h-5 w-5"
                />
              </div>

              {/* Cookies analytics */}
              <div className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Cookies de performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                  className="mt-1 h-5 w-5 accent-primary cursor-pointer"
                />
              </div>

              {/* Cookies marketing */}
              <div className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Cookies marketing</h4>
                  <p className="text-sm text-muted-foreground">
                    Utilisés pour vous proposer des publicités pertinentes.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
                  className="mt-1 h-5 w-5 accent-primary cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={rejectAll}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition"
              >
                Refuser tout
              </button>
              <button
                onClick={savePreferences}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                Enregistrer mes préférences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;
