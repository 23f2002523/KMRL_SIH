// AI-based prediction and automation system for train maintenance
import { trainDb } from '@/lib/db/train-db';
import { trainsets, jobCards, systemAlerts } from '@/lib/db/train-schema';
import { eq, and, gte, lte, desc, asc, count, sql } from 'drizzle-orm';

export interface MaintenancePrediction {
  trainsetId: number;
  trainId: string;
  predictedOverdueDate: Date;
  daysUntilOverdue: number;
  confidence: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
  factors: string[];
}

export interface FailurePattern {
  trainsetId: number;
  trainId: string;
  maintenanceType: string;
  failureCount: number;
  avgDaysBetweenFailures: number;
  lastFailureDate: Date;
  riskScore: number;
  recommendation: string;
}

export interface SmartAlert {
  type: 'PREDICTION' | 'PATTERN' | 'OVERDUE' | 'CRITICAL';
  priority: number; // 1-5 (1 = highest)
  title: string;
  message: string;
  trainsetId: number;
  actionRequired: string;
  estimatedCost?: number;
  estimatedDowntime?: number; // in hours
}

/**
 * Predict next maintenance overdue dates
 */
export async function predictMaintenanceOverdue(): Promise<MaintenancePrediction[]> {
  try {
    // Get all active trainsets with their latest maintenance data
    const trainsData = await trainDb
      .select({
        trainsetId: trainsets.trainsetId,
        serialNo: trainsets.serialNo,
        status: trainsets.status,
        mileageKm: trainsets.mileageKm,
        lastServiceDate: trainsets.lastServiceDate
      })
      .from(trainsets)
      .where(eq(trainsets.status, 'Active'));

    const predictions: MaintenancePrediction[] = [];

    for (const train of trainsData) {
      // Get recent maintenance history
      const maintenanceHistory = await trainDb
        .select({
          description: jobCards.description,
          status: jobCards.status,
          raisedDate: jobCards.raisedDate,
          closedDate: jobCards.closedDate
        })
        .from(jobCards)
        .where(eq(jobCards.trainsetId, train.trainsetId))
        .orderBy(desc(jobCards.raisedDate))
        .limit(10);

      if (maintenanceHistory.length === 0) continue;

      // Calculate maintenance patterns
      const completedMaintenance = maintenanceHistory.filter(m => m.status === 'Closed');
      const averageDaysBetweenMaintenance = calculateAverageMaintenanceInterval(completedMaintenance);
      
      // Predict next overdue date
      const lastMaintenanceDate = completedMaintenance[0]?.closedDate || train.lastServiceDate;
      if (!lastMaintenanceDate) continue;

      const predictedNextDue = new Date(lastMaintenanceDate);
      predictedNextDue.setDate(predictedNextDue.getDate() + averageDaysBetweenMaintenance);

      const today = new Date();
      const daysUntilOverdue = Math.ceil((predictedNextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate confidence and risk level
      const confidence = calculatePredictionConfidence(maintenanceHistory, averageDaysBetweenMaintenance);
      const riskLevel = calculateRiskLevel(daysUntilOverdue, train.mileageKm || 0);

      // Generate factors and recommendations
      const factors = generatePredictionFactors(train, maintenanceHistory, averageDaysBetweenMaintenance);
      const recommendation = generateMaintenanceRecommendation(riskLevel, daysUntilOverdue, train);

      predictions.push({
        trainsetId: train.trainsetId,
        trainId: train.serialNo,
        predictedOverdueDate: predictedNextDue,
        daysUntilOverdue,
        confidence,
        riskLevel,
        recommendation,
        factors
      });
    }

    return predictions.sort((a, b) => a.daysUntilOverdue - b.daysUntilOverdue);
    
  } catch (error) {
    console.error('Error predicting maintenance overdue:', error);
    return [];
  }
}

/**
 * Detect failure patterns in maintenance data
 */
export async function detectFailurePatterns(): Promise<FailurePattern[]> {
  try {
    // Get maintenance data grouped by train and type
    const maintenanceData = await trainDb
      .select({
        trainsetId: jobCards.trainsetId,
        serialNo: trainsets.serialNo,
        description: jobCards.description,
        status: jobCards.status,
        raisedDate: jobCards.raisedDate,
        closedDate: jobCards.closedDate
      })
      .from(jobCards)
      .innerJoin(trainsets, eq(jobCards.trainsetId, trainsets.trainsetId))
      .orderBy(desc(jobCards.raisedDate));

    // Group by train and maintenance type
    const patterns = new Map<string, any[]>();
    
    maintenanceData.forEach(record => {
      const maintenanceType = extractMaintenanceType(record.description);
      const key = `${record.trainsetId}-${maintenanceType}`;
      
      if (!patterns.has(key)) {
        patterns.set(key, []);
      }
      patterns.get(key)?.push(record);
    });

    const failurePatterns: FailurePattern[] = [];

    // Analyze each pattern
    for (const [key, records] of patterns) {
      if (records.length < 2) continue; // Need at least 2 records to detect pattern

      const [trainsetId, maintenanceType] = key.split('-');
      const trainId = records[0].serialNo;

      // Calculate failure metrics
      const failureCount = records.length;
      const dateRanges = records
        .filter(r => r.raisedDate)
        .map(r => new Date(r.raisedDate))
        .sort((a, b) => b.getTime() - a.getTime());

      if (dateRanges.length < 2) continue;

      const avgDaysBetweenFailures = calculateAverageInterval(dateRanges);
      const lastFailureDate = dateRanges[0];
      
      // Calculate risk score (higher = more concerning)
      const riskScore = calculateFailureRiskScore(failureCount, avgDaysBetweenFailures, lastFailureDate);

      // Only flag patterns that indicate potential issues
      if (riskScore >= 60) { // Threshold for concerning patterns
        failurePatterns.push({
          trainsetId: parseInt(trainsetId),
          trainId,
          maintenanceType,
          failureCount,
          avgDaysBetweenFailures,
          lastFailureDate,
          riskScore,
          recommendation: generateFailureRecommendation(maintenanceType, failureCount, avgDaysBetweenFailures, riskScore)
        });
      }
    }

    return failurePatterns.sort((a, b) => b.riskScore - a.riskScore);
    
  } catch (error) {
    console.error('Error detecting failure patterns:', error);
    return [];
  }
}

/**
 * Generate smart alerts based on predictions and patterns
 */
export async function generateSmartAlerts(): Promise<SmartAlert[]> {
  try {
    const alerts: SmartAlert[] = [];
    
    // Get predictions and patterns
    const predictions = await predictMaintenanceOverdue();
    const patterns = await detectFailurePatterns();

    // Generate prediction-based alerts
    predictions.forEach(prediction => {
      if (prediction.riskLevel === 'CRITICAL' || prediction.daysUntilOverdue <= 7) {
        alerts.push({
          type: 'PREDICTION',
          priority: prediction.riskLevel === 'CRITICAL' ? 1 : 2,
          title: `Maintenance Overdue Prediction: ${prediction.trainId}`,
          message: `Train ${prediction.trainId} is predicted to be overdue for maintenance in ${prediction.daysUntilOverdue} days. ${prediction.recommendation}`,
          trainsetId: prediction.trainsetId,
          actionRequired: 'Schedule maintenance immediately',
          estimatedDowntime: 4, // Default 4 hours
          estimatedCost: estimateMaintenanceCost(prediction.riskLevel)
        });
      }
    });

    // Generate pattern-based alerts
    patterns.forEach(pattern => {
      if (pattern.riskScore >= 80) {
        alerts.push({
          type: 'PATTERN',
          priority: pattern.riskScore >= 90 ? 1 : 2,
          title: `Recurring Failure Pattern: ${pattern.trainId}`,
          message: `Train ${pattern.trainId} has recurring ${pattern.maintenanceType} issues (${pattern.failureCount} incidents, avg ${pattern.avgDaysBetweenFailures} days apart). ${pattern.recommendation}`,
          trainsetId: pattern.trainsetId,
          actionRequired: 'Investigate root cause and consider component replacement',
          estimatedDowntime: 8, // Higher downtime for pattern issues
          estimatedCost: estimateMaintenanceCost('HIGH') * 1.5 // Higher cost for recurring issues
        });
      }
    });

    // Check for currently overdue items
    const overdueJobs = await trainDb
      .select({
        trainsetId: jobCards.trainsetId,
        serialNo: trainsets.serialNo,
        description: jobCards.description,
        raisedDate: jobCards.raisedDate
      })
      .from(jobCards)
      .innerJoin(trainsets, eq(jobCards.trainsetId, trainsets.trainsetId))
      .where(eq(jobCards.status, 'Open'));

    const today = new Date();
    overdueJobs.forEach(job => {
      const daysSinceRaised = Math.floor((today.getTime() - new Date(job.raisedDate).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceRaised > 30) { // Consider overdue after 30 days
        alerts.push({
          type: 'OVERDUE',
          priority: daysSinceRaised > 60 ? 1 : 2,
          title: `Overdue Maintenance: ${job.serialNo}`,
          message: `Maintenance job for ${job.serialNo} has been open for ${daysSinceRaised} days: ${job.description}`,
          trainsetId: job.trainsetId,
          actionRequired: 'Complete maintenance immediately',
          estimatedDowntime: 6,
          estimatedCost: estimateMaintenanceCost('HIGH')
        });
      }
    });

    return alerts.sort((a, b) => a.priority - b.priority);
    
  } catch (error) {
    console.error('Error generating smart alerts:', error);
    return [];
  }
}

// Helper functions
function calculateAverageMaintenanceInterval(maintenanceRecords: any[]): number {
  if (maintenanceRecords.length < 2) return 90; // Default 90 days

  const intervals: number[] = [];
  for (let i = 0; i < maintenanceRecords.length - 1; i++) {
    const current = new Date(maintenanceRecords[i].closedDate || maintenanceRecords[i].raisedDate);
    const next = new Date(maintenanceRecords[i + 1].closedDate || maintenanceRecords[i + 1].raisedDate);
    const diffDays = Math.abs((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
    intervals.push(diffDays);
  }

  return Math.round(intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length);
}

function calculateAverageInterval(dates: Date[]): number {
  if (dates.length < 2) return 0;
  
  const intervals: number[] = [];
  for (let i = 0; i < dates.length - 1; i++) {
    const diffDays = (dates[i].getTime() - dates[i + 1].getTime()) / (1000 * 60 * 60 * 24);
    intervals.push(diffDays);
  }
  
  return Math.round(intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length);
}

function calculatePredictionConfidence(history: any[], avgInterval: number): number {
  const dataPoints = history.length;
  const consistencyScore = avgInterval > 30 && avgInterval < 180 ? 80 : 60; // Reasonable interval
  const dataScore = Math.min(dataPoints * 10, 50); // More data = higher confidence
  
  return Math.min(consistencyScore + dataScore, 100);
}

function calculateRiskLevel(daysUntilOverdue: number, mileage: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (daysUntilOverdue <= 0) return 'CRITICAL';
  if (daysUntilOverdue <= 7) return 'HIGH';
  if (daysUntilOverdue <= 30) return 'MEDIUM';
  return 'LOW';
}

function calculateFailureRiskScore(failureCount: number, avgDaysBetween: number, lastFailure: Date): number {
  const today = new Date();
  const daysSinceLastFailure = (today.getTime() - lastFailure.getTime()) / (1000 * 60 * 60 * 24);
  
  let score = 0;
  
  // Frequency score (more failures = higher score)
  score += Math.min(failureCount * 10, 40);
  
  // Interval score (shorter intervals = higher score)
  if (avgDaysBetween < 30) score += 30;
  else if (avgDaysBetween < 60) score += 20;
  else if (avgDaysBetween < 90) score += 10;
  
  // Recency score (recent failures = higher score)
  if (daysSinceLastFailure < 30) score += 20;
  else if (daysSinceLastFailure < 60) score += 10;
  
  // Pattern consistency score
  if (failureCount >= 3 && avgDaysBetween < 60) score += 20;
  
  return Math.min(score, 100);
}

function extractMaintenanceType(description: string): string {
  const types = ['Brake', 'Engine', 'Electrical', 'Coach', 'Routine', 'Door', 'HVAC', 'Signal'];
  for (const type of types) {
    if (description.toLowerCase().includes(type.toLowerCase())) {
      return type;
    }
  }
  return 'General';
}

function generatePredictionFactors(train: any, history: any[], avgInterval: number): string[] {
  const factors: string[] = [];
  
  if (train.mileageKm && train.mileageKm > 15000) {
    factors.push('High mileage (' + train.mileageKm + ' km)');
  }
  
  if (history.length >= 5) {
    factors.push('Rich maintenance history (' + history.length + ' records)');
  }
  
  if (avgInterval < 60) {
    factors.push('Frequent maintenance pattern (avg ' + avgInterval + ' days)');
  }
  
  const recentIssues = history.filter(h => {
    const date = new Date(h.raisedDate);
    const monthsAgo = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsAgo <= 3;
  });
  
  if (recentIssues.length >= 2) {
    factors.push('Recent maintenance activity (' + recentIssues.length + ' in last 3 months)');
  }
  
  return factors;
}

function generateMaintenanceRecommendation(riskLevel: string, daysUntil: number, train: any): string {
  switch (riskLevel) {
    case 'CRITICAL':
      return 'IMMEDIATE ACTION REQUIRED: Schedule emergency maintenance within 24 hours.';
    case 'HIGH':
      return `Schedule maintenance within ${Math.max(daysUntil, 1)} days to prevent service disruption.`;
    case 'MEDIUM':
      return 'Plan maintenance in next scheduling window. Monitor closely.';
    default:
      return 'Continue regular monitoring. No immediate action required.';
  }
}

function generateFailureRecommendation(type: string, count: number, avgDays: number, risk: number): string {
  if (risk >= 90) {
    return `CRITICAL: Consider immediate component replacement for ${type} system. ${count} failures in short timeframe indicates systemic failure.`;
  } else if (risk >= 80) {
    return `HIGH PRIORITY: Investigate root cause of recurring ${type} failures. Consider upgrading components or maintenance procedures.`;
  } else {
    return `Monitor ${type} system closely. Pattern detected but not yet critical.`;
  }
}

function estimateMaintenanceCost(riskLevel: string): number {
  switch (riskLevel) {
    case 'CRITICAL': return 50000; // ₹50,000
    case 'HIGH': return 30000;     // ₹30,000
    case 'MEDIUM': return 20000;   // ₹20,000
    default: return 15000;         // ₹15,000
  }
}