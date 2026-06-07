-- Création de la table users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'client',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Création de la table quotes
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    client INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    service_type VARCHAR(100),
    budget_range VARCHAR(100),
    timeline VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    deposit_amount DECIMAL(10, 2) DEFAULT 0,
    admin_notes TEXT,
    quoted_amount DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    hours_worked DECIMAL(10, 2) DEFAULT 0,
    expenses DECIMAL(10, 2) DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    project_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- Colonnes Stripe
    stripe_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    stripe_payment_link TEXT,
    paid_at TIMESTAMP
);

-- Création de la table projects (optionnel)
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_payment_status ON quotes(payment_status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);

-- Créer un utilisateur admin par défaut (mot de passe: admin123)
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@admin.com', '$2b$10$LE1lwrN38wPF2gHdxJKkW.pboDlj0hTVdW/vBf5Jp8xqN6vzbJ3Eu', 'admin')
INSERT INTO users (name, email, password, role)
VALUES ('Client', 'test.client@test.com', '$2b$10$LE1lwrN38wPF2gHdxJKkW.pboDlj0hTVdW/vBf5Jp8xqN6vzbJ3Eu', 'client')
ON CONFLICT (email) DO NOTHING;
