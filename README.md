# 🚛 Fleet & Predictive Maintenance Tracker (Multi-Tenant SaaS)

Une plateforme SaaS B2B complète et prête pour la production dédiée à la gestion de flotte de poids lourds, au suivi télémétrique en temps réel et à la maintenance prédictive automatisée.

![Plateforme de Gestion de Flotte](https://img.shields.io/badge/Next.js-14_App_Router-black?style=for-the-badge&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)
![Redis & BullMQ](https://img.shields.io/badge/Redis_7-BullMQ-DC382D?style=for-the-badge&logo=redis)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 🌟 Fonctionnalités Clés

1. **Isolation Multi-Locataires Stricte (`tenant_id`)**
   - Schéma relationnel PostgreSQL avec contraintes d'unicité composites (`[tenantId, vin]`, `[tenantId, plateNumber]`).
   - Injection sécurisée du contexte locataire via JWT cryptographique signé HMAC-SHA256 (`JwtAuthGuard`, `@CurrentTenant()`).

2. **Moteur de Maintenance Prédictive & BullMQ**
   - **Détection par relevé compteur** : Transaction atomique comparant le kilométrage actuel au seuil `nextDueMileage`. Bascule automatique du statut en `MAINTENANCE` et génération d'un bon d'intervention (`WorkOrder`).
   - **Détection par scan temporel** : Planificateur de tâches BullMQ (`0 0 * * *`) scannant les échéances calendaires dépassées.
   - **Clôture de travaux** : La finalisation d'un bon d'intervention avance l'intervalle kilométrique et rétablit le camion en statut `ACTIF`.

3. **Format d'Immatriculation Marocain**
   - Validation stricte par Regex : `^\d{1,5}-[A-Z\u0600-\u06FF]-\d{1,2}$` (ex. `99999-A-20`, `10482-A-26`).

4. **Contrôle d'Accès Basé sur les Rôles (RBAC)**
   - 👑 **ADMIN (Directeur de Flotte)** : Droits d'écriture complets (création/suppression de véhicules, planification d'interventions, gestion des chauffeurs, export CSV).
   - 🚛 **DRIVER (Chauffeur)** : Mode restreint dédié au relevé kilométrique et à la consultation technique.

---

## 🏗️ Architecture du Projet

```text
├── backend/                       # API REST NestJS (TypeScript Strict)
│   ├── prisma/
│   │   ├── schema.prisma          # Schéma multi-tenant Prisma
│   │   └── seed.ts                # Jeu de données d'amorce
│   ├── src/
│   │   ├── auth/                  # JWT, Stratégies, Guards, Décorateurs RBAC
│   │   ├── tenants/               # Scoping et gestion des locataires
│   │   ├── vehicles/              # CRUD Flotte et compteurs
│   │   ├── maintenance/           # Processeur BullMQ et calculs d'échéances
│   │   └── notifications/         # Alerting automatique
│   └── package.json
│
├── frontend/                      # Interface Web Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/                   # Pages et Server Actions
│   │   ├── components/
│   │   │   ├── auth/              # Barre de session, Modal JWT & Login
│   │   │   ├── dashboard/         # Shell de navigation 4 onglets
│   │   │   ├── vehicles/          # Tableau de flotte, Relevé km, Fiches
│   │   │   ├── work-orders/       # Bons d'intervention
│   │   │   ├── analytics/         # Télémétrie et graphiques de coûts
│   │   │   └── drivers/           # Annuaire des conducteurs et permis
│   │   └── lib/                   # Validation Zod, Contexte Auth
│   └── package.json
│
├── docker-compose.yml             # PostgreSQL 16 Alpine + Redis 7 Alpine
└── .env.example                   # Variables d'environnement
```

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)

### 2. Cloner le Dépôt
```bash
git clone https://github.com/Assaadbenz/fleet-tracker.git
cd fleet-tracker
```

### 3. Lancer la Base de Données & Redis
```bash
docker compose up -d
```

### 4. Démarrer le Backend NestJS
```bash
cd backend
cp ../.env.example .env
npm install
npx prisma migrate dev
npx ts-node prisma/seed.ts
npm run start:dev
```
L'API démarre sur `http://localhost:4000/api/v1`.

### 5. Démarrer le Frontend Next.js
Dans un nouveau terminal :
```bash
cd frontend
cp ../.env.example .env.local
npm install
npm run dev
```
Accédez au tableau de bord sur **`http://localhost:3000`**.

---

## 🔑 Comptes de Démonstration

| Identifiant | Mot de passe | Rôle |
| :--- | :--- | :--- |
| `admin@apexlogistics.com` | `FleetAdmin2026!` | **ADMIN** (Accès total) |
| `driver@apexlogistics.com` | `FleetAdmin2026!` | **DRIVER** (Relevé km & Télémétrie) |

---

## 📄 Licence
Ce projet est sous licence MIT.
