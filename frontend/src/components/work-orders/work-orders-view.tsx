'use client';

import * as React from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Search,
  Filter,
  DollarSign,
  Truck,
  Calendar,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatDate } from '@/lib/utils';

export interface WorkOrder {
  id: string;
  vehiclePlate: string;
  vehicleName: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  cost: number;
  scheduledDate: string;
  completedDate?: string;
  technician: string;
}

const initialWorkOrders: WorkOrder[] = [
  {
    id: 'WO-2026-001',
    vehiclePlate: '58291-B-20',
    vehicleName: 'Freightliner Cascadia 126',
    title: 'Révision du Freinage Pneumatique & Garnitures',
    description: 'Dépassé de 400 km. Remplacement des disques ventilés, plaquettes et purge du circuit haute pression.',
    status: 'IN_PROGRESS',
    cost: 3850,
    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    technician: 'Atelier Central - Youssef B.',
  },
  {
    id: 'WO-2026-002',
    vehiclePlate: '10482-A-20',
    vehicleName: 'Volvo VNL 860 Grand Routier',
    title: 'Vidange Moteur 15W40 & Cartouches Filtrantes',
    description: 'Entretien préventif programmé au seuil de 50 000 km. Huile synthèse homologuée constructeur.',
    status: 'PENDING',
    cost: 1650,
    scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    technician: 'Garage Partenaire - Ahmed M.',
  },
  {
    id: 'WO-2026-003',
    vehiclePlate: '99999-A-20',
    vehicleName: 'Peterbilt 579 Ultraloft',
    title: 'Remplacement Courroie Accessoires & Galets',
    description: 'Contrôle périodique et remplacement préventif suite à inspection visuelle.',
    status: 'COMPLETED',
    cost: 2100,
    scheduledDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    technician: 'Atelier Central - Karim T.',
  },
  {
    id: 'WO-2026-004',
    vehiclePlate: '34910-D-20',
    vehicleName: 'Ford F-550 Super Duty',
    title: 'Permutation des Pneus & Géométrie Train Avant',
    description: 'Équilibrage des roues directrices et réglage du parallélisme.',
    status: 'COMPLETED',
    cost: 950,
    scheduledDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    technician: 'Station Service Express - Omar K.',
  },
];

export function WorkOrdersView() {
  const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>(initialWorkOrders);
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // New Work Order form state
  const [newPlate, setNewPlate] = React.useState('');
  const [newTitle, setNewTitle] = React.useState('');
  const [newCost, setNewCost] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');

  const filteredOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || wo.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAdvanceStatus = (orderId: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== orderId) return wo;
        if (wo.status === 'PENDING') {
          return { ...wo, status: 'IN_PROGRESS' };
        }
        if (wo.status === 'IN_PROGRESS') {
          return {
            ...wo,
            status: 'COMPLETED',
            completedDate: new Date().toISOString(),
          };
        }
        return wo;
      }),
    );
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newTitle) return;

    const created: WorkOrder = {
      id: `WO-2026-00${workOrders.length + 1}`,
      vehiclePlate: newPlate.toUpperCase(),
      vehicleName: 'Véhicule de Flotte',
      title: newTitle,
      description: newDescription || 'Intervention programmée manuellement.',
      status: 'PENDING',
      cost: Number(newCost) || 1200,
      scheduledDate: new Date().toISOString(),
      technician: 'Atelier Central - Équipe Mécanique',
    };

    setWorkOrders([created, ...workOrders]);
    setNewPlate('');
    setNewTitle('');
    setNewCost('');
    setNewDescription('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards for Work Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>En Attente d&apos;Atelier</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {workOrders.filter((w) => w.status === 'PENDING').length}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Interventions à planifier</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>En Cours de Réparation</span>
            <Wrench className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {workOrders.filter((w) => w.status === 'IN_PROGRESS').length}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Véhicules immobilisés en atelier</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Interventions Clôturées</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {workOrders.filter((w) => w.status === 'COMPLETED').length}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Remis en circulation avec succès</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher bon, plaque, prestation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-zinc-800 bg-zinc-900/80 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800/80 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'ALL', label: `Tous (${workOrders.length})` },
              { id: 'PENDING', label: 'En Attente' },
              { id: 'IN_PROGRESS', label: 'En Cours' },
              { id: 'COMPLETED', label: 'Terminés' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          Nouveau Bon d&apos;Intervention
        </Button>
      </div>

      {/* Work Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400">
            <Filter className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm">Aucun bon d&apos;intervention ne correspond à votre filtre.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl p-5 hover:border-zinc-700 transition-all flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                    {order.id}
                  </span>
                  <span className="font-mono text-xs font-semibold bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded">
                    {order.vehiclePlate}
                  </span>
                  <span className="text-xs text-zinc-400">• {order.vehicleName}</span>

                  {order.status === 'PENDING' && (
                    <Badge variant="dueSoon">
                      <Clock className="h-3 w-3 mr-1" />
                      EN ATTENTE
                    </Badge>
                  )}
                  {order.status === 'IN_PROGRESS' && (
                    <Badge variant="maintenance">
                      <Wrench className="h-3 w-3 mr-1" />
                      EN COURS D&apos;ATELIER
                    </Badge>
                  )}
                  {order.status === 'COMPLETED' && (
                    <Badge variant="active">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      TERMINÉ & VALIDÉ
                    </Badge>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-zinc-100">{order.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                  {order.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-1">
                  <span className="flex items-center gap-1 text-zinc-300 font-medium">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    {formatNumber(order.cost)} MAD
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Programmé : {formatDate(order.scheduledDate)}
                  </span>
                  {order.completedDate && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400/90 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Clôturé le : {formatDate(order.completedDate)}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span>{order.technician}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 lg:shrink-0">
                {order.status === 'PENDING' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAdvanceStatus(order.id)}
                    className="hover:border-rose-500/50 hover:bg-rose-950/30 text-rose-300"
                  >
                    <Wrench className="h-3.5 w-3.5 mr-1" />
                    Démarrer l&apos;Atelier
                  </Button>
                )}
                {order.status === 'IN_PROGRESS' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAdvanceStatus(order.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Clôturer & Remettre en Service
                  </Button>
                )}
                {order.status === 'COMPLETED' && (
                  <span className="text-xs text-emerald-400 font-medium bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    Véhicule Rétabli ACTIF
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Création Bon d'Intervention */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Wrench className="h-5 w-5 text-indigo-400" />
                Nouveau Bon d&apos;Intervention
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)}>
                <X className="h-5 w-5 text-zinc-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Plaque d&apos;Immatriculation</label>
                <Input
                  placeholder="ex. 10482-A-20"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Intitulé de la Révision</label>
                <Input
                  placeholder="ex. Remplacement Amortisseurs Arrière"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Estimation du Coût (MAD)</label>
                <Input
                  type="number"
                  placeholder="ex. 2500"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Observations / Diagnostic</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Détails techniques pour l'atelier..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Créer le Bon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
