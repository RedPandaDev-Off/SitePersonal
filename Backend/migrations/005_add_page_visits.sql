-- Migration 005: Table pour le suivi des visites de pages
CREATE TABLE IF NOT EXISTS page_visits (
  id SERIAL PRIMARY KEY,
  path VARCHAR(255) NOT NULL,
  visited_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  referrer TEXT,
  user_agent TEXT
);

-- Index pour accélérer les requêtes par date et chemin
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_path ON page_visits(path);