import { type NextRequest, NextResponse } from "next/server"
import { trainDb } from "@/lib/db/train-db"
import { inductionPlans, trainsets } from "@/lib/db/train-schema"
import { eq, desc } from "drizzle-orm"

// GET /api/train/induction-plans - Get induction plans with optional date filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const trainsetId = searchParams.get("trainset_id")

    let plansResult;

    if (date) {
      const planDate = new Date(date)
      plansResult = await trainDb
        .select({
          planId: inductionPlans.planId,
          date: inductionPlans.date,
          decision: inductionPlans.decision,
          reason: inductionPlans.reason,
          generatedAt: inductionPlans.generatedAt,
          trainset: {
            trainsetId: trainsets.trainsetId,
            serialNo: trainsets.serialNo,
            status: trainsets.status,
            mileageKm: trainsets.mileageKm,
          }
        })
        .from(inductionPlans)
        .leftJoin(trainsets, eq(inductionPlans.trainsetId, trainsets.trainsetId))
        .where(eq(inductionPlans.date, planDate))
        .orderBy(desc(inductionPlans.generatedAt))
    } else if (trainsetId) {
      plansResult = await trainDb
        .select({
          planId: inductionPlans.planId,
          date: inductionPlans.date,
          decision: inductionPlans.decision,
          reason: inductionPlans.reason,
          generatedAt: inductionPlans.generatedAt,
          trainset: {
            trainsetId: trainsets.trainsetId,
            serialNo: trainsets.serialNo,
            status: trainsets.status,
            mileageKm: trainsets.mileageKm,
          }
        })
        .from(inductionPlans)
        .leftJoin(trainsets, eq(inductionPlans.trainsetId, trainsets.trainsetId))
        .where(eq(inductionPlans.trainsetId, parseInt(trainsetId)))
        .orderBy(desc(inductionPlans.date))
    } else {
      // Get latest plans
      plansResult = await trainDb
        .select({
          planId: inductionPlans.planId,
          date: inductionPlans.date,
          decision: inductionPlans.decision,
          reason: inductionPlans.reason,
          generatedAt: inductionPlans.generatedAt,
          trainset: {
            trainsetId: trainsets.trainsetId,
            serialNo: trainsets.serialNo,
            status: trainsets.status,
            mileageKm: trainsets.mileageKm,
          }
        })
        .from(inductionPlans)
        .leftJoin(trainsets, eq(inductionPlans.trainsetId, trainsets.trainsetId))
        .orderBy(desc(inductionPlans.generatedAt))
        .limit(20)
    }

    return NextResponse.json({
      success: true,
      data: plansResult,
      count: plansResult.length,
    })
  } catch (error) {
    console.error("Error fetching induction plans:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch induction plans" }, { status: 500 })
  }
}

// POST /api/train/induction-plans - Generate new induction plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["trainsetId", "decision", "reason"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create induction plan
    const newPlan = await trainDb.insert(inductionPlans).values({
      date: body.date ? new Date(body.date) : new Date(),
      trainsetId: body.trainsetId,
      decision: body.decision,
      reason: body.reason,
    }).returning()

    return NextResponse.json(
      {
        success: true,
        data: newPlan[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating induction plan:", error)
    return NextResponse.json({ success: false, error: "Failed to create induction plan" }, { status: 500 })
  }
}

// POST /api/train/induction-plans/generate-daily - Generate daily induction plans for all trainsets
export async function generateDailyPlans() {
  try {
    const today = new Date()
    
    // Get all trainsets
    const allTrainsets = await trainDb.select().from(trainsets)
    
    const generatedPlans = []
    
    for (const trainset of allTrainsets) {
      // Simple algorithm logic (can be enhanced)
      let decision: "Service" | "Standby" | "Maintenance" = "Service"
      let reason = ""
      
      // Check if in maintenance
      if (trainset.status === "Maintenance") {
        decision = "Maintenance"
        reason = "Trainset currently under maintenance"
      }
      // Check if standby
      else if (trainset.status === "Standby") {
        decision = "Standby"
        reason = "Trainset in standby mode, available for emergency service"
      }
      // Check mileage threshold
      else if (trainset.mileageKm > 20000) {
        decision = "Maintenance"
        reason = "High mileage detected, preventive maintenance recommended"
      }
      // Default to service
      else {
        decision = "Service"
        reason = "All systems operational, ready for passenger service"
      }
      
      const newPlan = await trainDb.insert(inductionPlans).values({
        date: today,
        trainsetId: trainset.trainsetId,
        decision,
        reason,
      }).returning()
      
      generatedPlans.push(newPlan[0])
    }
    
    return { success: true, data: generatedPlans, count: generatedPlans.length }
  } catch (error) {
    console.error("Error generating daily plans:", error)
    return { success: false, error: "Failed to generate daily plans" }
  }
}