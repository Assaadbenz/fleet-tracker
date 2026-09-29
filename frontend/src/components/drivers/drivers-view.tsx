'use client';

import * as React from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  Truck,
  Phone,
  Mail,
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  Download,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { InspectionModal } from '../inspections/inspection-modal';
import { DriverInspection } from '@/types/fleet';

export interface DriverMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'MANAGER' | 'DRIVER';
  licenseType: string;
  assignedTruckPlate: string;
  status: 'ACTIVE' | 'ON_DUTY' | 'RESTING';
  tripsCompleted: number;
  lastInspectionStatus?: 'CONFORME' | 'NON_CONFORME' | 'ATTENTION';
  lastInspectionDate?: string;
}

const initialDrivers: DriverMember[] = [
  {
    id: 'usr-1',
    name: 'Mustapha El Alami',
    email: 'admin@apexlogistics.com',
    phone: '+212 661-123456',
    role: 'ADMIN',
    licenseType: 'EC (Poids Lourd + Semi-remorque)',
    assignedTruckPlate: '10482-A-20',
    status: 'ACTIVE',
    tripsCompleted: 142,
    lastInspectionStatus: 'CONFORME',
    lastInspectionDate: 'Aujourd’hui 08:30',
  },
  {
    id: 'usr-2',
    name: 'Hassan Benzekri',
    email: 'hassan.b@apexlogistics.com',
    phone: '+212 662-789012',
    role: 'DRIVER',
    licenseType: 'EC (Poids Lourd)',
    assignedTruckPlate: '99999-A-20',
    status: 'ON_DUTY',
    tripsCompleted: 98,
    lastInspectionStatus: 'CONFORME',
    lastInspectionDate: 'Aujourd’hui 06:15',
  },
  {
    id: 'usr-3',
    name: 'Rachid Tazi',
    email: 'rachid.t@apexlogistics.com',
    phone: '+212 663-345678',
    role: 'DRIVER',
    licenseType: 'C (Poids Lourd Rigide)',
    assignedTruckPlate: '34910-D-20',
    status: 'ACTIVE',
    tripsCompleted: 64,
    lastInspectionStatus: 'ATTENTION',
    lastInspectionDate: 'Hier 17:45',
  },
  {
    id: 'usr-4',
    name: 'Tariq Mansouri',
    email: 'tariq.m@apexlogistics.com',
    phone: '+212 664-901234',
    role: 'MANAGER',
    licenseType: 'EC + ADR Matières Dangereuses',
    assignedTruckPlate: '58291-B-20',
    status: 'RESTING',
    tripsCompleted: 185,
    lastInspectionStatus: 'CONFORME',
    lastInspectionDate: 'Il y a 2 jours',
  },
];

