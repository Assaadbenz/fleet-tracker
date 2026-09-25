import * as React from 'react';
import { Suspense } from 'react';
import { Truck, ShieldCheck, Building2, UserCheck } from 'lucide-react';
import { VehicleTable } from '@/components/vehicles/vehicle-table';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import Loading from './loading';

export default function FleetDashboardPage() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Effets lumineux d'arrière-plan */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[128px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-blue-600/5 blur-[160px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation & En-tête de l'organisation locataire dynamique */}
        <DashboardHeader />

        {/* Dashboard Shell avec onglets interactifs et commutation de vues */}
        <DashboardShell
          vehicleTableSlot={
            <Suspense fallback={<Loading />}>
              <VehicleTable />
            </Suspense>
          }
        />
      </div>
    </div>
  );
}
