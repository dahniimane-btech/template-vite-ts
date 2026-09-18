# Español a diario — apprends l'espagnol par cartes

Application web légère (Vite + TypeScript, sans dépendance externe côté UI)
pour apprendre l'espagnol niveau B1+ de manière intuitive, à raison de
quelques minutes par jour.

## Principe

- Chaque jour, l'application ajoute automatiquement **20 nouvelles phrases**
  (niveau B1+) à apprendre, piochées dans la banque de phrases.
- Elle te propose aussi jusqu'à **10 phrases à réviser**, sélectionnées selon
  un algorithme de répétition espacée façon Leitner (les phrases que tu
  maîtrises reviennent de moins en moins souvent).
- Chaque carte est présentée dans un **ordre aléatoire**.
- Une carte commence en mode **reconnaissance** (espagnol devant, traduction
  française derrière). Une fois qu'elle est bien maîtrisée, elle **s'inverse**
  automatiquement : le français apparaît devant, et c'est à toi de produire la
  phrase en espagnol avant de retourner la carte.
- Après avoir vu la traduction, tu t'auto-évalues avec 4 boutons (raccourcis
  clavier `1`-`4`) : **Encore**, **Difficile**, **Bien**, **Facile**. Cela
  détermine quand la carte reviendra.

## Requirements

[Node.js](https://nodejs.org) est nécessaire pour installer les dépendances et
lancer les scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Installe les dépendances du projet |
| `npm run dev` | Lance un serveur de développement (hot-reload) |
| `npm run build` | Crée un build de production dans le dossier `dist` |
| `npm run dev-nolog` / `npm run build-nolog` | Idem sans télémétrie (voir "About log.js" plus bas) |

Le serveur de développement tourne par défaut sur `http://localhost:8080`.

## Structure du projet

| Path                          | Description                                                        |
|--------------------------------|----------------------------------------------------------------------|
| `index.html`                   | Page HTML principale.                                                 |
| `public/style.css`             | Styles globaux (cartes, boutons, layout).                             |
| `src/main.ts`                  | Point d'entrée : démarre l'application.                                |
| `src/app/types.ts`             | Types partagés (carte, phrase, état, réglages).                       |
| `src/app/phrases.ts`           | **Banque de phrases ES/FR** — ajoute-en librement ici.                |
| `src/app/date.ts`              | Utilitaires de dates (ISO, ajout de jours).                            |
| `src/app/storage.ts`           | Sauvegarde/chargement de l'état dans `localStorage`.                   |
| `src/app/srs.ts`               | Génération quotidienne des nouvelles cartes + algorithme de répétition espacée. |
| `src/app/App.ts`               | Interface (accueil, séance de révision, résumé, réglages).            |

## Ajouter du contenu

Pour ajouter de nouvelles phrases, complète le tableau `PHRASES` dans
`src/app/phrases.ts` (identifiant unique, phrase espagnole, traduction
française, thème). Elles seront automatiquement intégrées à la génération
quotidienne dès qu'il n'y a plus assez de phrases inédites.

## Réglages

Le nombre de nouvelles phrases par jour (20 par défaut) et de révisions par
jour (10 par défaut) est réglable directement dans l'application (icône ⚙️),
et persiste dans le `localStorage` du navigateur, comme toute la progression.

## About log.js

Ce template dérive du [Phaser Vite TypeScript template](https://github.com/phaserjs/template-vite-ts).
Le fichier `log.js` envoie un unique appel anonyme à `gryzor.co` (Phaser
Studio) pour des statistiques d'usage du template ; utilise les variantes
`*-nolog` ci-dessus, ou supprime `log.js`, si tu préfères l'éviter.
