import { VehicleWithComputed, ComputedStatus, Vehicle } from '@/types/fleet';
import { VehicleTableClient } from './vehicle-table-client';

async function fetchTenantVehicles(): Promise<VehicleWithComputed[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/vehicles`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data: Vehicle[] = await res.json();
      return data.map(computeVehicleMetrics);
    }
  } catch (error) {
    console.info('[Composant Serveur] Utilisation du jeu de données démo locataire');
  }

  // Flotte modèle avec libellés en français
  const fallbackVehicles: (Vehicle & { maintenanceSchedules: any[] })[] = [
    {
      id: 'v-101',
      vin: '1HD1KT112FY123456',
      plateNumber: '10482-A-20',
      make: 'Volvo',
      model: 'VNL 860 Grand Routier',
      year: 2023,
      currentMileage: 49500,
      status: 'ACTIVE',
      tenantId: '00000000-0000-0000-0000-000000000001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      maintenanceSchedules: [
        {
          id: 's-1',
          vehicleId: 'v-101',
          serviceName: 'Vidange & Remplacement des Filtres',
          intervalKm: 10000,
          intervalMonths: 6,
          lastServiceMileage: 40000,
          lastServiceDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
          nextDueMileage: 50000, // Dans 500 km -> ENTRETIEN PROCHE !
          nextDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: 'v-102',
      vin: '2C3CDXHG8NH192834',
      plateNumber: '58291-B-20',
      make: 'Freightliner',
      model: 'Cascadia 126',
      year: 2022,
      currentMileage: 82400,
      status: 'MAINTENANCE',
      tenantId: '00000000-0000-0000-0000-000000000001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      maintenanceSchedules: [
        {
          id: 's-2',
          vehicleId: 'v-102',
          serviceName: 'Révision du Freinage Pneumatique',
          intervalKm: 40000,
          intervalMonths: 12,
          lastServiceMileage: 42000,
          nextDueMileage: 82000, // 400 km de retard -> EN MAINTENANCE !
          nextDueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: 'v-103',
      vin: '3FTNE3Y89PK847291',
      plateNumber: '34910-D-20',
      make: 'Ford',
      model: 'F-550 Super Duty',
      year: 2024,
      currentMileage: 14200,
      status: 'ACTIVE',
      tenantId: '00000000-0000-0000-0000-000000000001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      maintenanceSchedules: [
        {
          id: 's-3',
          vehicleId: 'v-103',
          serviceName: 'Permutation & Équilibrage des Pneus',
          intervalKm: 15000,
          intervalMonths: 6,
          lastServiceMileage: 0,
          nextDueMileage: 25000, // ACTIF
          nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: 'v-104',
      vin: '1FT8W3BT9NEC28190',
      plateNumber: '99999-A-20',
      make: 'Peterbilt',
      model: '579 Ultraloft',
      year: 2021,
      currentMileage: 119200,
      status: 'ACTIVE',
      tenantId: '00000000-0000-0000-0000-000000000001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      maintenanceSchedules: [
        {
          id: 's-4',
          vehicleId: 'v-104',
          serviceName: 'Vidange Liquide de Transmission',
          intervalKm: 60000,
          intervalMonths: 24,
          lastServiceMileage: 60000,
          nextDueMileage: 120000, // Dans 800 km -> ENTRETIEN PROCHE !
          nextDueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
  ];

  return fallbackVehicles.map(computeVehicleMetrics);
}

function computeVehicleMetrics(vehicle: Vehicle): VehicleWithComputed {
  let computedStatus: ComputedStatus = 'ACTIVE';

  if (vehicle.status === 'MAINTENANCE') {
    computedStatus = 'MAINTENANCE';
  } else if (vehicle.status === 'INACTIVE') {
    computedStatus = 'INACTIVE';
  } else {
    const schedules = vehicle.maintenanceSchedules || [];
    const now = new Date();

    for (const schedule of schedules) {
      const isMileageOverdue =
        schedule.nextDueMileage !== null &&
        schedule.nextDueMileage !== undefined &&
        vehicle.currentMileage >= schedule.nextDueMileage;

      const isDateOverdue =
        schedule.nextDueDate && new Date(schedule.nextDueDate) <= now;

      if (isMileageOverdue || isDateOverdue) {
        computedStatus = 'MAINTENANCE';
        break;
      }

      const isMileageDueSoon =
        schedule.nextDueMileage !== null &&
        schedule.nextDueMileage !== undefined &&
        schedule.nextDueMileage - vehicle.currentMileage <= 1000;

      const fourteenDaysFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const isDateDueSoon =
        schedule.nextDueDate &&
        new Date(schedule.nextDueDate) <= fourteenDaysFromNow;

      if (isMileageDueSoon || isDateDueSoon) {
        computedStatus = 'DUE_SOON';
      }
    }
  }

  return {
    ...vehicle,
    computedStatus,
  };
}

export async function VehicleTable() {
  const vehicles = await fetchTenantVehicles();

  return <VehicleTableClient initialVehicles={vehicles} />;
}
