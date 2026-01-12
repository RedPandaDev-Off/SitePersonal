# SitePro Homemade

Projet React + Vite + Tailwind CSS

## Structure du projet

```
root/
│
├── public/                # Fichiers statiques (favicon, images, etc.)
├── src/                   # Code source principal
│   ├── App.tsx            # Composant racine de l'application
│   ├── main.tsx           # Point d'entrée React
│   ├── index.css          # Styles globaux (inclut Tailwind)
│   ├── App.css            # Styles spécifiques à App
│   ├── assets/            # Images, icônes, etc.
│   ├── components/        # Composants réutilisables
│   │   ├── ui/            # Composants UI génériques (boutons, inputs, etc.)
│   │   └── ...            # Autres composants (Navbar, Footer, etc.)
│   ├── lib/               # Fonctions utilitaires (ex: cn)
│   └── pages/             # Pages principales (Admin, Auth, etc.)
│
├── tailwind.config.ts     # Configuration Tailwind CSS
├── postcss.config.cjs     # Configuration PostCSS (CommonJS)
├── package.json           # Dépendances et scripts npm
├── vite.config.ts         # Configuration Vite
└── README.md              # Ce fichier
```

## Scripts utiles

- `npm run dev` : Démarre le serveur de développement
- `npm run build` : Build de production
- `npm run preview` : Prévisualisation du build
- `npm run lint` : Lint du code

## Points importants

- **Tailwind CSS** : Utilisé pour le style rapide et responsive. Les utilitaires sont dans `index.css` et la config dans `tailwind.config.ts`.
- **Composants UI** : Tous les composants réutilisables sont dans `src/components/ui/`.
- **Utilitaire `cn`** : Sert à fusionner les classes CSS conditionnelles (`src/lib/utils.ts`).
- **TypeScript** : Typage strict pour plus de robustesse.
- **PostCSS** : Configuré en CommonJS (`postcss.config.cjs`) pour compatibilité avec Vite et Tailwind v3.

## Conseils

- Pour ajouter un composant, place-le dans `src/components/` ou `src/components/ui/` si c'est un élément d'interface générique.
- Pour ajouter une page, crée un fichier dans `src/pages/`.
- Les couleurs, polices et variables CSS sont personnalisées dans `index.css` sous `@layer base`.

---

N'hésite pas à commenter ton code pour expliquer les parties complexes ou importantes !
