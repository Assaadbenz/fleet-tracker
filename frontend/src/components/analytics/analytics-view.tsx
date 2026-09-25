'use client';

import * as React from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Truck,
  Wrench,
  Fuel,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

export function AnalyticsView() {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Dépenses Maintenance Flotte</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-100">
            18 550 <span className="text-xs text-zinc-500 font-normal">MAD</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>-8.4% vs mois précédent (optimisé)</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Kilométrage Global Parcouru</span>
            <Gauge className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-400">
            265 300 <span className="text-xs text-zinc-500 font-normal">km</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Moyenne : 66 325 km / véhicule
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Taux de Disponibilité Flotte</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            91.7 %
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Objectif opérationnel : &gt; 90%
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Coût Moyen au Kilomètre</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-100">
            0.070 <span className="text-xs text-zinc-500 font-normal">MAD/km</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Entretien préventif + pièces d&apos;usure
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventilation des Coûts par Catégorie */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-indigo-400" />
              Répartition des Dépenses de Maintenance
            </h3>
            <span className="text-xs text-zinc-400">Cumul 2026</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {[
              { label: 'Système de Freinage & Sécurité', amount: '7 800 MAD', percent: 42, color: 'bg-rose-500' },
              { label: 'Vidanges Moteur & Filtres', amount: '4 950 MAD', percent: 27, color: 'bg-indigo-500' },
              { label: 'Pneumatiques & Équilibrage', amount: '3 700 MAD', percent: 20, color: 'bg-amber-500' },
              { label: 'Transmission & Boîte', amount: '2 100 MAD', percent: 11, color: 'bg-emerald-500' },
            ].map((cat) => (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{cat.label}</span>
                  <span className="text-zinc-400 font-mono">{cat.amount} ({cat.percent}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Télémétrie Kilométrique par Véhicule */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Truck className="h-4 w-4 text-indigo-400" />
              Compteurs Actuels & Intensité d&apos;Usage
            </h3>
            <span className="text-xs text-zinc-400">Kilométrage Actif</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {[
              { plate: '99999-A-20', name: 'Peterbilt 579', km: 119200, percent: 100, status: 'Intensif' },
              { plate: '58291-B-20', name: 'Freightliner Cascadia', km: 82400, percent: 69, status: 'En Atelier' },
              { plate: '10482-A-20', name: 'Volvo VNL 860', km: 49500, percent: 41, status: 'À Réviser' },
              { plate: '34910-D-20', name: 'Ford F-550 Super Duty', km: 14200, percent: 12, status: 'Nominal' },
            ].map((truck) => (
              <div key={truck.plate} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-200">
                    <span className="font-mono text-zinc-400 mr-2">{truck.plate}</span>
                    {truck.name}
                  </span>
                  <span className="text-zinc-300 font-mono">{formatNumber(truck.km)} km</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                    style={{ width: `${truck.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