export function DriversView() {
  const [drivers, setDrivers] = React.useState<DriverMember[]>(initialDrivers);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = React.useState(false);
  const [inspectionTargetDriver, setInspectionTargetDriver] = React.useState<DriverMember | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // New Driver Form State
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('');
  const [newPlate, setNewPlate] = React.useState('');
  const [newRole, setNewRole] = React.useState<'ADMIN' | 'MANAGER' | 'DRIVER'>('DRIVER');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newMember: DriverMember = {
      id: `usr-${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || '+212 600-000000',
      role: newRole,
      licenseType: 'EC (Poids Lourd)',
      assignedTruckPlate: newPlate ? newPlate.toUpperCase() : 'Non assigné',
      status: 'ACTIVE',
      tripsCompleted: 0,
      lastInspectionStatus: 'CONFORME',
      lastInspectionDate: 'Nouvellement affecté',
    };

    setDrivers([newMember, ...drivers]);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewPlate('');
    setIsModalOpen(false);
    setToastMessage(`Chauffeur ${newMember.name} ajouté avec succès.`);
  };

  const toggleDriverStatus = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d;
        const nextStatus: DriverMember['status'] =
          d.status === 'ACTIVE' ? 'ON_DUTY' : d.status === 'ON_DUTY' ? 'RESTING' : 'ACTIVE';
        return { ...d, status: nextStatus };
      }),
    );
  };

  const handleInspectionCompleted = (inspection: DriverInspection) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (inspectionTargetDriver && d.id === inspectionTargetDriver.id) {
          return {
            ...d,
            lastInspectionStatus: inspection.overallStatus,
            lastInspectionDate: 'À l’instant',
          };
        }
        return d;
      }),
    );
    setToastMessage(
      `Inspection enregistrée pour ${inspection.vehiclePlate} : Résultat ${inspection.overallStatus}.`,
    );
  };

  const handleExportDriversCsv = () => {
    const rows = [
      ['Nom', 'Email', 'Telephone', 'Role', 'Permis', 'CamionAssigne', 'Statut', 'Trajets', 'DerniereInspection'],
      ...drivers.map((d) => [
        `"${d.name}"`,
        d.email,
        d.phone,
        d.role,
        `"${d.licenseType}"`,
        d.assignedTruckPlate,
        d.status,
        d.tripsCompleted.toString(),
        d.lastInspectionStatus || 'N/A',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `equipe_chauffeurs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="underline text-emerald-400 hover:text-emerald-200">
            Fermer
          </button>
        </div>
      )}

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Chauffeurs & Équipe Opérationnelle
          </h2>
          <p className="text-xs text-zinc-400">
            Gestion des conducteurs, vérifications de conformité et fiches de départ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportDriversCsv}
            className="text-xs gap-1.5 border-zinc-700 text-zinc-300 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Exporter CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setInspectionTargetDriver(drivers[0]);
              setIsInspectionModalOpen(true);
            }}
            className="text-xs gap-1.5 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/30"
          >
            <ClipboardCheck className="h-3.5 w-3.5 text-indigo-400" />
            Fiche Inspection Départ
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="gap-2 text-xs"
          >
            <PlusCircle className="h-4 w-4" />
            Ajouter un Chauffeur
          </Button>
        </div>
      </div>

      {/* Drivers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drivers.map((driver) => (
          <div
            key={driver.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4 hover:border-zinc-700 transition-all shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {driver.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 text-sm">{driver.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-mono">{driver.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {driver.role}
                </span>

                <button
                  onClick={() => toggleDriverStatus(driver.id)}
                  title="Cliquer pour changer le statut"
                  className="cursor-pointer group flex items-center gap-1 transition-opacity hover:opacity-80"
                >
                  {driver.status === 'ON_DUTY' ? (
                    <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                      En Trajet
                    </span>
                  ) : driver.status === 'RESTING' ? (
                    <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                      En Repos
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Disponible
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Assignments & Licenses */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/80">
              <div>
                <span className="text-zinc-500 text-[11px]">Véhicule Assigné</span>
                <div className="font-mono font-bold text-zinc-200 flex items-center gap-1.5 mt-0.5">
                  <Truck className="h-3.5 w-3.5 text-indigo-400" />
                  {driver.assignedTruckPlate}
                </div>
              </div>
              <div>
                <span className="text-zinc-500 text-[11px]">Permis de Conduire</span>
                <div className="font-medium text-zinc-300 mt-0.5 text-[11px]">
                  {driver.licenseType}
                </div>
              </div>
            </div>

            {/* Inspection Status Badge */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-xs">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-zinc-400">Contrôle départ :</span>
                <span
                  className={`font-semibold ${
                    driver.lastInspectionStatus === 'CONFORME'
                      ? 'text-emerald-400'
                      : driver.lastInspectionStatus === 'ATTENTION'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {driver.lastInspectionStatus || 'À faire'}
                </span>
                <span className="text-zinc-500 text-[10px]">({driver.lastInspectionDate})</span>
              </div>

              <button
                onClick={() => {
                  setInspectionTargetDriver(driver);
                  setIsInspectionModalOpen(true);
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Inspecter
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-800/60">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-zinc-500" />
                {driver.phone}
              </span>
              <span className="text-zinc-400">
                <strong className="text-zinc-200">{driver.tripsCompleted}</strong> trajets réalisés
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Ajout Chauffeur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" />
                Ajouter un Membre de l&apos;Équipe
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5 text-zinc-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Nom et Prénom</label>
                <Input
                  placeholder="ex. Karim Mansour"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Adresse Email</label>
                <Input
                  type="email"
                  placeholder="karim.m@apexlogistics.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Téléphone</label>
                <Input
                  placeholder="+212 660-123456"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Camion Assigné (Immatriculation)</label>
                <Input
                  placeholder="ex. 99999-A-20"
                  className="font-mono uppercase"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Rôle RBAC</label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="DRIVER">CHAUFFEUR (DRIVER)</option>
                  <option value="MANAGER">GESTIONNAIRE DE FLOTTE (MANAGER)</option>
                  <option value="ADMIN">ADMINISTRATEUR (ADMIN)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Enregistrer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fiche d'Inspection Départ */}
      <InspectionModal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        driverName={inspectionTargetDriver?.name}
        defaultPlate={inspectionTargetDriver?.assignedTruckPlate}
        onInspectionCompleted={handleInspectionCompleted}
      />
    </div>
  );
}
