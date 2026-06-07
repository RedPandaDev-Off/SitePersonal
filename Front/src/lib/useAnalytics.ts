import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Pages à exclure du tracking (admin, auth)
const EXCLUDED_PATHS = ["/admin", "/login", "/register"];

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (EXCLUDED_PATHS.some((excluded) => path.startsWith(excluded))) return;

    fetch(`${API_URL}/api/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        referrer: document.referrer || null,
      }),
    }).catch(() => {});
  }, [location.pathname]);
};
