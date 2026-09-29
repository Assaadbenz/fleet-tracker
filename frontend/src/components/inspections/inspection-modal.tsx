'use client';

import * as React from 'react';
import {
  ShieldCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  Gauge,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DriverInspection } from '@/types/fleet';

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  defaultPlate?: string;
  onInspectionCompleted?: (inspection: DriverInspection) => void;
}

export function InspectionModal({
  isOpen,
  onClose,
  driverName = 'Mustapha El Alami',
  defaultPlate = '10482-A-20',
  onInspectionCompleted,
}: InspectionModalProps) {
  const [plate, setPlate] = React.useState<string>(defaultPlate);
  const [odometer, setOdometer] = React.useState<string>('49500');
  const [brakesPass, setBrakesPass] = React.useState<boolean>(true);
  const [tiresPass, setTiresPass] = React.useState<boolean>(true);
  const [lightsPass, setLightsPass] = React.useState<boolean>(true);
  const [fluidsPass, setFluidsPass] = React.useState<boolean>(true);
  const [safetyKitPass, setSafetyKitPass] = React.useState<boolean>(true);
  const [notes, setNotes] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    setPlate(defaultPlate);
  }, [defaultPlate]);

  if (!isOpen) return null;

  // Status calculation
  const criticalFailed = !brakesPass || !tiresPass;
  const anyFailed = !brakesPass || !tiresPass || !lightsPass || !fluidsPass || !safetyKitPass;
  const overallStatus: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION' = criticalFailed
    ? 'NON_CONFORME'
    : anyFailed
    ? 'ATTENTION'
    : 'CONFORME';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const inspection: DriverInspection = {
      id: `insp-${Date.now()}`,
      driverId: `drv-${Date.now()}`,
      driverName,
      vehiclePlate: plate,
      odometer: parseInt(odometer, 10) || 50000,
      brakesPass,
      tiresPass,
      lightsPass,
      fluidsPass,
      safetyKitPass,
      overallStatus,
      notes: notes || undefined,
      inspectedAt: new Date().toISOString(),
    };

    if (onInspectionCompleted) {
      onInspectionCompleted(inspection);
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#0d0e12] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Fiche d&apos;Inspection Sécurité Avant-Départ
              </h3>
              <p className="text-xs text-zinc-400">
                Checklist réglementaire de conformité mécanique et routière
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Indicator Banner */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium ${
            overallStatus === 'CONFORME'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : overallStatus === 'ATTENTION'
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {overallStatus === 'CONFORME' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span>
              Résultat actuel : <strong>{overallStatus}</strong>
              {overallStatus === 'NON_CONFORME' && ' — Véhicule impropre au départ (défaut critique)'}
            </span>
          </div>
          <span className="text-[11px] font-mono opacity-80">Chauffeur: {driverName}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Immatriculation</label>
              <select
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 font-mono"
              >
                <option value="10482-A-20">10482-A-20 (Volvo VNL)</option>
                <option value="58291-B-20">58291-B-20 (Freightliner)</option>
                <option value="34910-D-20">34910-D-20 (Ford F-550)</option>
                <option value="99999-A-20">99999-A-20 (Peterbilt 579)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Kilométrage Compteur</label>
              <Input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                required
                className="h-9 bg-zinc-900 border-zinc-800 text-xs font-mono"
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2 border border-zinc-800 rounded-xl p-3 bg-zinc-900/40">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Points de contrôle obligatoires
            </div>

            {[
              {
                id: 'brakes',
                label: 'Système de freinage & flexibles pneumatiques',
                pass: brakesPass,
                setPass: setBrakesPass,
                critical: true,
              },
              {
                id: 'tires',
                label: 'Pneumatiques (pression & témoins d’usure)',
                pass: tiresPass,
                setPass: setTiresPass,
                critical: true,
              },
              {
                id: 'lights',
                label: 'Éclairage, feux de gabarit & signalisation',
                pass: lightsPass,
                setPass: setLightsPass,
                critical: false,
              },
              {
                id: 'fluids',
                label: 'Niveaux fluides (Huile, Refroidissement, AdBlue)',
                pass: fluidsPass,
                setPass: setFluidsPass,
                critical: false,
              },
              {
                id: 'safetyKit',
                label: 'Kit d’urgence (Extincteur, triangles, gilets)',
                pass: safetyKitPass,
                setPass: setSafetyKitPass,
                critical: false,
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-zinc-200">{item.label}</span>
                  {item.critical && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-400 font-semibold">
                      CRITIQUE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => item.setPass(true)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      item.pass
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Conforme
                  </button>
                  <button
                    type="button"
                    onClick={() => item.setPass(false)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      !item.pass
                        ? 'bg-rose-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Défaut
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Observations */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">
              Observations ou anomalies constatées
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Légère trace de frottement sur le pneu arrière droit..."
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
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
              className="text-xs h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              {isSubmitting ? 'Validation...' : 'Valider l’Inspection'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
