import { type NextRequest, NextResponse } from "next/server"
import { trainDb } from "@/lib/db/train-db"
import { systemAlerts, trainsets } from "@/lib/db/train-schema"
import { eq, and, desc, asc, sql } from "drizzle-orm"

// GET /api/alerts - Fetch all alerts with filtering options
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const priority = searchParams.get("priority")
    const isRead = searchParams.get("read")
    const isDismissed = searchParams.get("dismissed")
    const trainsetId = searchParams.get("trainsetId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    let query = trainDb
      .select({
        alertId: systemAlerts.alertId,
        trainsetId: systemAlerts.trainsetId,
        trainsetSerialNo: trainsets.serialNo,
        type: systemAlerts.type,
        title: systemAlerts.title,
        message: systemAlerts.message,
        priority: systemAlerts.priority,
        isRead: systemAlerts.isRead,
        isDismissed: systemAlerts.isDismissed,
        createdAt: systemAlerts.createdAt,
        updatedAt: systemAlerts.updatedAt,
      })
      .from(systemAlerts)
      .leftJoin(trainsets, eq(systemAlerts.trainsetId, trainsets.trainsetId))

    // Apply filters
    const conditions = []
    if (type) conditions.push(eq(systemAlerts.type, type as any))
    if (priority) conditions.push(eq(systemAlerts.priority, parseInt(priority)))
    if (isRead !== null) conditions.push(eq(systemAlerts.isRead, isRead === "true"))
    if (isDismissed !== null) conditions.push(eq(systemAlerts.isDismissed, isDismissed === "true"))
    if (trainsetId) conditions.push(eq(systemAlerts.trainsetId, parseInt(trainsetId)))

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }

    // Apply sorting
    const sortColumn = sortBy === "priority" ? systemAlerts.priority : systemAlerts.createdAt
    const orderFn = sortOrder === "asc" ? asc : desc
    query = query.orderBy(orderFn(sortColumn)) as any

    // Apply pagination
    query = query.limit(limit).offset(offset) as any

    const alerts = await query

    // Get total count for pagination
    const totalQuery = trainDb
      .select({ count: sql<number>`count(*)` })
      .from(systemAlerts)

    if (conditions.length > 0) {
      totalQuery.where(and(...conditions))
    }

    const [{ count }] = await totalQuery
    
    // Get alert statistics
    const stats = await trainDb
      .select({
        type: systemAlerts.type,
        priority: systemAlerts.priority,
        count: sql<number>`count(*)`,
      })
      .from(systemAlerts)
      .where(eq(systemAlerts.isDismissed, false))
      .groupBy(systemAlerts.type, systemAlerts.priority)

    return NextResponse.json({
      success: true,
      data: alerts,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count,
      },
      statistics: stats,
    })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 })
  }
}

// POST /api/alerts - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["type", "title", "message"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const newAlert = await trainDb.insert(systemAlerts).values({
      trainsetId: body.trainsetId || null,
      type: body.type,
      title: body.title,
      message: body.message,
      priority: body.priority || 2, // Default to medium priority
    }).returning()

    return NextResponse.json(
      {
        success: true,
        data: newAlert[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating alert:", error)
    return NextResponse.json({ success: false, error: "Failed to create alert" }, { status: 500 })
  }
}

// PATCH /api/alerts/[id] - Update alert status (mark as read/dismissed)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const url = new URL(request.url)
    const alertId = parseInt(url.pathname.split('/').pop() || '0')

    if (!alertId) {
      return NextResponse.json({ success: false, error: "Invalid alert ID" }, { status: 400 })
    }

    const updateData: any = { updatedAt: new Date() }
    if (body.isRead !== undefined) updateData.isRead = body.isRead
    if (body.isDismissed !== undefined) updateData.isDismissed = body.isDismissed

    const updatedAlert = await trainDb
      .update(systemAlerts)
      .set(updateData)
      .where(eq(systemAlerts.alertId, alertId))
      .returning()

    if (updatedAlert.length === 0) {
      return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedAlert[0],
    })
  } catch (error) {
    console.error("Error updating alert:", error)
    return NextResponse.json({ success: false, error: "Failed to update alert" }, { status: 500 })
  }
}

// DELETE /api/alerts/[id] - Delete an alert
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const alertId = parseInt(url.pathname.split('/').pop() || '0')

    if (!alertId) {
      return NextResponse.json({ success: false, error: "Invalid alert ID" }, { status: 400 })
    }

    const deletedAlert = await trainDb
      .delete(systemAlerts)
      .where(eq(systemAlerts.alertId, alertId))
      .returning()

    if (deletedAlert.length === 0) {
      return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Alert deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting alert:", error)
    return NextResponse.json({ success: false, error: "Failed to delete alert" }, { status: 500 })
  }
}