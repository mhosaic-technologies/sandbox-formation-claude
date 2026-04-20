# Guide projet — API Sandbox Formation

## Stack
- TypeScript 5.x, Node.js 20+
- Express 5.x
- Vitest pour les tests
- npm comme package manager

## Conventions
- Indentation 2 espaces
- camelCase pour variables/fonctions, PascalCase pour types/interfaces
- Imports relatifs avec ../
- Pas de any, utiliser unknown si necessaire
- Tests dans tests/ avec le suffixe .test.ts

## Commandes
- npm test — Lancer tous les tests (vitest run)
- npm run build — Compilation TypeScript
- npm run dev — Serveur de dev (ts-node)

## Regles critiques
**Important** : Tous les tests doivent passer avant toute modification
**Important** : Ne pas modifier les interfaces dans types.ts sans verifier l'impact
