'use client';

import * as React from 'react';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Users,
} from 'lucide-react';
import { WorkOrdersView } from '@/components/work-orders/work-orders-view';
import { AnalyticsView } from '@/components/analytics/analytics-view';
import { DriversView } from '@/components/drivers/drivers-view';
import { useAuth } from '@/lib/auth-context';
import { LoginView } from '@/components/auth/login-view';

type DashboardTab = 'FLEET' | 'WORK_ORDERS' | 'ANALYTICS' | 'DRIVERS';

interface DashboardShellProps {
  vehicleTableSlot: React.ReactNode;
}

export function DashboardShell({ vehicleTableSlot }: DashboardShellProps) {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = React.useState<DashboardTab>('FLEET');

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="space-y-6">
      {/* Driver session notice */}
      {user?.role === 'DRIVER' && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
          <div className="flex items-center gap-2.5">
            <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Session Chauffeur ({user.email})</strong> — Accès opérationnel : relevé des compteurs et fiches techniques.
            </span>
          </div>
          <span className="text-[11px] text-emerald-400/80 font-medium">RBAC : DRIVER</span>
        </div>
      )}

      {/* Barre de navigation des modules - Exactement celle de votre capture */}
      <nav className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 overflow-x-auto shadow-xl">
        <button
          onClick={() => setActiveTab('FLEET')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'FLEET'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Flotte de Véhicules & Compteurs
        </button>

        <button
          onClick={() => setActiveTab('WORK_ORDERS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'WORK_ORDERS'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Bons d&apos;Intervention & Travaux
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'ANALYTICS'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Statistiques & Télémétrie
        </button>

        <button
          onClick={() => setActiveTab('DRIVERS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'DRIVERS'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Users className="h-4 w-4" />
          Gestion des Chauffeurs & Équipe
        </button>
      </nav>

      {/* Vue 1 : Flotte de Véhicules & Compteurs */}
      {activeTab === 'FLEET' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Cartes métriques KPI */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                <span>Flotte Totale</span>
                <Truck className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-zinc-100">4</span>
                <span className="text-xs text-zinc-500">unités commerciales</span>
              </div>
              <div className="mt-3 text-[11px] text-zinc-400">
                Réparties sur les lignes de fret régionales
              </div>
            </div>

            <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 backdrop-blur-xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-emerald-400/90 text-xs font-medium">
                <span>En Service Actif</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-emerald-400">2</span>
                <span className="text-xs text-emerald-400/70">50% opérationnels</span>
              </div>
              <div className="mt-3 text-[11px] text-zinc-400">
                Conditions de circulation optimales
              </div>
            </div>

            <div className="rounded-xl border border-amber-900/30 bg-amber-950/10 backdrop-blur-xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-amber-400/90 text-xs font-medium">
                <span>Entretien Imminent</span>
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-amber-400">1</span>
                <span className="text-xs text-amber-400/70">&lt; 1 000 km / 14 jours</span>
              </div>
              <div className="mt-3 text-[11px] text-zinc-400">
                Planifier le passage en atelier préventif
              </div>
            </div>

            <div className="rounded-xl border border-rose-900/30 bg-rose-950/10 backdrop-blur-xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-rose-400/90 text-xs font-medium">
                <span>En Maintenance</span>
                <Wrench className="h-4 w-4 text-rose-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-rose-400">1</span>
                <span className="text-xs text-rose-400/70">Bon d&apos;intervention en cours</span>
              </div>
              <div className="mt-3 text-[11px] text-zinc-400">
                Véhicule consigné / non assignable
              </div>
            </div>
          </section>

          {/* Registre de Flotte */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Registre de la Flotte Assignée
              </h2>
              <p className="text-xs text-zinc-400">
                Télémétrie en direct, enregistrement des relevés et surveillance des seuils d&apos;entretien
              </p>
            </div>

            {vehicleTableSlot}
          </section>
        </div>
      )}

      {/* Vue 2 : Bons d'Intervention & Travaux */}
      {activeTab === 'WORK_ORDERS' && (
        <section className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-400" />
              Gestion des Bons d&apos;Intervention & Réparations
            </h2>
            <p className="text-xs text-zinc-400">
              Suivi des passages en atelier, validation des travaux mécaniques et remise en service de la flotte
            </p>
          </div>

          <WorkOrdersView />
        </section>
      )}

      {/* Vue 3 : Statistiques & Télémétrie */}
      {activeTab === 'ANALYTICS' && (
        <section className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              Tableau de Bord Analytique & Télémétrie de Flotte
            </h2>
            <p className="text-xs text-zinc-400">
              Coûts opérationnels au kilomètre, ventilation des réparations et disponibilité globale
            </p>
          </div>

          <AnalyticsView />
        </section>
      )}

      {/* Vue 4 : Gestion des Chauffeurs & Équipe */}
      {activeTab === 'DRIVERS' && (
        <section className="space-y-4 animate-in fade-in">
          <DriversView />
        </section>
      )}
    </div>
  );
}
