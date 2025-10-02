// Database insertion utilities for cleaned data
import { trainDb } from '@/lib/db/train-db';
import { trainsets, jobCards, systemAlerts } from '@/lib/db/train-schema';
import { eq, and } from 'drizzle-orm';
import type { CleanedRecord } from '@/lib/data-cleaning';

export interface InsertionResult {
  success: boolean;
  insertedCount: number;
  skippedCount: number;
  errors: string[];
  details: {
    trainsets: number;
    jobCards: number;
    alerts: number;
  };
}

/**
 * Insert maintenance data into job_cards table
 */
export async function insertMaintenanceData(cleanedRecords: CleanedRecord[]): Promise<InsertionResult> {
  const result: InsertionResult = {
    success: true,
    insertedCount: 0,
    skippedCount: 0,
    errors: [],
    details: { trainsets: 0, jobCards: 0, alerts: 0 }
  };

  for (const record of cleanedRecords) {
    if (!record.isValid) {
      result.skippedCount++;
      result.errors.push(`Skipped invalid record: ${record.errors.join(', ')}`);
      continue;
    }

    try {
      const cleaned = record.cleaned;
      
      // Step 1: Ensure trainset exists or create it
      let trainsetId = await ensureTrainsetExists(cleaned.trainId);
      if (!trainsetId) {
        result.errors.push(`Failed to create/find trainset for ID: ${cleaned.trainId}`);
        result.skippedCount++;
        continue;
      }
      
      // Step 2: Create job card for maintenance
      const jobCardData = {
        trainsetId,
        description: `${cleaned.maintenanceType} - ${cleaned.remarks || 'Maintenance task'}`,
        status: mapMaintenanceStatusToJobStatus(cleaned.status),
        raisedDate: new Date(cleaned.lastMaintenanceDate),
        closedDate: cleaned.status === 'Completed' ? new Date() : null
      };

      await trainDb.insert(jobCards).values(jobCardData);
      result.details.jobCards++;
      
      // Step 3: Create system alert for overdue maintenance
      if (cleaned.status === 'Overdue') {
        const alertData = {
          trainsetId,
          type: 'Critical' as const,
          title: `Overdue Maintenance: ${cleaned.maintenanceType}`,
          message: `Train ${cleaned.trainId} has overdue ${cleaned.maintenanceType}. Due date was ${cleaned.nextDueDate}. ${cleaned.remarks || ''}`,
          priority: 1,
          isRead: false,
          isDismissed: false
        };

        await trainDb.insert(systemAlerts).values(alertData);
        result.details.alerts++;
      }

      result.insertedCount++;
      
    } catch (error) {
      result.errors.push(`Failed to insert record for ${record.cleaned.trainId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.skippedCount++;
      result.success = false;
    }
  }

  return result;
}

/**
 * Insert trainset data into trainsets table
 */
export async function insertTrainsetData(cleanedRecords: CleanedRecord[]): Promise<InsertionResult> {
  const result: InsertionResult = {
    success: true,
    insertedCount: 0,
    skippedCount: 0,
    errors: [],
    details: { trainsets: 0, jobCards: 0, alerts: 0 }
  };

  for (const record of cleanedRecords) {
    if (!record.isValid) {
      result.skippedCount++;
      result.errors.push(`Skipped invalid record: ${record.errors.join(', ')}`);
      continue;
    }

    try {
      const cleaned = record.cleaned;
      
      // Check if trainset already exists
      const existing = await trainDb
        .select()
        .from(trainsets)
        .where(eq(trainsets.serialNo, cleaned.serialNo))
        .limit(1);

      if (existing.length > 0) {
        // Update existing trainset
        await trainDb
          .update(trainsets)
          .set({
            status: cleaned.status,
            mileageKm: cleaned.mileageKm || existing[0].mileageKm,
            lastServiceDate: cleaned.lastServiceDate ? new Date(cleaned.lastServiceDate) : existing[0].lastServiceDate,
            updatedAt: new Date()
          })
          .where(eq(trainsets.serialNo, cleaned.serialNo));
      } else {
        // Create new trainset
        const trainsetData = {
          serialNo: cleaned.serialNo,
          status: cleaned.status || 'Active',
          mileageKm: cleaned.mileageKm || 0,
          lastServiceDate: cleaned.lastServiceDate ? new Date(cleaned.lastServiceDate) : null
        };

        await trainDb.insert(trainsets).values(trainsetData);
      }

      result.details.trainsets++;
      result.insertedCount++;
      
    } catch (error) {
      result.errors.push(`Failed to insert trainset ${record.cleaned.serialNo}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.skippedCount++;
      result.success = false;
    }
  }

  return result;
}

/**
 * Ensure trainset exists, create if not found
 */
async function ensureTrainsetExists(trainId: string): Promise<number | null> {
  try {
    // First try to find existing trainset
    const existing = await trainDb
      .select()
      .from(trainsets)
      .where(eq(trainsets.serialNo, trainId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].trainsetId;
    }

    // Create new trainset if not found
    const [newTrainset] = await trainDb
      .insert(trainsets)
      .values({
        serialNo: trainId,
        status: 'Active',
        mileageKm: 0
      })
      .returning();

    return newTrainset.trainsetId;
    
  } catch (error) {
    console.error('Error ensuring trainset exists:', error);
    return null;
  }
}

/**
 * Map maintenance status to job card status
 */
function mapMaintenanceStatusToJobStatus(maintenanceStatus: string): 'Open' | 'Closed' | 'InProgress' {
  switch (maintenanceStatus?.toLowerCase()) {
    case 'completed':
      return 'Closed';
    case 'pending':
    case 'overdue':
      return 'Open';
    case 'in progress':
    case 'inprogress':
      return 'InProgress';
    default:
      return 'Open';
  }
}

/**
 * Main function to process and insert cleaned data
 */
export async function insertCleanedData(
  cleanedRecords: CleanedRecord[],
  dataType: 'maintenance' | 'trainset'
): Promise<InsertionResult> {
  switch (dataType) {
    case 'maintenance':
      return await insertMaintenanceData(cleanedRecords);
    case 'trainset':
      return await insertTrainsetData(cleanedRecords);
    default:
      return {
        success: false,
        insertedCount: 0,
        skippedCount: cleanedRecords.length,
        errors: [`Unsupported data type: ${dataType}`],
        details: { trainsets: 0, jobCards: 0, alerts: 0 }
      };
  }
}

/**
 * Validate that train IDs exist in database
 */
export async function validateTrainIds(trainIds: string[]): Promise<{
  existing: string[];
  missing: string[];
}> {
  const existing: string[] = [];
  const missing: string[] = [];

  for (const trainId of trainIds) {
    const found = await trainDb
      .select()
      .from(trainsets)
      .where(eq(trainsets.serialNo, trainId))
      .limit(1);

    if (found.length > 0) {
      existing.push(trainId);
    } else {
      missing.push(trainId);
    }
  }

  return { existing, missing };
}