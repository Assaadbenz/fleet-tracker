import { PrismaClient, UserRole, VehicleStatus, WorkOrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Multi-Tenant Fleet Database ---');

  // 1. Create Demo Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Apex Global Logistics',
    },
  });
  console.log(`Tenant created: ${tenant.name} (${tenant.id})`);

  // 2. Hash default credentials
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('FleetAdmin2026!', salt);

  // 3. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@apexlogistics.com' },
    update: {},
    create: {
      email: 'admin@apexlogistics.com',
      passwordHash,
      role: UserRole.ADMIN,
      tenantId: tenant.id,
    },
  });
  console.log(`Admin user: ${admin.email} (Role: ${admin.role})`);

  // 4. Create Driver User
  const driver = await prisma.user.upsert({
    where: { email: 'driver@apexlogistics.com' },
    update: {},
    create: {
      email: 'driver@apexlogistics.com',
      passwordHash,
      role: UserRole.DRIVER,
      tenantId: tenant.id,
    },
  });
  console.log(`Driver user: ${driver.email} (Role: ${driver.role})`);

  // 5. Create Vehicle
  const vehicle = await prisma.vehicle.upsert({
    where: {
      tenantId_vin: {
        tenantId: tenant.id,
        vin: '1HD1KT112FY123456',
      },
    },
    update: {},
    create: {
      vin: '1HD1KT112FY123456',
      plateNumber: 'APX-7742',
      make: 'Volvo',
      model: 'VNL 860',
      year: 2023,
      currentMileage: 49500,
      status: VehicleStatus.ACTIVE,
      tenantId: tenant.id,
    },
  });
  console.log(`Vehicle created: ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber}) - Mileage: ${vehicle.currentMileage} km`);

  // 6. Create Maintenance Schedule approaching threshold
  const schedule = await prisma.maintenanceSchedule.create({
    data: {
      tenantId: tenant.id,
      vehicleId: vehicle.id,
      serviceName: 'Engine Oil & Filter Replacement',
      intervalKm: 10000,
      intervalMonths: 6,
      lastServiceMileage: 40000,
      lastServiceDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // ~5 months ago
      nextDueMileage: 50000, // Due in 500 km
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due in 30 days
    },
  });
  console.log(`Maintenance schedule created: "${schedule.serviceName}" (Due at ${schedule.nextDueMileage} km)`);

  console.log('--- Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
