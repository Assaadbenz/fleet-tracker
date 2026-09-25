'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Truck, X, Hash, Calendar, Gauge, Shield, Wrench } from 'lucide-react';
import { VehicleWithComputed } from '@/types/fleet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const truckSchema = z.object({
  make: z.string().min(2, 'La marque doit comporter au moins 2 caractères (ex. Volvo, Scania, Renault)'),
  model: z.string().min(2, 'Le modèle est requis (ex. FH 500, Cascadia 126, Actros)'),
  plateNumber: z
    .string()
    .min(1, 'Plaque d’immatriculation requise')
    .transform((val) => val.trim().toUpperCase())
    .refine(
      (val) => /^\d{1,5}-[A-Z\u0600-\u06FF]-\d{1,2}$/.test(val),
      {
        message: 'Format attendu : 99999-A-20 (ex. 12345-A-20 ou 99999-A-20)',
      },
    ),
  vin: z
    .string()
    .min(8, 'Le VIN doit comporter au moins 8 caractères')
    .max(17, 'Le VIN ne peut pas dépasser 17 caractères')
    .transform((val) => val.trim().toUpperCase()),
  year: z.coerce
    .number({ invalid_type_error: 'Année invalide' })
    .int()
    .min(1995, 'L’année doit être 1995 ou ultérieure')
    .max(new Date().getFullYear() + 2, 'Année future invalide'),
  currentMileage: z.coerce
    .number({ invalid_type_error: 'Kilométrage invalide' })
    .int()
    .min(0, 'Le kilométrage initial ne peut pas être négatif'),
  serviceName: z.string().min(2, 'Prestation requise'),
  intervalKm: z.coerce.number().int().min(1000, 'L’intervalle doit être d’au moins 1 000 km'),
});

export type AddTruckFormValues = z.infer<typeof truckSchema>;

interface AddTruckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTruck: (newTruck: VehicleWithComputed) => Promise<void>;
}

export function AddTruckModal({ isOpen, onClose, onAddTruck }: AddTruckModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<AddTruckFormValues>({
    resolver: zodResolver(truckSchema),
    mode: 'onChange',
    defaultValues: {
      make: '',
      model: '',
      plateNumber: '',
      vin: '',
      year: new Date().getFullYear(),
      currentMileage: 0,
      serviceName: 'Vidange & Révision Moteur Complète',
      intervalKm: 15000,
    },
  });

  if (!isOpen) return null;

  const handleFormSubmit = async (values: AddTruckFormValues) => {
    try {
      setIsSubmitting(true);

      const generatedId = `v-${Date.now()}`;
      const nextDueMileage = values.currentMileage + values.intervalKm;

      const newVehicle: VehicleWithComputed = {
        id: generatedId,
        vin: values.vin,
        plateNumber: values.plateNumber,
        make: values.make,
        model: values.model,
        year: values.year,
        currentMileage: values.currentMileage,
        status: 'ACTIVE',
        computedStatus: 'ACTIVE',
        tenantId: '00000000-0000-0000-0000-000000000001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        maintenanceSchedules: [
          {
            id: `s-${Date.now()}`,
            vehicleId: generatedId,
            serviceName: values.serviceName,
            intervalKm: values.intervalKm,
            intervalMonths: 6,
            lastServiceMileage: values.currentMileage,
            nextDueMileage,
            nextDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      };

      await onAddTruck(newVehicle);
      reset();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Ajouter un Véhicule à la Flotte</h2>
              <p className="text-xs text-zinc-400">
                Enregistrement dans l’organisation locataire <span className="text-indigo-300 font-medium">Apex Global Logistics</span>
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

        {/* Formulaire */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Marque */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-zinc-400" />
                <span>Marque du Camion</span>
              </label>
              <Input
                placeholder="ex. Volvo, Scania, Renault"
                error={!!errors.make}
                {...register('make')}
                autoFocus
              />
              {errors.make && (
                <p className="text-[11px] text-rose-400">{errors.make.message}</p>
              )}
            </div>

            {/* Modèle */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Modèle</label>
              <Input
                placeholder="ex. FH16, Actros 1845, T-High"
                error={!!errors.model}
                {...register('model')}
              />
              {errors.model && (
                <p className="text-[11px] text-rose-400">{errors.model.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Plaque d'immatriculation */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Immatriculation</span>
                </span>
                <span className="text-[10px] text-indigo-400 font-mono">99999-A-20</span>
              </label>
              <Input
                placeholder="ex. 99999-A-20"
                className="font-mono uppercase tracking-wider"
                error={!!errors.plateNumber}
                {...register('plateNumber')}
              />
              {errors.plateNumber && (
                <p className="text-[11px] text-rose-400">{errors.plateNumber.message}</p>
              )}
            </div>

            {/* Année */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span>Année</span>
              </label>
              <Input
                type="number"
                placeholder="2024"
                error={!!errors.year}
                {...register('year')}
              />
              {errors.year && (
                <p className="text-[11px] text-rose-400">{errors.year.message}</p>
              )}
            </div>

            {/* Kilométrage initial */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-zinc-400" />
                <span>Compteur initial (km)</span>
              </label>
              <Input
                type="number"
                placeholder="0"
                error={!!errors.currentMileage}
                {...register('currentMileage')}
              />
              {errors.currentMileage && (
                <p className="text-[11px] text-rose-400">{errors.currentMileage.message}</p>
              )}
            </div>
          </div>

          {/* Numéro de châssis / VIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-zinc-400" />
              <span>Numéro de Châssis (VIN - 17 caractères)</span>
            </label>
            <Input
              placeholder="ex. 1HD1KT112FY987654"
              className="font-mono uppercase tracking-wider text-xs"
              error={!!errors.vin}
              {...register('vin')}
            />
            {errors.vin && (
              <p className="text-[11px] text-rose-400">{errors.vin.message}</p>
            )}
          </div>

          {/* Configuration initiale de maintenance préventive */}
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Wrench className="h-4 w-4 text-indigo-400" />
              <span>Calendrier de Révision Initiale (Recommandé)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Prestation d&apos;Entretien</label>
                <Input
                  className="h-8 text-xs"
                  placeholder="ex. Vidange & Filtres"
                  {...register('serviceName')}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Intervalle de Révision (km)</label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono"
                  placeholder="15000"
                  {...register('intervalKm')}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Enregistrer le Véhicule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
