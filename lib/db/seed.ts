import { db } from "./index";
import { users, documents, notifications, systemSettings } from "./schema";

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Insert admin user
    const adminUser = await db.insert(users).values({
      email: "admin@kmrl.gov.in",
      name: "KMRL Admin",
      role: "admin",
      department: "IT Department",
    }).returning();

    // Insert employee user
    const employeeUser = await db.insert(users).values({
      email: "employee@kmrl.gov.in",
      name: "KMRL Employee",
      role: "employee",
      department: "Operations",
    }).returning();

    // Insert sample documents
    await db.insert(documents).values([
      {
        title: "KMRL Safety Guidelines",
        description: "Comprehensive safety guidelines for metro operations",
        filePath: "/documents/safety-guidelines.pdf",
        fileName: "safety-guidelines.pdf",
        fileSize: 2048000,
        mimeType: "application/pdf",
        category: "Safety",
        tags: JSON.stringify(["safety", "guidelines", "operations"]),
        uploadedBy: adminUser[0].id,
      },
      {
        title: "Employee Handbook 2025",
        description: "Updated employee handbook with new policies",
        filePath: "/documents/employee-handbook-2025.pdf",
        fileName: "employee-handbook-2025.pdf",
        fileSize: 1024000,
        mimeType: "application/pdf",
        category: "HR",
        tags: JSON.stringify(["hr", "handbook", "policies"]),
        uploadedBy: adminUser[0].id,
      },
      {
        title: "Metro Schedule Template",
        description: "Template for metro scheduling and timetables",
        filePath: "/documents/schedule-template.xlsx",
        fileName: "schedule-template.xlsx",
        fileSize: 512000,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        category: "Operations",
        tags: JSON.stringify(["schedule", "template", "timetable"]),
        uploadedBy: employeeUser[0].id,
      },
    ]);

    // Insert notifications
    await db.insert(notifications).values([
      {
        userId: employeeUser[0].id,
        title: "Welcome to KMRL Document System",
        message: "Your account has been created successfully. Please review the safety guidelines.",
        type: "info",
      },
      {
        userId: adminUser[0].id,
        title: "System Update",
        message: "Database has been successfully initialized with sample data.",
        type: "success",
      },
    ]);

    // Insert system settings
    await db.insert(systemSettings).values([
      {
        key: "max_file_size",
        value: "10485760", // 10MB
        description: "Maximum file size allowed for uploads (in bytes)",
        updatedBy: adminUser[0].id,
      },
      {
        key: "allowed_file_types",
        value: JSON.stringify(["pdf", "doc", "docx", "xls", "xlsx", "txt", "jpg", "png"]),
        description: "Allowed file types for document uploads",
        updatedBy: adminUser[0].id,
      },
    ]);

    console.log("✅ Database seeded successfully!");
    console.log("👤 Admin user: admin@kmrl.gov.in");
    console.log("👤 Employee user: employee@kmrl.gov.in");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log("🏁 Seeding completed");
    process.exit(0);
  });
}