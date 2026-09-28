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
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';

export function AnalyticsView() {
  const [timeRange, setTimeRange] = React.useState<'30D' | '90D' | 'YTD'>('30D');

  const exportAnalyticsCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Indicateur,Valeur,Unite,Variation\n' +
      'Depenses Maintenance Flotte,18550,MAD,-8.4%\n' +
      'Depenses Carburant Total,42800,MAD,+2.1%\n' +
      'Kilometrage Global Parcouru,265300,km,+12.5%\n' +
      'Taux de Disponibilite Flotte,91.7,%,Objectif >90%\n' +
      'Consommation Moyenne Flotte,29.4,L/100km,-1.2%\n' +
      'Cout Moyen au Kilometre,0.231,MAD/km,Maintenance + Carburant\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rapport-flotte-analytique-${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAnalyticsJson = () => {
    const data = {
      tenant: 'Apex Logistics Inc.',
      generatedAt: new Date().toISOString(),
      timeRange,
      kpis: {
        totalMaintenanceCostMad: 18550,
        totalFuelCostMad: 42800,
        totalOdometerKm: 265300,
        fleetAvailabilityPct: 91.7,
        avgFuelConsumptionL100km: 29.4,
        costPerKmMad: 0.231,
      },
      categories: [
        { name: 'Système de Freinage', costMad: 7800, sharePct: 42 },
        { name: 'Vidanges & Filtrations', costMad: 4950, sharePct: 27 },
        { name: 'Pneumatiques & Équilibrage', costMad: 3700, sharePct: 20 },
        { name: 'Transmission & Boîte', costMad: 2100, sharePct: 11 },
      ],
      fleetUtilization: [
        { plate: '99999-A-20', model: 'Peterbilt 579', km: 119200, status: 'Intensif', fuelL100km: 31.2 },
        { plate: '58291-B-20', model: 'Freightliner Cascadia', km: 82400, status: 'En Atelier', fuelL100km: 28.9 },
        { plate: '10482-A-20', model: 'Volvo VNL 860', km: 49500, status: 'À Réviser', fuelL100km: 27.8 },
        { plate: '34910-D-20', model: 'Ford F-550', km: 14200, status: 'Nominal', fuelL100km: 22.4 },
      ],
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `telemetrie-flotte-${timeRange}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Controls Bar: Time Range & Export */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 text-xs font-medium text-zinc-300">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <span>Période d&apos;analyse :</span>
          </div>

          <div className="flex items-center gap-1">
            {(['30D', '90D', 'YTD'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                {range === '30D' ? '30 Derniers Jours' : range === '90D' ? 'Ce Trimestre' : 'Année 2026 (YTD)'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={exportAnalyticsCsv}
            variant="outline"
            className="text-xs h-8 px-3 rounded-xl border-zinc-700 hover:bg-zinc-800 text-zinc-200 flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span>Exporter CSV</span>
          </Button>
          <Button
            onClick={exportAnalyticsJson}
            variant="outline"
            className="text-xs h-8 px-3 rounded-xl border-zinc-700 hover:bg-zinc-800 text-zinc-200 flex items-center gap-1.5"
          >
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Grid - 6 High Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Maintenance */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Dépenses Maintenance Flotte</span>
            <Wrench className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-100">
            18 550 <span className="text-xs text-zinc-500 font-normal">MAD</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>-8.4% vs mois précédent (optimisé)</span>
          </div>
        </div>

        {/* Carburant */}
        <div className="rounded-xl border border-amber-900/30 bg-amber-950/10 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-amber-400/90 font-medium">
            <span>Dépenses Carburant Cumulées</span>
            <Fuel className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            42 800 <span className="text-xs text-amber-400/70 font-normal">MAD</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            3 170 Litres consommés • Prix moy. 13.50 MAD/L
          </div>
        </div>

        {/* Consommation L/100km */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Rendement Carburant Moyen</span>
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-400">
            29.4 <span className="text-xs text-zinc-500 font-normal">L / 100 km</span>
          </div>
          <div className="mt-2 text-xs text-emerald-400">
            -1.2 L/100km grâce aux révisions prédictives
          </div>
        </div>

        {/* Kilométrage */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Kilométrage Global Parcouru</span>
            <Gauge className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-100">
            265 300 <span className="text-xs text-zinc-500 font-normal">km</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Moyenne : 66 325 km / tracteur
          </div>
        </div>

        {/* Disponibilité */}
        <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-emerald-400/90 font-medium">
            <span>Taux de Disponibilité Flotte</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            91.7 %
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Objectif opérationnel : &gt; 90% respecté
          </div>
        </div>

        {/* Coût Global au Km */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Coût Opérationnel Global</span>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-100">
            0.231 <span className="text-xs text-zinc-500 font-normal">MAD / km</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Carburant (0.161) + Entretien (0.070)
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventilation des Coûts par Catégorie */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-indigo-400" />
              Répartition des Dépenses de Maintenance
            </h3>
            <span className="text-xs text-zinc-400">Total : 18 550 MAD</span>
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

        {/* Efficience Carburant & Compteurs par Véhicule */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Truck className="h-4 w-4 text-indigo-400" />
              Télémétrie & Efficience par Tracteur
            </h3>
            <span className="text-xs text-zinc-400">Kilométrage & Conso</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {[
              { plate: '99999-A-20', name: 'Peterbilt 579', km: 119200, percent: 100, conso: '31.2 L/100km' },
              { plate: '58291-B-20', name: 'Freightliner Cascadia', km: 82400, percent: 69, conso: '28.9 L/100km' },
              { plate: '10482-A-20', name: 'Volvo VNL 860', km: 49500, percent: 41, conso: '27.8 L/100km' },
              { plate: '34910-D-20', name: 'Ford F-550 Super Duty', km: 14200, percent: 12, conso: '22.4 L/100km' },
            ].map((truck) => (
              <div key={truck.plate} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-200">
                    <span className="font-mono text-zinc-400 mr-2">{truck.plate}</span>
                    {truck.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-mono text-[11px]">{truck.conso}</span>
                    <span className="text-zinc-300 font-mono">{formatNumber(truck.km)} km</span>
                  </div>
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
