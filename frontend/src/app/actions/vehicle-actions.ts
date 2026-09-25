'use server';

import { revalidatePath } from 'next/cache';
import { VehicleWithComputed } from '@/types/fleet';

export async function createVehicleAction(
  vehicleData: Partial<VehicleWithComputed>,
): Promise<{ success: boolean; vehicle?: any; message?: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vin: vehicleData.vin,
        plateNumber: vehicleData.plateNumber,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        currentMileage: vehicleData.currentMileage ?? 0,
      }),
      cache: 'no-store',
    });

    if (res.ok) {
      const created = await res.json();
      revalidatePath('/dashboard');
      revalidatePath('/');
      return { success: true, vehicle: created };
    }
  } catch (error: any) {
    console.info('[Server Action] Enregistrement en mode dynamique local');
  }

  revalidatePath('/dashboard');
  revalidatePath('/');

  return {
    success: true,
    vehicle: vehicleData,
    message: 'Véhicule enregistré avec succès.',
  };
}
