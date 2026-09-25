'use client';

import * as React from 'react';
import {
  Truck,
  Hash,
  Shield,
  Gauge,
  Calendar,
  Wrench,
  Clock,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { VehicleWithComputed } from '@/types/fleet';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber, formatDate } from '@/lib/utils';

interface VehicleDetailsModalProps {
  vehicle: VehicleWithComputed | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMileageModal: (vehicle: VehicleWithComputed) => void;
  onOpenScheduleModal: (vehicle: VehicleWithComputed) => void;
}

export function VehicleDetailsModal({
  vehicle,
  isOpen,
  onClose,
  onOpenMileageModal,
  onOpenScheduleModal,
}: VehicleDetailsModalProps) {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/30">
              {vehicle.make.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-100">
                  {vehicle.make} {vehicle.model}
                </h2>
                <StatusBadge status={vehicle.computedStatus} />
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Année {vehicle.year} • Immatriculation : <span className="font-mono font-bold text-zinc-200">{vehicle.plateNumber}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Fiche Technique Rapide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
          <div>
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Compteur</span>
            <div className="text-base font-bold font-mono text-zinc-100 mt-0.5">
              {formatNumber(vehicle.currentMileage)} <span className="text-xs text-zinc-500 font-normal">km</span>
            </div>
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">N° Châssis (VIN)</span>
            <div className="text-xs font-mono text-indigo-400 mt-1 truncate" title={vehicle.vin}>
              {vehicle.vin}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Locataire</span>
            <div className="text-xs text-zinc-300 font-medium mt-1">
              Apex Global
            </div>
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Statut Système</span>
            <div className="text-xs font-semibold text-zinc-200 mt-1">
              {vehicle.status}
            </div>
          </div>
        </div>

        {/* Calendriers d'Entretien Programmés */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-indigo-400" />
              Calendriers d&apos;Entretien & Révisions Programmées
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onOpenScheduleModal(vehicle);
              }}
              className="text-xs gap-1.5"
            >
              + Ajouter une Révision
            </Button>
          </div>

          <div className="space-y-2">
            {!vehicle.maintenanceSchedules || vehicle.maintenanceSchedules.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-4 text-center rounded-lg bg-zinc-950/40 border border-zinc-800">
                Aucun calendrier d&apos;entretien configuré pour ce véhicule.
              </p>
            ) : (
              vehicle.maintenanceSchedules.map((schedule) => {
                const remaining = schedule.nextDueMileage
                  ? schedule.nextDueMileage - vehicle.currentMileage
                  : null;

                return (
                  <div
                    key={schedule.id}
                    className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-zinc-200">{schedule.serviceName}</div>
                      <div className="text-zinc-500 flex items-center gap-3 text-[11px]">
                        <span>Intervalle : tous les {formatNumber(schedule.intervalKm ?? 10000)} km</span>
                        <span>•</span>
                        <span>Tous les {schedule.intervalMonths ?? 6} mois</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-zinc-200">
                        Seuil : {formatNumber(schedule.nextDueMileage ?? 0)} km
                      </div>
                      <div className="text-[11px]">
                        {remaining !== null && (
                          <span
                            className={
                              remaining <= 0
                                ? 'text-rose-400 font-bold'
                                : remaining <= 1000
                                ? 'text-amber-400 font-semibold'
                                : 'text-zinc-400'
                            }
                          >
                            {remaining <= 0
                              ? `En retard (${formatNumber(Math.abs(remaining))} km)`
                              : `Dans ${formatNumber(remaining)} km`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Actions Rapides en Pied de Page */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              onOpenMileageModal(vehicle);
            }}
            className="gap-2"
          >
            <Gauge className="h-4 w-4" />
            Relever le Compteur
          </Button>

          <Button variant="outline" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
