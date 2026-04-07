# Sandbox — Formation Claude Code

> API Express TypeScript avec **5 bugs intentionnels** pour apprendre a utiliser Claude Code en conditions reelles.

## Pourquoi ce projet ?

Ce sandbox est le terrain de pratique de la [Formation Claude Code](https://github.com/mhosaic-technologies). Il simule un projet reel — une API REST avec des routes, des services, des tests — mais contient des bugs volontairement introduits a differents niveaux de difficulte.

L'objectif n'est pas de corriger les bugs soi-meme, mais d'apprendre a **collaborer avec Claude Code** pour les diagnostiquer, les comprendre et les corriger de maniere methodique.

## Dans quel cadre est-il utilise ?

Le sandbox accompagne les **12 modules** de la formation :

| Modules | Ce qu'on fait avec le sandbox |
|---------|-------------------------------|
| **M01** Architecture & Prise en main | Explorer le projet, observer les outils de Claude |
| **M02** CLAUDE.md | Creer un CLAUDE.md pour le sandbox |
| **M03** Skills & Commandes | Creer des Skills (/review, /write-tests, /explain) |
| **M04** Debogage | Corriger les 5 bugs avec Claude Code |
| **M05** Refactoring | Decouper la fonction monstre `generateReport()` |
| **M06** Planification | Ajouter une feature d'export CSV |
| **M07-M12** | Revue de code, hooks, agents, MCP, CI/CD, masterclass |

## Les 5 bugs intentionnels

| # | Type | Difficulte | Fichier | Description |
|---|------|------------|---------|-------------|
| 1 | Off-by-one | ★☆☆☆☆ | `src/utils/pagination.ts` | Le calcul de `startIndex` decale les resultats d'un element |
| 2 | Null pointer | ★★☆☆☆ | `src/services/user-service.ts` | `getUserProfile()` crash sur un utilisateur inexistant |
| 3 | Race condition | ★★★☆☆ | `src/services/order-service.ts` | Les commandes creees en parallele partagent le meme ID |
| 4 | Memory leak | ★★★★☆ | `src/services/analytics-service.ts` | `trackEvent()` ajoute un listener a chaque appel sans les supprimer |
| 5 | Silent regression | ★★★★★ | `src/services/analytics-service.ts` | Le seuil de remise utilise `>` au lieu de `>=` — aucune erreur visible |

En plus des bugs, le fichier `src/services/export-service.ts` contient une **fonction monstre** de ~200 lignes (`generateReport()`) utilisee pour l'exercice de refactoring du module 05.

## Installation

```bash
git clone git@github.com:mhosaic-technologies/sandbox-formation-claude.git sandbox
cd sandbox
npm install
```

## Commandes

```bash
# Lancer les tests (9 echouent = les 5 bugs)
npm test

# Lancer les tests en mode watch
npm run test:watch

# Demarrer le serveur de dev
npm run dev

# Compiler le TypeScript
npm run build
```

## Structure du projet

```
sandbox/
  src/
    app.ts                         # Configuration Express + routes
    server.ts                      # Point d'entree (port 3001)
    types.ts                       # Interfaces TypeScript
    routes/
      products.ts                  # GET /api/products
      users.ts                     # GET /api/users
      orders.ts                    # POST /api/orders
      reports.ts                   # GET /api/reports
    services/
      product-service.ts           # Catalogue de produits
      user-service.ts              # Gestion utilisateurs (bug #2)
      order-service.ts             # Commandes (bug #3)
      analytics-service.ts         # Analytics (bugs #4, #5)
      export-service.ts            # Fonction monstre ~200 lignes
    utils/
      pagination.ts                # Pagination generique (bug #1)
  tests/
    pagination.test.ts             # Tests pagination
    user-service.test.ts           # Tests utilisateurs
    order-service.test.ts          # Tests commandes
    analytics-service.test.ts      # Tests analytics
    export-service.test.ts         # 20+ tests pour le refactoring
```

## Stack technique

- **Runtime** : Node.js
- **Langage** : TypeScript (strict mode)
- **Framework** : Express 5
- **Tests** : Vitest
- **HTTP Testing** : Supertest

## Reinitialiser le sandbox

Si vous avez modifie des fichiers et voulez repartir de zero :

```bash
# Annuler toutes les modifications
git checkout . && git clean -fd

# Reinstaller les dependances si necessaire
npm install
```

## Branches

| Branche | Etat | Pour quel module |
|---------|------|------------------|
| `main` | 5 bugs intentionnels, fonction monstre intacte | M01 a M04 |
| `post-debug` | Bugs corriges, fonction monstre intacte | M05 (refactoring) |
| `post-refactor` | Bugs corriges, fonction monstre decoupee | M06+ |

> Les branches `post-debug` et `post-refactor` seront creees prochainement.

## Licence

Ce projet est destine exclusivement a un usage pedagogique dans le cadre de la Formation Claude Code par [Mhosaic Technologies](https://github.com/mhosaic-technologies).
