    ## Associations / Relations entre les tables

    - **Un `quote` (devis) peut avoir plusieurs `payments`** :
        - Relation 1-n (un devis, plusieurs paiements possibles : acompte, solde, etc.)
        - Champ `quote_id` dans la table `payments` fait référence à `quotes.id`


    - **Un `user` (admin) peut créer plusieurs `quotes`** (si gestion multi-admin) :
        - Champ `created_by` dans `quotes` qui référence `users.id` (optionnel).

    ---


    ## Table/Collection : `projects` (projets réalisés)
    | Champ         | Type      | Description                                 |
    |-------------- |---------- |---------------------------------------------|
    | id            | string    | Identifiant unique du projet, PRIMARY KEY, NOT NULL |
    | quote_id      | string    | Référence au devis accepté, FOREIGN KEY, NOT NULL   |
    | name          | string    | Nom du projet, NOT NULL                     |
    | description   | text      | Description du projet, NOT NULL             |
    | status        | string    | Statut du projet (in_progress, completed...), NOT NULL |
    | started_at    | datetime  | Date de début du projet, NOT NULL           |
    | finished_at   | datetime  | Date de fin du projet (optionnel)           |
    | created_at    | datetime  | Date de création, NOT NULL, DEFAULT NOW()   |

    ---

    **Exemple de schéma relationnel simplifié :**

    ```
    users (1) ────< (n) quotes (1) ────< (n) payments
                        │
                        └────< (0,n) projects
    ```

    **Remarques :**
    - Les associations se font via des clés étrangères (`quote_id`, `user_id`, etc.).
    - En NoSQL, on stocke souvent l’ID de la ressource liée dans chaque document.
    - En SQL, on utilise des FOREIGN KEY.
    #
    # Table/Collection : `payments` (paiements)
    | Champ         | Type      | Description                                 |
    |-------------- |---------- |---------------------------------------------|
    | id            | string    | Identifiant unique du paiement, PRIMARY KEY, NOT NULL |
    | quote_id      | string    | Référence au devis concerné, FOREIGN KEY, NOT NULL   |
    | amount        | number    | Montant payé (en centimes/euros), NOT NULL          |
    | status        | string    | Statut du paiement (pending, paid, failed), NOT NULL, DEFAULT 'pending' |
    | method        | string    | Méthode de paiement (carte, virement, etc.), NOT NULL |
    | created_at    | datetime  | Date de création du paiement, NOT NULL, DEFAULT NOW() |
    | paid_at       | datetime  | Date effective du paiement (optionnel)              |
    | transaction_id| string    | ID transaction du prestataire de paiement, UNIQUE   |

    # Exemple de structure de base de données pour ce projet

    Voici à quoi pourrait ressembler la base de données (NoSQL ou SQL) pour gérer les fonctionnalités principales du site :

    ## Table/Collection : `quotes` (demandes de devis)
    | Champ            | Type         | Description                                      |
    |------------------|--------------|--------------------------------------------------|
    | id               | string/uuid  | Identifiant unique, PRIMARY KEY, NOT NULL        |
    | name             | string       | Nom du client, NOT NULL                          |
    | email            | string       | Email du client, NOT NULL                        |
    | service_type     | string       | Type de service demandé, NOT NULL                |
    | budget_range     | string       | Fourchette de budget, NOT NULL                   |
    | timeline         | string       | Délai souhaité, NOT NULL                        |
    | description      | text         | Description du projet, NOT NULL                  |
    | status           | string       | Statut (pending, reviewed, quoted, ... etc.), NOT NULL, DEFAULT 'pending' |
    | payment_status   | string       | Statut du paiement (unpaid, pending, paid), NOT NULL, DEFAULT 'unpaid' |
    | deposit_amount   | number       | Montant de l'acompte (en centimes/euros)         |
    | quoted_amount    | number       | Montant total proposé (en centimes/euros)        |
    | admin_notes      | text         | Notes internes admin                             |
    | created_at       | datetime     | Date de création, NOT NULL, DEFAULT NOW()        |
    | hours_worked     | number       | Heures travaillées (optionnel), DEFAULT 0        |
    | expenses         | number       | Dépenses liées au projet (optionnel), DEFAULT 0  |

    ## Table/Collection : `projects` (projets réalisés)
    | Champ         | Type      | Description                                 |
    |-------------- |---------- |---------------------------------------------|
    | id            | string    | Identifiant unique du projet, PRIMARY KEY, NOT NULL |
    | quote_id      | string    | Référence au devis accepté, FOREIGN KEY, NOT NULL   |
    | name          | string    | Nom du projet, NOT NULL                     |
    | description   | text      | Description du projet, NOT NULL             |
    | status        | string    | Statut du projet (in_progress, completed...), NOT NULL |
    | started_at    | datetime  | Date de début du projet, NOT NULL           |
    | finished_at   | datetime  | Date de fin du projet (optionnel)           |
    | created_at    | datetime  | Date de création, NOT NULL, DEFAULT NOW()   |


    ## Table/Collection : `users` (si besoin d’auth plus tard)
    | Champ      | Type    | Description                        |
    |------------|---------|------------------------------------|
    | id         | string  | Identifiant unique, PRIMARY KEY, NOT NULL |
    | email      | string  | Email, NOT NULL, UNIQUE                  |
    | password   | string  | Hash du mot de passe, NOT NULL          |
    | role       | string  | admin, user, etc., NOT NULL, DEFAULT 'admin' |
    | created_at | datetime| Date d’inscription, NOT NULL, DEFAULT NOW() |

    ---

    **Remarques :**
    - Les champs optionnels peuvent être ajoutés selon les besoins business.
    - Pour une base NoSQL (ex: Firestore), chaque document aurait ces propriétés.
    - Pour une base SQL, chaque table aurait ces colonnes.
    - Les montants sont souvent stockés en centimes pour éviter les erreurs d’arrondi.
    - Les statuts sont des chaînes (string) pour la flexibilité.

    N’hésite pas à adapter selon tes besoins spécifiques !

