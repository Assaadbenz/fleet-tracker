'use client';

import * as React from 'react';
import { Fuel, X, AlertCircle, CheckCircle2, Gauge, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VehicleWithComputed, FuelLog } from '@/types/fleet';
import { formatNumber } from '@/lib/utils';

interface LogFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleWithComputed[];
  selectedVehicle?: VehicleWithComputed | null;
  onFuelLogged?: (fuelLog: FuelLog) => void;
}

export function LogFuelModal({
  isOpen,
  onClose,
  vehicles,
  selectedVehicle,
  onFuelLogged,
}: LogFuelModalProps) {
  const [vehicleId, setVehicleId] = React.useState<string>(selectedVehicle?.id || vehicles[0]?.id || '');
  const [liters, setLiters] = React.useState<string>('120');
  const [totalCost, setTotalCost] = React.useState<string>('1620');
  const [odometer, setOdometer] = React.useState<string>(
    selectedVehicle ? String(selectedVehicle.currentMileage + 350) : '50000',
  );
  const [stationName, setStationName] = React.useState<string>('Afriquia');
  const [fuelType, setFuelType] = React.useState<string>('DIESEL_10PPM');
  const [fullTank, setFullTank] = React.useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (selectedVehicle) {
      setVehicleId(selectedVehicle.id);
      setOdometer(String(selectedVehicle.currentMileage + 300));
    } else if (vehicles.length > 0 && !vehicleId) {
      setVehicleId(vehicles[0].id);
      setOdometer(String(vehicles[0].currentMileage + 300));
    }
  }, [selectedVehicle, vehicles, vehicleId]);

  if (!isOpen) return null;

  const activeVehicle = vehicles.find((v) => v.id === vehicleId);
  const numLiters = parseFloat(liters) || 0;
  const numCost = parseFloat(totalCost) || 0;
  const unitPrice = numLiters > 0 ? (numCost / numLiters).toFixed(2) : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numOdo = parseInt(odometer, 10);
    if (!activeVehicle) {
      setError('Veuillez sélectionner un véhicule.');
      return;
    }
    if (isNaN(numOdo) || numOdo < activeVehicle.currentMileage) {
      setError(
        `Le compteur (${numOdo} km) ne peut pas être inférieur au kilométrage actuel (${activeVehicle.currentMileage} km).`,
      );
      return;
    }
    if (numLiters <= 0 || numCost <= 0) {
      setError('Le volume et le coût total doivent être supérieurs à 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newLog: FuelLog = {
        id: `fl-${Date.now()}`,
        vehicleId: activeVehicle.id,
        liters: numLiters,
        totalCost: numCost,
        odometer: numOdo,
        fuelType,
        fullTank,
        stationName,
        recordedAt: new Date().toISOString(),
      };

      if (onFuelLogged) {
        onFuelLogged(newLog);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l’enregistrement du ravitaillement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0d0e12] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Fuel className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Enregistrement Ravitaillement Carburant
              </h3>
              <p className="text-xs text-zinc-400">
                Suivi de la consommation volumétrique et calcul de rendement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Véhicule */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Véhicule Assigné
            </label>
            <select
              value={vehicleId}
              onChange={(e) => {
                setVehicleId(e.target.value);
                const veh = vehicles.find((v) => v.id === e.target.value);
                if (veh) setOdometer(String(veh.currentMileage + 250));
              }}
              className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} — {v.make} {v.model} ({formatNumber(v.currentMileage)} km)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Litres */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Volume (Litres)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  required
                  placeholder="ex. 150"
                  className="pl-8 bg-zinc-900 border-zinc-800 text-xs font-mono"
                />
                <Fuel className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-3" />
              </div>
            </div>

            {/* Coût Total */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Montant Total (MAD)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.5"
                  min="1"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  required
                  placeholder="ex. 1850"
                  className="pl-8 bg-zinc-900 border-zinc-800 text-xs font-mono"
                />
                <DollarSign className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Prix indicatif calculé */}
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Prix unitaire calculé :</span>
            <span className="font-mono font-semibold text-amber-400">
              {unitPrice} MAD / Litre
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Odomètre */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Compteur Odométrique (km)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  required
                  placeholder="Kilométrage relevé"
                  className="pl-8 bg-zinc-900 border-zinc-800 text-xs font-mono"
                />
                <Gauge className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-3" />
              </div>
            </div>

            {/* Station */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Réseau / Station
              </label>
              <select
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Afriquia">Afriquia</option>
                <option value="TotalEnergies">TotalEnergies</option>
                <option value="Shell">Shell</option>
                <option value="Winxo">Winxo</option>
                <option value="Petrom">Petrom</option>
                <option value="Ola Energy">Ola Energy</option>
              </select>
            </div>
          </div>

          {/* Full Tank Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="fullTankCheckbox"
              checked={fullTank}
              onChange={(e) => setFullTank(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-0"
            />
            <label htmlFor="fullTankCheckbox" className="text-xs text-zinc-300 cursor-pointer">
              Plein complet (permet le calcul exact du L/100km)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs h-9 px-4 rounded-xl border-zinc-700 hover:bg-zinc-800"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium"
            >
              {isSubmitting ? 'Validation...' : 'Enregistrer le Ravitaillement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
