'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wrench, Calendar, Gauge, X, PlusCircle, CheckCircle2 } from 'lucide-react';
import { VehicleWithComputed, MaintenanceSchedule } from '@/types/fleet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNumber } from '@/lib/utils';

const scheduleSchema = z.object({
  serviceName: z.string().min(2, 'Le nom de la révision est requis'),
  intervalKm: z.coerce.number().int().min(500, 'Minimum 500 km'),
  intervalMonths: z.coerce.number().int().min(1, 'Minimum 1 mois'),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleServiceModalProps {
  vehicle: VehicleWithComputed | null;
  isOpen: boolean;
  onClose: () => void;
  onAddSchedule: (vehicleId: string, schedule: MaintenanceSchedule) => Promise<void>;
}

export function ScheduleServiceModal({
  vehicle,
  isOpen,
  onClose,
  onAddSchedule,
}: ScheduleServiceModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    mode: 'onChange',
    defaultValues: {
      serviceName: 'Vidange & Remplacement des Filtres',
      intervalKm: 15000,
      intervalMonths: 6,
    },
  });

  if (!isOpen || !vehicle) return null;

  const handleFormSubmit = async (values: ScheduleFormValues) => {
    try {
      setIsSubmitting(true);
      const nextDueMileage = vehicle.currentMileage + values.intervalKm;
      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + values.intervalMonths);

      const newSchedule: MaintenanceSchedule = {
        id: `s-${Date.now()}`,
        vehicleId: vehicle.id,
        serviceName: values.serviceName,
        intervalKm: values.intervalKm,
        intervalMonths: values.intervalMonths,
        lastServiceMileage: vehicle.currentMileage,
        lastServiceDate: new Date().toISOString(),
        nextDueMileage,
        nextDueDate: nextDueDate.toISOString(),
      };

      await onAddSchedule(vehicle.id, newSchedule);
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const setPreset = (name: string, km: number, months: number) => {
    setValue('serviceName', name, { shouldValidate: true });
    setValue('intervalKm', km, { shouldValidate: true });
    setValue('intervalMonths', months, { shouldValidate: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Planifier une Maintenance Préventive</h3>
              <p className="text-xs text-zinc-400">
                {vehicle.make} {vehicle.model} • <span className="font-mono text-zinc-300">{vehicle.plateNumber}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Raccourcis de révisions courantes */}
        <div className="pt-3">
          <label className="text-[11px] text-zinc-400 mb-1.5 block">Préréglages d&apos;Atelier :</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setPreset('Vidange Moteur 15W40 & Filtres', 15000, 6)}
              className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              Vidange (15 000 km)
            </button>
            <button
              type="button"
              onClick={() => setPreset('Révision Freinage & Garnitures', 30000, 12)}
              className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              Freins (30 000 km)
            </button>
            <button
              type="button"
              onClick={() => setPreset('Vidange Boîte & Pont Arrière', 60000, 24)}
              className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              Transmission (60 000 km)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Intitulé de la Révision</label>
            <Input placeholder="ex. Vidange Moteur & Filtre Gasoil" {...register('serviceName')} />
            {errors.serviceName && (
              <p className="text-[11px] text-rose-400">{errors.serviceName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-zinc-400" />
                <span>Intervalle Kilométrique (km)</span>
              </label>
              <Input type="number" placeholder="15000" {...register('intervalKm')} />
              {errors.intervalKm && (
                <p className="text-[11px] text-rose-400">{errors.intervalKm.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span>Intervalle Temporel (Mois)</span>
              </label>
              <Input type="number" placeholder="6" {...register('intervalMonths')} />
              {errors.intervalMonths && (
                <p className="text-[11px] text-rose-400">{errors.intervalMonths.message}</p>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1 text-zinc-400">
            <div className="flex justify-between">
              <span>Compteur actuel du véhicule :</span>
              <span className="font-mono text-zinc-200">{formatNumber(vehicle.currentMileage)} km</span>
            </div>
            <div className="flex justify-between text-indigo-300 font-medium">
              <span>Prochain seuil d&apos;alerte automatique :</span>
              <span className="font-mono">
                {formatNumber(vehicle.currentMileage + 15000)} km
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!isValid}>
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Ajouter au Calendrier
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
