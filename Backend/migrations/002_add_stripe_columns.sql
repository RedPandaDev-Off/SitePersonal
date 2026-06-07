-- Ajouter les colonnes Stripe à la table quotes si elles n'existent pas déjà

-- Colonnes pour stocker les informations Stripe
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_quotes_stripe_session_id ON quotes(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_quotes_stripe_payment_intent_id ON quotes(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_quotes_payment_status ON quotes(payment_status);

-- Commentaires pour la documentation
COMMENT ON COLUMN quotes.stripe_session_id IS 'ID de la session Stripe Checkout';
COMMENT ON COLUMN quotes.stripe_payment_intent_id IS 'ID du Payment Intent Stripe';
COMMENT ON COLUMN quotes.stripe_payment_link IS 'URL du Payment Link permanent Stripe';
COMMENT ON COLUMN quotes.payment_status IS 'Statut de paiement: unpaid, pending, paid, failed';
COMMENT ON COLUMN quotes.paid_at IS 'Date et heure du paiement réussi';
