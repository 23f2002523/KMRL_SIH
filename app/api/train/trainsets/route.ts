import { type NextRequest, NextResponse } from "next/server"
import { trainDb } from "@/lib/db/train-db"
import { trainsets, fitnessCertificates, jobCards } from "@/lib/db/train-schema"
import { eq, and } from "drizzle-orm"
import { withAuth, withOperatorRole } from "@/lib/auth-middleware"

// GET /api/train/trainsets - Retrieve all trainsets with their status
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const includeDetails = searchParams.get("details") === "true"

    let trainsetsResult;
    
    if (status) {
      trainsetsResult = await trainDb
        .select()
        .from(trainsets)
        .where(eq(trainsets.status, status as any))
    } else {
      trainsetsResult = await trainDb.select().from(trainsets)
    }

    if (includeDetails) {
      // Include fitness certificates and job cards for each trainset
      const trainsetsWithDetails = await Promise.all(
        trainsetsResult.map(async (trainset) => {
          // Get fitness certificates
          const certificates = await trainDb
            .select()
            .from(fitnessCertificates)
            .where(eq(fitnessCertificates.trainsetId, trainset.trainsetId))

          // Get active job cards
          const activeJobCards = await trainDb
            .select()
            .from(jobCards)
            .where(
              and(
                eq(jobCards.trainsetId, trainset.trainsetId),
                eq(jobCards.status, "Open")
              )
            )

          return {
            ...trainset,
            fitnessCertificates: certificates,
            activeJobCards: activeJobCards,
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: trainsetsWithDetails,
        count: trainsetsWithDetails.length,
      })
    }

    return NextResponse.json({
      success: true,
      data: trainsetsResult,
      count: trainsetsResult.length,
    })
  } catch (error) {
    console.error("Error fetching trainsets:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch trainsets" }, { status: 500 })
  }
})

// POST /api/train/trainsets - Create a new trainset
export const POST = withOperatorRole(async (request: NextRequest) => {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["serialNo"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create trainset
    const newTrainset = await trainDb.insert(trainsets).values({
      serialNo: body.serialNo,
      status: body.status || "Active",
      mileageKm: body.mileageKm || 0,
      lastServiceDate: body.lastServiceDate ? new Date(body.lastServiceDate) : null,
    }).returning()

    return NextResponse.json(
      {
        success: true,
        data: newTrainset[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating trainset:", error)
    return NextResponse.json({ success: false, error: "Failed to create trainset" }, { status: 500 })
  }
})

// PUT /api/train/trainsets/[id] - Update trainset status or details
export const PUT = withOperatorRole(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const url = new URL(request.url)
    const trainsetId = parseInt(url.pathname.split('/').pop() || '0')

    if (!trainsetId) {
      return NextResponse.json({ success: false, error: "Invalid trainset ID" }, { status: 400 })
    }

    const updateData: any = {}
    if (body.status) updateData.status = body.status
    if (body.mileageKm !== undefined) updateData.mileageKm = body.mileageKm
    if (body.lastServiceDate) updateData.lastServiceDate = new Date(body.lastServiceDate)
    
    updateData.updatedAt = new Date()

    const updatedTrainset = await trainDb
      .update(trainsets)
      .set(updateData)
      .where(eq(trainsets.trainsetId, trainsetId))
      .returning()

    if (updatedTrainset.length === 0) {
      return NextResponse.json({ success: false, error: "Trainset not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedTrainset[0],
    })
  } catch (error) {
    console.error("Error updating trainset:", error)
    return NextResponse.json({ success: false, error: "Failed to update trainset" }, { status: 500 })
  }
})