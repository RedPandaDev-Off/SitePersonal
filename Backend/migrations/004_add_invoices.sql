-- Table des factures avec numérotation séquentielle
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,  -- Format: F-2025-001
    quote_id INTEGER NOT NULL REFERENCES quotes(id),
    generated_at TIMESTAMP DEFAULT NOW(),
    generated_by INTEGER REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON invoices(quote_id);

-- Séquence annuelle pour la numérotation (réinitialisée manuellement chaque année si besoin)
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;
