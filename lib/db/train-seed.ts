import { trainDb } from "./train-db";
import { 
  trainsets, 
  fitnessCertificates, 
  jobCards, 
  brandingPriorities, 
  cleaningSlots, 
  stablingGeometry, 
  inductionPlans, 
  trainUsers 
} from "./train-schema";

export async function seedTrainDatabase() {
  try {
    console.log("🚂 Seeding train database...");

    // Insert train users
    const adminUser = await trainDb.insert(trainUsers).values({
      name: "Train Admin",
      role: "Admin",
      email: "trainadmin@kmrl.gov.in",
      passwordHash: "hashed_password_here", // In real app, hash properly
    }).returning();

    const plannerUser = await trainDb.insert(trainUsers).values({
      name: "Train Planner",
      role: "Planner", 
      email: "planner@kmrl.gov.in",
      passwordHash: "hashed_password_here",
    }).returning();

    // Insert trainsets (sample 5 trainsets)
    const trainsetData = await trainDb.insert(trainsets).values([
      {
        serialNo: "TS001",
        status: "Active",
        mileageKm: 15000,
        lastServiceDate: new Date("2024-09-15"),
      },
      {
        serialNo: "TS002", 
        status: "Active",
        mileageKm: 12000,
        lastServiceDate: new Date("2024-09-20"),
      },
      {
        serialNo: "TS003",
        status: "Maintenance",
        mileageKm: 18000,
        lastServiceDate: new Date("2024-08-30"),
      },
      {
        serialNo: "TS004",
        status: "Standby",
        mileageKm: 8000,
        lastServiceDate: new Date("2024-09-25"),
      },
      {
        serialNo: "TS005",
        status: "Active", 
        mileageKm: 22000,
        lastServiceDate: new Date("2024-09-10"),
      },
    ]).returning();

    // Insert fitness certificates
    const fitnessData = [];
    for (const trainset of trainsetData) {
      // RollingStock certificate
      fitnessData.push({
        trainsetId: trainset.trainsetId,
        dept: "RollingStock" as const,
        validFrom: new Date("2024-09-01"),
        validTo: new Date("2024-12-01"),
        status: "Valid" as const,
      });
      
      // Signalling certificate  
      fitnessData.push({
        trainsetId: trainset.trainsetId,
        dept: "Signalling" as const,
        validFrom: new Date("2024-09-01"),
        validTo: new Date("2024-11-15"),
        status: "Valid" as const,
      });
      
      // Telecom certificate
      fitnessData.push({
        trainsetId: trainset.trainsetId,
        dept: "Telecom" as const,
        validFrom: new Date("2024-08-15"),
        validTo: new Date("2024-11-30"),
        status: trainset.serialNo === "TS003" ? "Expired" as const : "Valid" as const,
      });
    }
    
    await trainDb.insert(fitnessCertificates).values(fitnessData);

    // Insert job cards
    await trainDb.insert(jobCards).values([
      {
        trainsetId: trainsetData[2].trainsetId, // TS003 in maintenance
        description: "Monthly preventive maintenance - brake system check",
        status: "InProgress",
        raisedDate: new Date("2024-09-25"),
      },
      {
        trainsetId: trainsetData[0].trainsetId, // TS001
        description: "Minor repair - door sensor malfunction",
        status: "Open",
        raisedDate: new Date("2024-10-01"),
      },
      {
        trainsetId: trainsetData[4].trainsetId, // TS005
        description: "Quarterly inspection - complete system check",
        status: "Closed",
        raisedDate: new Date("2024-09-01"),
        closedDate: new Date("2024-09-10"),
      },
    ]);

    // Insert branding priorities
    await trainDb.insert(brandingPriorities).values([
      {
        trainsetId: trainsetData[0].trainsetId,
        campaignName: "Kerala Tourism - God's Own Country",
        allocatedHours: 200,
        consumedHours: 150,
        startDate: new Date("2024-08-01"),
        endDate: new Date("2024-11-30"),
      },
      {
        trainsetId: trainsetData[1].trainsetId,
        campaignName: "Technopark IT Hub",
        allocatedHours: 180,
        consumedHours: 90,
        startDate: new Date("2024-09-01"),
        endDate: new Date("2024-12-31"),
      },
    ]);

    // Insert cleaning slots
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0); // 6 AM tomorrow

    await trainDb.insert(cleaningSlots).values([
      {
        trainsetId: trainsetData[0].trainsetId,
        cleaningType: "Daily",
        slotTime: tomorrow,
        manpowerRequired: 4,
        manpowerAllocated: 4,
      },
      {
        trainsetId: trainsetData[1].trainsetId,
        cleaningType: "Deep",
        slotTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // 8 AM
        manpowerRequired: 8,
        manpowerAllocated: 6,
      },
    ]);

    // Insert stabling geometry
    await trainDb.insert(stablingGeometry).values([
      {
        trainsetId: trainsetData[0].trainsetId,
        depot: "Depot1",
        bayNo: 1,
        positionOrder: 1,
        isReadyForTurnout: true,
      },
      {
        trainsetId: trainsetData[1].trainsetId,
        depot: "Depot1", 
        bayNo: 1,
        positionOrder: 2,
        isReadyForTurnout: false,
      },
      {
        trainsetId: trainsetData[2].trainsetId,
        depot: "Depot2",
        bayNo: 3,
        positionOrder: 1,
        isReadyForTurnout: false, // In maintenance
      },
    ]);

    // Insert sample induction plans
    const today = new Date();
    await trainDb.insert(inductionPlans).values([
      {
        date: today,
        trainsetId: trainsetData[0].trainsetId,
        decision: "Service",
        reason: "All fitness certificates valid, branding hours pending completion, optimal mileage",
      },
      {
        date: today,
        trainsetId: trainsetData[1].trainsetId, 
        decision: "Service",
        reason: "Valid certificates, new branding campaign active, good maintenance status",
      },
      {
        date: today,
        trainsetId: trainsetData[2].trainsetId,
        decision: "Maintenance", 
        reason: "Telecom fitness expired, preventive maintenance in progress",
      },
      {
        date: today,
        trainsetId: trainsetData[3].trainsetId,
        decision: "Standby",
        reason: "Low mileage, all certificates valid, available for emergency service",
      },
    ]);

    console.log("✅ Train database seeded successfully!");
    console.log(`📊 Created:`);
    console.log(`   - ${trainsetData.length} trainsets (TS001-TS005)`);
    console.log(`   - ${fitnessData.length} fitness certificates`);
    console.log(`   - 3 job cards`);
    console.log(`   - 2 branding campaigns`);
    console.log(`   - 2 cleaning slots`);
    console.log(`   - 3 stabling positions`);
    console.log(`   - 4 induction plans for today`);
    console.log(`👤 Train Admin: trainadmin@kmrl.gov.in`);
    console.log(`👤 Train Planner: planner@kmrl.gov.in`);
    
  } catch (error) {
    console.error("❌ Error seeding train database:", error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedTrainDatabase().then(() => {
    console.log("🏁 Train database seeding completed");
    process.exit(0);
  });
}