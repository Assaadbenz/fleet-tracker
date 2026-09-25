'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, CheckCircle2, Gauge, X, Wrench, Calendar } from 'lucide-react';
import { VehicleWithComputed } from '@/types/fleet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNumber } from '@/lib/utils';

interface LogMileageModalProps {
  vehicle: VehicleWithComputed | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitMileage: (vehicleId: string, newMileage: number) => Promise<void>;
}

export function LogMileageModal({
  vehicle,
  isOpen,
  onClose,
  onSubmitMileage,
}: LogMileageModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Schéma Zod dynamique avec validation stricte >= kilométrage actuel
  const currentMileage = vehicle?.currentMileage ?? 0;
  const mileageSchema = React.useMemo(() => {
    return z.object({
      mileage: z
        .coerce
        .number({ invalid_type_error: 'Veuillez saisir un kilométrage valide' })
        .int('Le kilométrage doit être un nombre entier')
        .min(currentMileage, {
          message: `Le nouveau kilométrage ne peut pas être inférieur au relevé actuel (${formatNumber(currentMileage)} km)`,
        })
        .max(currentMileage + 50000, {
          message: 'L’augmentation dépasse 50 000 km en un seul relevé. Veuillez vérifier le compteur.',
        }),
      recordedAt: z.string().optional(),
    });
  }, [currentMileage]);

  type MileageFormValues = z.infer<typeof mileageSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<MileageFormValues>({
    resolver: zodResolver(mileageSchema),
    mode: 'onChange', // Validation instantanée lors de la saisie
    defaultValues: {
      mileage: currentMileage,
      recordedAt: new Date().toISOString().split('T')[0],
    },
  });

  // Réinitialisation du formulaire lors du changement de véhicule
  React.useEffect(() => {
    if (vehicle) {
      reset({
        mileage: vehicle.currentMileage,
        recordedAt: new Date().toISOString().split('T')[0],
      });
    }
  }, [vehicle, reset]);

  if (!isOpen || !vehicle) return null;

  const watchedMileage = watch('mileage');
  const delta = (Number(watchedMileage) || currentMileage) - currentMileage;

  // Vérifier si ce nouveau kilométrage franchit un seuil de maintenance
  const nearestSchedule = vehicle.maintenanceSchedules?.find(
    (s) => s.nextDueMileage && s.nextDueMileage > currentMileage,
  );
  const willCrossThreshold =
    nearestSchedule?.nextDueMileage &&
    Number(watchedMileage) >= nearestSchedule.nextDueMileage;

  const handleFormSubmit = async (values: MileageFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmitMileage(vehicle.id, values.mileage);
      onClose();
    } catch {
      // Géré par le parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuickMileage = (km: number) => {
    const nextVal = currentMileage + km;
    setValue('mileage', nextVal, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl text-zinc-100">
        {/* En-tête */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Relevé Kilométrique</h2>
              <p className="text-xs text-zinc-400">
                {vehicle.make} {vehicle.model} • <span className="font-mono text-zinc-300">{vehicle.plateNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Valeurs de référence actuelles */}
        <div className="my-4 grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
          <div>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Relevé Actuel</span>
            <div className="text-base font-bold text-zinc-100 font-mono mt-0.5">
              {formatNumber(vehicle.currentMileage)} <span className="text-xs text-zinc-500 font-normal">km</span>
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Distance Ajoutée</span>
            <div className="text-base font-bold font-mono mt-0.5 text-indigo-400">
              +{formatNumber(delta > 0 ? delta : 0)} <span className="text-xs text-zinc-500 font-normal">km</span>
            </div>
          </div>
        </div>

        {/* Formulaire avec validation instantanée */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>Nouveau Kilométrage Total (km)</span>
              {errors.mileage && (
                <span className="text-[11px] text-rose-400 font-normal flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.mileage.message}
                </span>
              )}
            </label>
            <Input
              type="number"
              placeholder={`Min. ${vehicle.currentMileage}`}
              error={!!errors.mileage}
              {...register('mileage')}
              autoFocus
            />

            {/* Raccourcis d'incrémentation rapide */}
            <div className="flex items-center gap-2 pt-1.5">
              <span className="text-[11px] text-zinc-500">Ajout rapide :</span>
              <button
                type="button"
                onClick={() => addQuickMileage(100)}
                className="px-2 py-1 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                +100 km
              </button>
              <button
                type="button"
                onClick={() => addQuickMileage(500)}
                className="px-2 py-1 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                +500 km
              </button>
              <button
                type="button"
                onClick={() => addQuickMileage(1000)}
                className="px-2 py-1 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                +1 000 km
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>Date du Relevé</span>
            </label>
            <Input type="date" {...register('recordedAt')} />
          </div>

          {/* Alerte prédictive de maintenance */}
          {willCrossThreshold && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 flex items-start gap-2.5 text-amber-300 text-xs">
              <Wrench className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-200">Alerte de Révision Déclenchée</p>
                <p className="mt-0.5 text-amber-300/80 leading-relaxed">
                  Ce relevé franchit le seuil prévu pour &quot;{nearestSchedule?.serviceName}&quot; ({formatNumber(nearestSchedule?.nextDueMileage ?? 0)} km).
                  Le véhicule passera automatiquement en statut <strong>EN MAINTENANCE</strong> avec création d&apos;un bon d&apos;intervention.
                </p>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!isValid || !isDirty || isSubmitting}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Confirmer & Recalculer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
