import { type NextRequest, NextResponse } from "next/server"
import { trainDb } from "@/lib/db/train-db"
import { inductionPlans, trainsets, fitnessCertificates, jobCards } from "@/lib/db/train-schema"
import { eq, desc, and, sql } from "drizzle-orm"

// GET /api/plan - Fetch latest induction plans or generate new ones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const trainsetId = searchParams.get("trainsetId")
    const limit = parseInt(searchParams.get("limit") || "10")
    const generateNew = searchParams.get("generate") === "true"

    if (generateNew) {
      // Generate new induction plans based on current trainset data
      const newPlans = await generateInductionPlans(date || undefined)
      return NextResponse.json({
        success: true,
        data: newPlans,
        generated: true,
        timestamp: new Date().toISOString(),
      })
    }

    // Fetch existing plans
    let query = trainDb
      .select({
        planId: inductionPlans.planId,
        date: inductionPlans.date,
        trainsetId: inductionPlans.trainsetId,
        trainsetSerialNo: trainsets.serialNo,
        trainsetStatus: trainsets.status,
        decision: inductionPlans.decision,
        reason: inductionPlans.reason,
        generatedAt: inductionPlans.generatedAt,
      })
      .from(inductionPlans)
      .leftJoin(trainsets, eq(inductionPlans.trainsetId, trainsets.trainsetId))
      .orderBy(desc(inductionPlans.generatedAt))

    // Apply filters
    const conditions = []
    if (date) {
      const targetDate = new Date(date)
      conditions.push(eq(inductionPlans.date, targetDate))
    }
    if (trainsetId) {
      conditions.push(eq(inductionPlans.trainsetId, parseInt(trainsetId)))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }

    query = query.limit(limit) as any
    const plans = await query

    // Get plan statistics
    const stats = await trainDb
      .select({
        decision: inductionPlans.decision,
        count: sql<number>`count(*)`,
      })
      .from(inductionPlans)
      .where(date ? eq(inductionPlans.date, new Date(date)) : sql`1=1`)
      .groupBy(inductionPlans.decision)

    return NextResponse.json({
      success: true,
      data: plans,
      statistics: stats,
      generated: false,
    })
  } catch (error) {
    console.error("Error fetching induction plans:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch induction plans" }, { status: 500 })
  }
}

// POST /api/plan - Generate new induction plan for specific date
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const targetDate = body.date ? new Date(body.date) : new Date()

    // Generate plans for the specified date
    const generatedPlans = await generateInductionPlans(targetDate.toISOString())

    return NextResponse.json(
      {
        success: true,
        data: generatedPlans,
        message: `Generated ${generatedPlans.length} induction plans for ${targetDate.toDateString()}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error generating induction plans:", error)
    return NextResponse.json({ success: false, error: "Failed to generate induction plans" }, { status: 500 })
  }
}

// AI-powered induction plan generation logic
async function generateInductionPlans(dateString?: string) {
  const targetDate = dateString ? new Date(dateString) : new Date()
  
  // Get all active trainsets with their details
  const trainsetsData = await trainDb
    .select()
    .from(trainsets)

  const generatedPlans = []

  for (const trainset of trainsetsData) {
    // Get fitness certificates status
    const certificates = await trainDb
      .select()
      .from(fitnessCertificates)
      .where(eq(fitnessCertificates.trainsetId, trainset.trainsetId))

    // Get active job cards
    const activeJobs = await trainDb
      .select()
      .from(jobCards)
      .where(
        and(
          eq(jobCards.trainsetId, trainset.trainsetId),
          eq(jobCards.status, "Open")
        )
      )

    // AI Decision Logic
    let decision: "Service" | "Standby" | "Maintenance" = "Service"
    let reason = ""

    // Check for expired certificates
    const expiredCerts = certificates.filter(cert => 
      cert.validTo && new Date(cert.validTo) < targetDate
    )

    // Check for pending job cards
    const criticalJobs = activeJobs.filter(job => 
      job.description.toLowerCase().includes("critical") ||
      job.description.toLowerCase().includes("brake") ||
      job.description.toLowerCase().includes("safety")
    )

    // Decision logic
    if (expiredCerts.length > 0) {
      decision = "Maintenance"
      reason = `Expired certificates: ${expiredCerts.map(c => c.dept).join(", ")}`
    } else if (criticalJobs.length > 0) {
      decision = "Maintenance"
      reason = `Critical job cards pending: ${criticalJobs.length} items`
    } else if (trainset.mileageKm > 100000) {
      decision = "Maintenance"
      reason = "High mileage - scheduled maintenance required"
    } else if (activeJobs.length > 5) {
      decision = "Standby"
      reason = `Multiple pending jobs: ${activeJobs.length} items`
    } else if (trainset.status === "Maintenance") {
      decision = "Maintenance"
      reason = "Currently under maintenance"
    } else {
      // Advanced AI logic could go here
      const serviceScore = calculateServiceScore(trainset, certificates, activeJobs)
      
      if (serviceScore > 80) {
        decision = "Service"
        reason = `High service readiness score: ${serviceScore}%`
      } else if (serviceScore > 60) {
        decision = "Standby"
        reason = `Moderate service readiness score: ${serviceScore}%`
      } else {
        decision = "Maintenance"
        reason = `Low service readiness score: ${serviceScore}%`
      }
    }

    // Save the generated plan
    const [newPlan] = await trainDb.insert(inductionPlans).values({
      date: targetDate,
      trainsetId: trainset.trainsetId,
      decision,
      reason,
    }).returning()

    generatedPlans.push({
      ...newPlan,
      trainsetSerialNo: trainset.serialNo,
      currentStatus: trainset.status,
    })
  }

  return generatedPlans
}

// Calculate service readiness score (0-100)
function calculateServiceScore(trainset: any, certificates: any[], jobCards: any[]): number {
  let score = 100

  // Deduct for expired certificates
  const expiredCount = certificates.filter(cert => 
    cert.validTo && new Date(cert.validTo) < new Date()
  ).length
  score -= expiredCount * 30

  // Deduct for open job cards
  score -= jobCards.length * 5

  // Deduct for high mileage
  if (trainset.mileageKm > 80000) score -= 20
  if (trainset.mileageKm > 100000) score -= 40

  // Deduct for maintenance status
  if (trainset.status === "Maintenance") score -= 50

  return Math.max(0, Math.min(100, score))
}