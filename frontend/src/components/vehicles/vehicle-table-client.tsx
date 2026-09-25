'use client';

import * as React from 'react';
import { useOptimistic, startTransition } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Gauge,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Truck,
  Edit,
  Trash2,
  Eye,
  Wrench,
  Download,
  MoreVertical,
  Activity,
} from 'lucide-react';
import { VehicleWithComputed, ComputedStatus, MaintenanceSchedule } from '@/types/fleet';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber, formatDate } from '@/lib/utils';
import { LogMileageModal } from './log-mileage-modal';
import { AddTruckModal } from './add-truck-modal';
import { EditVehicleModal } from './edit-vehicle-modal';
import { ScheduleServiceModal } from './schedule-service-modal';
import { VehicleDetailsModal } from './vehicle-details-modal';
import { submitMileageAction } from '@/app/actions/mileage-actions';
import { createVehicleAction } from '@/app/actions/vehicle-actions';

interface VehicleTableClientProps {
  initialVehicles: VehicleWithComputed[];
}

export function VehicleTableClient({ initialVehicles }: VehicleTableClientProps) {
  const [vehicles, setVehicles] = React.useState<VehicleWithComputed[]>(initialVehicles);
  const [selectedVehicle, setSelectedVehicle] = React.useState<VehicleWithComputed | null>(null);

  // Modals state
  const [isMileageModalOpen, setIsMileageModalOpen] = React.useState(false);
  const [isAddTruckModalOpen, setIsAddTruckModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Checkbox Selection for Bulk Actions
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Synchronisation si les véhicules changent côté serveur
  React.useEffect(() => {
    setVehicles(initialVehicles);
  }, [initialVehicles]);

  // Hook d'UI Optimiste React 19 / Next.js
  const [optimisticVehicles, setOptimisticVehicles] = useOptimistic(
    vehicles,
    (currentVehicles, update:
      | { type: 'MILEAGE'; vehicleId: string; mileage: number }
      | { type: 'ADD_TRUCK'; newTruck: VehicleWithComputed }
      | { type: 'UPDATE_VEHICLE'; updated: VehicleWithComputed }
      | { type: 'DELETE_VEHICLE'; vehicleId: string }
      | { type: 'ADD_SCHEDULE'; vehicleId: string; schedule: MaintenanceSchedule }
    ) => {
      if (update.type === 'ADD_TRUCK') {
        return [update.newTruck, ...currentVehicles];
      }

      if (update.type === 'DELETE_VEHICLE') {
        return currentVehicles.filter((v) => v.id !== update.vehicleId);
      }

      if (update.type === 'UPDATE_VEHICLE') {
        return currentVehicles.map((v) => (v.id === update.updated.id ? update.updated : v));
      }

      if (update.type === 'ADD_SCHEDULE') {
        return currentVehicles.map((v) => {
          if (v.id !== update.vehicleId) return v;
          const currentSchedules = v.maintenanceSchedules || [];
          return {
            ...v,
            maintenanceSchedules: [update.schedule, ...currentSchedules],
          };
        });
      }

      // MILEAGE Update
      return currentVehicles.map((vehicle) => {
        if (vehicle.id !== update.vehicleId) return vehicle;

        let newStatus: ComputedStatus = vehicle.computedStatus;
        const nearestSchedule = vehicle.maintenanceSchedules?.find((s) => s.nextDueMileage);

        if (nearestSchedule?.nextDueMileage && update.mileage >= nearestSchedule.nextDueMileage) {
          newStatus = 'MAINTENANCE';
        } else if (
          nearestSchedule?.nextDueMileage &&
          nearestSchedule.nextDueMileage - update.mileage <= 1000
        ) {
          newStatus = 'DUE_SOON';
        } else if (vehicle.status === 'ACTIVE') {
          newStatus = 'ACTIVE';
        }

        return {
          ...vehicle,
          currentMileage: update.mileage,
          computedStatus: newStatus,
        };
      });
    },
  );

  // Modal Handlers
  const handleOpenMileage = (vehicle: VehicleWithComputed) => {
    setSelectedVehicle(vehicle);
    setIsMileageModalOpen(true);
  };

  const handleOpenEdit = (vehicle: VehicleWithComputed) => {
    setSelectedVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  const handleOpenSchedule = (vehicle: VehicleWithComputed) => {
    setSelectedVehicle(vehicle);
    setIsScheduleModalOpen(true);
  };

  const handleOpenDetails = (vehicle: VehicleWithComputed) => {
    setSelectedVehicle(vehicle);
    setIsDetailsModalOpen(true);
  };

  // Actions
  const handleAddTruck = async (newTruck: VehicleWithComputed) => {
    startTransition(async () => {
      setOptimisticVehicles({ type: 'ADD_TRUCK', newTruck });
      await createVehicleAction(newTruck);
      setVehicles((prev) => [newTruck, ...prev]);
      setToastMessage({
        text: `Véhicule ${newTruck.make} ${newTruck.model} (${newTruck.plateNumber}) ajouté.`,
        type: 'success',
      });
    });
  };

  const handleUpdateVehicle = async (updated: VehicleWithComputed) => {
    startTransition(async () => {
      setOptimisticVehicles({ type: 'UPDATE_VEHICLE', updated });
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setToastMessage({
        text: `Fiche du véhicule ${updated.plateNumber} mise à jour avec succès.`,
        type: 'success',
      });
    });
  };

  const handleDeleteVehicle = (vehicle: VehicleWithComputed) => {
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir retirer le véhicule ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber}) de la flotte ?`,
    );

    if (!confirmDelete) return;

    startTransition(async () => {
      setOptimisticVehicles({ type: 'DELETE_VEHICLE', vehicleId: vehicle.id });
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
      setSelectedIds((prev) => prev.filter((id) => id !== vehicle.id));
      setToastMessage({
        text: `Véhicule ${vehicle.plateNumber} retiré de la flotte avec succès.`,
        type: 'success',
      });
    });
  };

  const handleAddSchedule = async (vehicleId: string, schedule: MaintenanceSchedule) => {
    startTransition(async () => {
      setOptimisticVehicles({ type: 'ADD_SCHEDULE', vehicleId, schedule });
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id !== vehicleId) return v;
          return {
            ...v,
            maintenanceSchedules: [schedule, ...(v.maintenanceSchedules || [])],
          };
        }),
      );
      setToastMessage({
        text: `Révision « ${schedule.serviceName} » programmée au seuil de ${formatNumber(schedule.nextDueMileage ?? 0)} km.`,
        type: 'success',
      });
    });
  };

  const handleToggleStatus = (vehicle: VehicleWithComputed) => {
    const nextStatus = vehicle.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    const updated: VehicleWithComputed = {
      ...vehicle,
      status: nextStatus,
      computedStatus: nextStatus === 'ACTIVE' ? 'ACTIVE' : 'MAINTENANCE',
    };
    handleUpdateVehicle(updated);
  };

  const handleSubmitMileage = async (vehicleId: string, newMileage: number) => {
    startTransition(async () => {
      setOptimisticVehicles({ type: 'MILEAGE', vehicleId, mileage: newMileage });

      try {
        const result = await submitMileageAction(vehicleId, newMileage);
        if (result.success) {
          setVehicles((prev) =>
            prev.map((v) => {
              if (v.id !== vehicleId) return v;
              let newComputed: ComputedStatus = v.computedStatus;
              const sched = v.maintenanceSchedules?.find((s) => s.nextDueMileage);
              if (sched?.nextDueMileage && newMileage >= sched.nextDueMileage) {
                newComputed = 'MAINTENANCE';
              } else if (sched?.nextDueMileage && sched.nextDueMileage - newMileage <= 1000) {
                newComputed = 'DUE_SOON';
              }
              return {
                ...v,
                currentMileage: newMileage,
                computedStatus: newComputed,
              };
            }),
          );
          setToastMessage({
            text: `Relevé enregistré : ${formatNumber(newMileage)} km. Seuils recalculés.`,
            type: 'success',
          });
        }
      } catch (err: any) {
        setToastMessage({
          text: err.message || 'Échec de l’enregistrement.',
          type: 'error',
        });
      }
    });
  };

  // Bulk Actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredVehicles.map((v) => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleExportCSV = () => {
    const rows = [
      ['Marque', 'Modèle', 'Immatriculation', 'VIN', 'Kilométrage', 'Statut'],
      ...filteredVehicles.map((v) => [
        v.make,
        v.model,
        v.plateNumber,
        v.vin,
        v.currentMileage.toString(),
        v.computedStatus,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flotte_apex_logistics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrage des véhicules
  const filteredVehicles = React.useMemo(() => {
    return optimisticVehicles.filter((v) => {
      const matchesSearch =
        v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || v.computedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [optimisticVehicles, searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/70 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs opacity-75 hover:opacity-100 underline ml-4"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Barre de contrôle : Recherche, Filtres, Actions Groupées & Ajout */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Recherche */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher plaque, VIN, marque, modèle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-zinc-800 bg-zinc-900/80 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Onglets de filtre */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800/80 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'ALL', label: `Tous (${optimisticVehicles.length})` },
              { id: 'ACTIVE', label: 'Actifs' },
              { id: 'DUE_SOON', label: 'À réviser' },
              { id: 'MAINTENANCE', label: 'Maintenance' },
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

        {/* Boutons d'Action Globale */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs gap-1.5 text-zinc-300 hover:text-white"
            title="Exporter le registre au format CSV"
          >
            <Download className="h-3.5 w-3.5" />
            Exporter CSV
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsAddTruckModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-2 px-4 rounded-xl gap-2 shadow-md shadow-indigo-600/30"
          >
            <PlusCircle className="h-4 w-4" />
            Ajouter un Camion
          </Button>
        </div>
      </div>

      {/* Barre d'Actions Groupées (si véhicules cochés) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs animate-in fade-in">
          <span className="text-indigo-300 font-medium">
            <strong>{selectedIds.length}</strong> véhicule(s) sélectionné(s)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                selectedIds.forEach((id) => {
                  const v = vehicles.find((x) => x.id === id);
                  if (v) handleToggleStatus(v);
                });
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              Basculer Statut Groupé
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-zinc-400 hover:text-zinc-200 underline ml-2"
            >
              Désélectionner
            </button>
          </div>
        </div>
      )}

      {/* Tableau du Registre de Flotte */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-200">
            <thead className="border-b border-zinc-800 bg-zinc-950/70 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredVehicles.length > 0 &&
                      selectedIds.length === filteredVehicles.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="py-3.5 px-4">Véhicule</th>
                <th className="py-3.5 px-4">N° VIN</th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center gap-1 cursor-default">
                    <span>Relevé Compteur</span>
                    <ArrowUpDown className="h-3 w-3 text-zinc-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Prochain Entretien Prévu</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions de Gestion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-normal">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Filter className="h-8 w-8 text-zinc-600" />
                      <p className="text-sm font-medium">Aucun véhicule ne correspond aux critères sélectionnés.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('ALL');
                        }}
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        <RotateCcw className="h-3 w-3" /> Réinitialiser les filtres
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const nearestSched = vehicle.maintenanceSchedules?.[0];
                  const remaining = nearestSched?.nextDueMileage
                    ? nearestSched.nextDueMileage - vehicle.currentMileage
                    : null;
                  const isChecked = selectedIds.includes(vehicle.id);

                  return (
                    <tr
                      key={vehicle.id}
                      className={`hover:bg-zinc-800/40 transition-colors group ${
                        isChecked ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(vehicle.id)}
                          className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Marque, Modèle, Plaque */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/60 text-zinc-300 font-semibold text-xs">
                            {vehicle.make.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                              {vehicle.make} {vehicle.model}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <span className="font-mono font-bold bg-zinc-800/90 text-indigo-300 border border-zinc-700/60 px-1.5 py-0.5 rounded text-[11px]">
                                {vehicle.plateNumber}
                              </span>
                              <span>•</span>
                              <span>{vehicle.year}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* VIN */}
                      <td className="py-4 px-4 font-mono text-xs text-zinc-400">
                        {vehicle.vin}
                      </td>

                      {/* Kilométrage actuel */}
                      <td className="py-4 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-zinc-100 font-mono text-sm tracking-tight">
                            {formatNumber(vehicle.currentMileage)}
                          </span>
                          <span className="text-xs text-zinc-500 font-normal">km</span>
                        </div>
                      </td>

                      {/* Prochain entretien */}
                      <td className="py-4 px-4">
                        {nearestSched ? (
                          <div className="space-y-0.5">
                            <div className="text-xs font-medium text-zinc-200">
                              {nearestSched.serviceName}
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                              {remaining !== null && (
                                <span
                                  className={
                                    remaining <= 0
                                      ? 'text-rose-400 font-semibold'
                                      : remaining <= 1000
                                      ? 'text-amber-400 font-medium'
                                      : 'text-zinc-400'
                                  }
                                >
                                  {remaining <= 0
                                    ? `En retard de ${formatNumber(Math.abs(remaining))} km`
                                    : `Dans ${formatNumber(remaining)} km`}
                                </span>
                              )}
                              {nearestSched.nextDueDate && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-zinc-500" />
                                    {formatDate(nearestSched.nextDueDate)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">Aucun calendrier configuré</span>
                        )}
                      </td>

                      {/* Statut Badge */}
                      <td className="py-4 px-4">
                        <StatusBadge status={vehicle.computedStatus} />
                      </td>

                      {/* ACTIONS DE GESTION COMPLÈTES */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Relever km */}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenMileage(vehicle)}
                            className="h-8 px-2.5 text-xs hover:border-indigo-500/50 hover:bg-indigo-950/30 hover:text-indigo-300"
                            title="Enregistrer un nouveau relevé kilométrique"
                          >
                            <Gauge className="h-3.5 w-3.5 mr-1" />
                            Relever km
                          </Button>

                          {/* 2. Détails & Fiche */}
                          <button
                            onClick={() => handleOpenDetails(vehicle)}
                            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
                            title="Voir la fiche technique et l'historique"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* 3. Planifier Révision */}
                          <button
                            onClick={() => handleOpenSchedule(vehicle)}
                            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-indigo-300 transition-colors"
                            title="Planifier un entretien préventif"
                          >
                            <Wrench className="h-4 w-4" />
                          </button>

                          {/* 4. Modifier */}
                          <button
                            onClick={() => handleOpenEdit(vehicle)}
                            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-amber-300 transition-colors"
                            title="Modifier les informations du véhicule"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {/* 5. Basculer Statut Rapide */}
                          <button
                            onClick={() => handleToggleStatus(vehicle)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              vehicle.status === 'ACTIVE'
                                ? 'bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400'
                                : 'bg-zinc-800/80 hover:bg-emerald-950/40 text-zinc-400 hover:text-emerald-400'
                            }`}
                            title={
                              vehicle.status === 'ACTIVE'
                                ? 'Immobiliser en atelier (Passer en MAINTENANCE)'
                                : 'Remettre en service (Passer en ACTIF)'
                            }
                          >
                            <Activity className="h-4 w-4" />
                          </button>

                          {/* 6. Supprimer */}
                          <button
                            onClick={() => handleDeleteVehicle(vehicle)}
                            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors"
                            title="Retirer le véhicule de la flotte"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1 : Relevé de Compteur */}
      <LogMileageModal
        vehicle={selectedVehicle}
        isOpen={isMileageModalOpen}
        onClose={() => setIsMileageModalOpen(false)}
        onSubmitMileage={handleSubmitMileage}
      />

      {/* Modal 2 : Ajout de Camion */}
      <AddTruckModal
        isOpen={isAddTruckModalOpen}
        onClose={() => setIsAddTruckModalOpen(false)}
        onAddTruck={handleAddTruck}
      />

      {/* Modal 3 : Modification du Véhicule */}
      <EditVehicleModal
        vehicle={selectedVehicle}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateVehicle={handleUpdateVehicle}
      />

      {/* Modal 4 : Planifier Révision */}
      <ScheduleServiceModal
        vehicle={selectedVehicle}
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onAddSchedule={handleAddSchedule}
      />

      {/* Modal 5 : Fiche Technique & Détails */}
      <VehicleDetailsModal
        vehicle={selectedVehicle}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onOpenMileageModal={handleOpenMileage}
        onOpenScheduleModal={handleOpenSchedule}
      />
    </div>
  );
}