-- Extension UUID si pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Utilisateurs (admin – multi-admin prêt)
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(50)  NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Devis / Demandes clients
CREATE TABLE quotes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255) NOT NULL,
  email            VARCHAR(255) NOT NULL,
  service_type     VARCHAR(100) NOT NULL,
  budget_range     VARCHAR(50),
  timeline         VARCHAR(50),
  description      TEXT NOT NULL,
  
  status           VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status   VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  
  -- Montants en centimes (best practice)
  deposit_amount   INTEGER CHECK (deposit_amount >= 0),
  quoted_amount    INTEGER CHECK (quoted_amount >= 0),
  total_amount     INTEGER CHECK (total_amount >= 0),
  
  admin_notes      TEXT,
  hours_worked     INTEGER DEFAULT 0 CHECK (hours_worked >= 0),
  expenses         INTEGER DEFAULT 0 CHECK (expenses >= 0),
  
  created_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  
  project_id       UUID UNIQUE, -- ← 1 devis = max 1 projet
  
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Paiements (acompte + solde + remboursements)
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id            UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  amount              BIGINT NOT NULL CHECK (amount >= 0),     -- en centimes
  currency            VARCHAR(3) NOT NULL DEFAULT 'EUR',
  status              VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
  method              VARCHAR(50),
  transaction_id      VARCHAR(255) UNIQUE,
  stripe_intent_id    VARCHAR(255),
  
  paid_at             TIMESTAMPTZ,
  
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Projets (créés uniquement quand le devis est accepté)
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id      UUID NOT NULL UNIQUE REFERENCES quotes(id) ON DELETE CASCADE,
  
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) UNIQUE,
  description   TEXT,
  status        VARCHAR(50) NOT NULL DEFAULT 'in_progress',
  
  started_at    TIMESTAMPTZ,
  finished_at   TIMESTAMPTZ,
  
  -- Pour portfolio automatique futur
  is_public     BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  live_url      TEXT,
  github_url    TEXT,
  
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEX (vitesse ++ sur le dashboard)
-- =============================================
CREATE INDEX idx_quotes_status         ON quotes(status);
CREATE INDEX idx_quotes_payment_status ON quotes(payment_status);
CREATE INDEX idx_quotes_email          ON quotes(email);
CREATE INDEX idx_quotes_created_at     ON quotes(created_at DESC);
CREATE INDEX idx_payments_quote_id     ON payments(quote_id);
CREATE INDEX idx_payments_status       ON payments(status);
CREATE INDEX idx_payments_transaction  ON payments(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX idx_projects_status       ON projects(status);

-- =============================================
-- TRIGGER : updated_at automatique
-- =============================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application du trigger sur toutes les tables modifiables
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();