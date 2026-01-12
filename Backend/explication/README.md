# Connexion à la base de données dans le Backend

Voici comment vous pouvez connecter votre backend Node.js à une base de données PostgreSQL avec le module `pg` :

## 1. Installer les dépendances

Dans le dossier `Backend`, exécutez :

```bash
npm install pg
```

## 2. Créer un fichier de connexion

Créez un fichier `db.js` dans le dossier `Backend` :

```js
// Backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'votre_utilisateur',
  host: 'localhost',
  database: 'nom_de_votre_db',
  password: 'votre_mot_de_passe',
  port: 5432, // port par défaut de PostgreSQL
});

pool.connect()
  .then(() => console.log('Connexion à PostgreSQL réussie'))
  .catch((err) => {
    console.error('Erreur de connexion à PostgreSQL :', err);
    process.exit(1);
  });

module.exports = pool;
```

## 3. Utiliser la connexion dans `server.js`

Dans votre fichier `server.js`, importez le pool pour effectuer des requêtes :

```js
const pool = require('./db');

// Exemple de requête
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erreur lors de la requête :', err);
  } else {
    console.log('Heure actuelle depuis PostgreSQL :', res.rows[0]);
  }
});
```

## 4. Aller plus loin

Pour des requêtes plus avancées ou l'utilisation d'un ORM, vous pouvez utiliser des outils comme `sequelize` ou `prisma`.

N'hésitez pas à demander un exemple plus avancé !
