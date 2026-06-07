-- Ajouter les colonnes pour gérer le paiement du solde

-- Statut du paiement de l'acompte (deposit) et du solde (balance)
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS balance_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS balance_paid_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS stripe_balance_payment_link TEXT;

-- Commentaires pour la documentation
COMMENT ON COLUMN quotes.deposit_paid IS 'Indique si l''acompte (30%) a été payé';
COMMENT ON COLUMN quotes.deposit_paid_at IS 'Date et heure du paiement de l''acompte';
COMMENT ON COLUMN quotes.balance_amount IS 'Montant du solde restant (70%)';
COMMENT ON COLUMN quotes.balance_paid IS 'Indique si le solde (70%) a été payé';
COMMENT ON COLUMN quotes.balance_paid_at IS 'Date et heure du paiement du solde';
COMMENT ON COLUMN quotes.stripe_balance_payment_link IS 'URL du Payment Link Stripe pour le solde';
