# Dashboard Crypto

Projet Epitech (1ère année) : un dashboard perso où ajouter des widgets pour suivre des cryptos et le sentiment du marché en temps réel.

## Ça fait quoi

- Créer un compte et se connecter
- Ajouter des widgets sur le dashboard (prix d'une crypto, stats, historique, top cryptos, indice Fear & Greed...)
- Déplacer, redimensionner, reconfigurer ou supprimer les widgets
- Chaque widget se rafraîchit automatiquement selon un intervalle choisi
- Un rôle admin permet de voir la liste des users et de changer leurs rôles

## Services et widgets

**CoinGecko** (pas besoin de compte) :
- `coin_price` : prix + variation 24h (params: `coin_id`, `currency`)
- `coin_stats` : market cap, volume, supply, rank (params: `coin_id`, `currency`)
- `coin_history` : historique sur 7 jours (params: `coin_id`, `currency`)
- `top_coins` : classement des plus grosses cryptos (params: `currency`, `limit`)

**Fear & Greed Index** (pas besoin de compte) :
- `fear_greed` : indice actuel + moyenne (params: `days`)
- `fear_greed_history` : historique de l'indice (params: `days`)

## Stack utilisée

- **Backend** : Node.js + Express, PostgreSQL, JWT pour l'auth
- **Frontend** : React (Vite) + Tailwind, `react-grid-layout` pour le drag & drop des widgets
- **Docker Compose** : pour lancer tout en une commande (frontend / backend / db)

Choix fait sur la base de l'écosystème déjà maîtrisé, suffisant pour le périmètre du projet sans sur-complexifier.

## Lancer le projet

Prérequis : Docker et Docker Compose installés.

```bash
git clone <url-du-repo>
cd <repo>
cp .env.example .env
# Remplir les valeurs dans .env (mot de passe postgres, JWT_SECRET...)

docker-compose build
docker-compose up
```

- Frontend : http://localhost:3000
- Backend : http://localhost:8080

Lancer sans Docker (en dev) :

```bash
# backend
cd backend
npm install
npm run dev

# frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

## Devenir admin

Pas de bouton pour ça dans l'app (exprès, pour la sécurité). Lancer un script après avoir créé un compte normalement sur le site :

```bash
docker-compose exec backend node scripts/make-admin.js email@exemple.com
```

Se déconnecter puis se reconnecter sur le site pour voir apparaître le bouton "Admin" dans la navbar.

## Endpoint /about.json

Demandé par le sujet, disponible sur `http://localhost:8080/about.json`. Renvoie l'IP du client, l'heure serveur, et la liste des services/widgets disponibles avec leurs params.

## Tests

```bash
cd backend
npm test
```

Tests présents sur les routes principales de l'API et sur les fonctions qui normalisent les données récupérées depuis CoinGecko.

## Structure du repo

```
.
├── backend/          # API Express
│   ├── scripts/       # script make-admin.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/   # CoinGecko + Fear & Greed
│   └── tests/
├── frontend/          # React (Vite)
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── db/
│   └── schema.sql
├── docker-compose.yml
└── .env.example
```