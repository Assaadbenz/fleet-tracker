# 🚛 Fleet & Predictive Maintenance Tracker (Multi-Tenant SaaS)

Une plateforme SaaS B2B complète et prête pour la production dédiée à la gestion de flotte de poids lourds, au suivi télémétrique en temps réel, à la consommation de carburant et à la maintenance prédictive automatisée.

![Plateforme de Gestion de Flotte](https://img.shields.io/badge/Next.js-16_App_Router-black?style=for-the-badge&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)
![Redis & BullMQ](https://img.shields.io/badge/Redis_7-BullMQ-DC382D?style=for-the-badge&logo=redis)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?style=for-the-badge&logo=docker)
![CI/CD](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=githubactions)

---

## 🌟 Fonctionnalités Clés

1. **Isolation Multi-Locataires Stricte (`tenant_id`)**
   - Schéma relationnel PostgreSQL avec contraintes d'unicité composites (`[tenantId, vin]`, `[tenantId, plateNumber]`).
   - Injection sécurisée du contexte locataire via JWT cryptographique signé HMAC-SHA256 (`JwtAuthGuard`, `@CurrentTenant()`).

2. **Moteur de Maintenance Prédictive & BullMQ**
   - **Détection par relevé compteur** : Transaction atomique comparant le kilométrage actuel au seuil `nextDueMileage`. Bascule automatique du statut en `MAINTENANCE` et génération d'un bon d'intervention (`WorkOrder`).
   - **Détection par scan temporel** : Planificateur de tâches BullMQ scannant les échéances calendaires dépassées.
   - **Clôture de travaux** : La finalisation d'un bon d'intervention avance l'intervalle kilométrique et rétablit le camion en statut `ACTIF`.

3. **Suivi Télémétrique & Ravitaillement Carburant**
   - Enregistrement des pleins de carburant (volume en litres, montant en MAD, compteur odométrique, station Afriquia/Total/Shell/Winxo).
   - Calcul automatisé de la consommation moyenne en **L / 100 km** et du coût de revient global en **MAD / km**.
   - Synchronisation automatique des odomètres de flotte à chaque plein.

4. **Fiche d'Inspection Sécurité Avant-Départ (Driver Pre-Trip Checklist)**
   - Formulaire de vérification réglementaire avant le départ des camions : freinage pneumatique, usure et serrage des roues, éclairage et feux de gabarit, niveaux de fluides (AdBlue, huile moteur), trousse d'urgence.
   - Détection des défaillances critiques et immobilisation préventive en cas de non-conformité.

5. **Format d'Immatriculation Marocain**
   - Validation stricte par Regex : `^\d{1,5}-[A-Z\u0600-\u06FF]-\d{1,2}$` (ex. `99999-A-20`, `10482-A-26`).

6. **Moteur d'Exportation & Rapports (CSV / JSON)**
   - Export en 1 clic des listes de véhicules, des bons d'intervention, des rapports télémétriques et de l'annuaire chauffeurs.

7. **Observabilité & Health Checks**
   - Route de sonde d'état `/api/v1/health` vérifiant la connectivité PostgreSQL, la mémoire Node.js et l'uptime.
   - Intercepteur de journalisation des requêtes HTTP avec mesure de latence en millisecondes et suivi locataire.
   - Filtre d'exception global conforme RFC 7807.

8. **Contrôle d'Accès Basé sur les Rôles (RBAC)**
   - 👑 **ADMIN (Directeur de Flotte)** : Droits complets (flotte, maintenance, conducteurs, exports).
   - 🚛 **DRIVER (Chauffeur)** : Accès dédié au relevé kilométrique, ravitaillement carburant et fiches d'inspection.

---

## 🏗️ Architecture du Projet

```text
├── ci/workflows/ci.yml            # Pipeline CI/CD automatisée (build & tests)
├── backend/                       # API REST NestJS (TypeScript Strict)
│   ├── Dockerfile                 # Conteneurisation multi-stage de production
│   ├── prisma/
│   │   ├── schema.prisma          # Schéma multi-tenant Prisma (Vehicles, Fuel, WorkOrders...)
│   │   └── seed.ts                # Jeu de données d'amorce
│   ├── src/
│   │   ├── app.module.ts          # Module racine & configuration BullMQ
│   │   ├── common/                # Filtres d'exceptions, Intercepteurs de logs, Guards JWT
│   │   ├── modules/
│   │   │   ├── auth/              # JWT, Stratégies Passport, RBAC
│   │   │   ├── health/            # Sonde de santé et métriques système
│   │   │   ├── vehicle/           # CRUD Flotte, validation matricules marocains & export CSV
│   │   │   ├── maintenance/       # Moteur BullMQ, révisions kilométriques & WorkOrders
│   │   │   ├── fuel/              # Ravitaillement carburant & télémétrie L/100km
│   │   │   ├── analytics/         # Moteur de calcul des KPI et ventilation des coûts
│   │   │   └── tenant/            # Scoping locataires
│   │   └── main.ts
│   └── package.json
│
├── frontend/                      # Interface Web Next.js 16 (App Router + Tailwind)
│   ├── Dockerfile                 # Conteneurisation Next.js multi-stage
│   ├── src/
│   │   ├── app/                   # Server Actions & Pages
│   │   ├── components/
│   │   │   ├── dashboard/         # Shell de navigation 4 onglets
│   │   │   ├── vehicles/          # Tableau de flotte, Relevé km, Plein carburant
│   │   │   ├── fuel/              # Modal d'enregistrement carburant
│   │   │   ├── inspections/       # Fiche de contrôle sécurité avant-départ
│   │   │   ├── work-orders/       # Bons de travaux & export CSV
│   │   │   ├── analytics/         # Graphiques interactifs de coûts & carburant
│   │   │   └── drivers/           # Annuaire des conducteurs & statut opérationnel
│   │   └── types/                 # Typages TypeScript stricts
│   └── package.json
│
├── docker-compose.yml             # PostgreSQL 16 + Redis 7 + Backend + Frontend
└── .env.example                   # Configuration d'environnement unifiée
```

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- [Node.js](https://nodejs.org/) v18+ ou v20+
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)

### 2. Cloner le Dépôt
```bash
git clone https://github.com/Assaadbenz/fleet-tracker.git
cd fleet-tracker
```

### 3. Lancer l'Infrastructure (Base de Données & Redis)
```bash
docker compose up -d postgres redis
```

*Pour lancer la pile complète conteneurisée (y compris backend et frontend) :*
```bash
docker compose --profile full up -d --build
```

### 4. Démarrer le Backend NestJS
```bash
cd backend
cp ../.env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npx ts-node prisma/seed.ts
npm run start:dev
```
L'API démarre sur `http://localhost:4000/api/v1`.
Vérification de santé : `http://localhost:4000/api/v1/health`.

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

| Identifiant | Mot de passe | Rôle | Privilèges |
| :--- | :--- | :--- | :--- |
| `admin@apexlogistics.com` | `FleetAdmin2026!` | **ADMIN** | Direction de flotte, planification, exports, gestion d'équipe |
| `driver@apexlogistics.com` | `FleetAdmin2026!` | **DRIVER** | Relevé kilométrique, contrôle départ, ravitaillement carburant |

---

## 🧪 Tests & Qualité de Code

```bash
# Lancer les tests unitaires et de validation des matricules
cd backend
npx jest --testMatch="**/*.spec.ts"
```

---

## 📄 Licence
Ce projet est sous licence MIT.
