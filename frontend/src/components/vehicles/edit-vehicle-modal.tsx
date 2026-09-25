'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Edit3, Truck, X, Hash, Calendar, CheckCircle2 } from 'lucide-react';
import { VehicleWithComputed, ComputedStatus } from '@/types/fleet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const editTruckSchema = z.object({
  make: z.string().min(2, 'La marque doit comporter au moins 2 caractères'),
  model: z.string().min(2, 'Le modèle est requis'),
  plateNumber: z
    .string()
    .min(1, 'Plaque requise')
    .transform((val) => val.trim().toUpperCase())
    .refine(
      (val) => /^\d{1,5}-[A-Z\u0600-\u06FF]-\d{1,2}$/.test(val),
      {
        message: 'Format attendu : 99999-A-20 (ex. 12345-A-20 ou 99999-A-20)',
      },
    ),
  year: z.coerce.number().int().min(1995).max(new Date().getFullYear() + 2),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']),
});

type EditTruckFormValues = z.infer<typeof editTruckSchema>;

interface EditVehicleModalProps {
  vehicle: VehicleWithComputed | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateVehicle: (updated: VehicleWithComputed) => Promise<void>;
}

export function EditVehicleModal({
  vehicle,
  isOpen,
  onClose,
  onUpdateVehicle,
}: EditVehicleModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<EditTruckFormValues>({
    resolver: zodResolver(editTruckSchema),
    mode: 'onChange',
    defaultValues: {
      make: vehicle?.make ?? '',
      model: vehicle?.model ?? '',
      plateNumber: vehicle?.plateNumber ?? '',
      year: vehicle?.year ?? new Date().getFullYear(),
      status: (vehicle?.status ?? 'ACTIVE') as any,
    },
  });

  React.useEffect(() => {
    if (vehicle) {
      reset({
        make: vehicle.make,
        model: vehicle.model,
        plateNumber: vehicle.plateNumber,
        year: vehicle.year,
        status: vehicle.status as any,
      });
    }
  }, [vehicle, reset]);

  if (!isOpen || !vehicle) return null;

  const handleFormSubmit = async (values: EditTruckFormValues) => {
    try {
      setIsSubmitting(true);

      const updated: VehicleWithComputed = {
        ...vehicle,
        make: values.make,
        model: values.model,
        plateNumber: values.plateNumber,
        year: values.year,
        status: values.status,
        computedStatus: (values.status === 'MAINTENANCE'
          ? 'MAINTENANCE'
          : values.status === 'INACTIVE'
          ? 'INACTIVE'
          : vehicle.computedStatus === 'DUE_SOON'
          ? 'DUE_SOON'
          : 'ACTIVE') as ComputedStatus,
      };

      await onUpdateVehicle(updated);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Modifier la Fiche du Véhicule</h3>
              <p className="text-xs text-zinc-400 font-mono">VIN : {vehicle.vin}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Marque</label>
              <Input placeholder="Volvo" error={!!errors.make} {...register('make')} />
              {errors.make && <p className="text-[11px] text-rose-400">{errors.make.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Modèle</label>
              <Input placeholder="FH16" error={!!errors.model} {...register('model')} />
              {errors.model && <p className="text-[11px] text-rose-400">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex justify-between">
                <span>Immatriculation</span>
                <span className="text-[10px] text-indigo-400 font-mono">99999-A-20</span>
              </label>
              <Input
                placeholder="10482-A-20"
                className="font-mono uppercase"
                error={!!errors.plateNumber}
                {...register('plateNumber')}
              />
              {errors.plateNumber && (
                <p className="text-[11px] text-rose-400">{errors.plateNumber.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Année</label>
              <Input type="number" error={!!errors.year} {...register('year')} />
              {errors.year && <p className="text-[11px] text-rose-400">{errors.year.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Statut d&apos;Exploitation</label>
            <select
              {...register('status')}
              className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ACTIVE">ACTIF (En circulation opérationnelle)</option>
              <option value="MAINTENANCE">EN MAINTENANCE (Immobilisé atelier)</option>
              <option value="INACTIVE">INACTIF (Consigné / Hors service)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!isValid}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Enregistrer les Modifications
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
