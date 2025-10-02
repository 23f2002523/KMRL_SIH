import { type NextRequest, NextResponse } from "next/server"
import { trainDb } from "@/lib/db/train-db"
import { simulationResults, trainsets } from "@/lib/db/train-schema"
import { eq, desc, and, sql } from "drizzle-orm"

// GET /api/simulate - Fetch simulation results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const simulationId = searchParams.get("id")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (simulationId) {
      // Get specific simulation result
      const [simulation] = await trainDb
        .select()
        .from(simulationResults)
        .where(eq(simulationResults.simulationId, parseInt(simulationId)))

      if (!simulation) {
        return NextResponse.json({ success: false, error: "Simulation not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: {
          ...simulation,
          parameters: JSON.parse(simulation.parameters),
          results: JSON.parse(simulation.results),
        },
      })
    }

    // Get all simulations with filtering
    let query = trainDb
      .select()
      .from(simulationResults)
      .orderBy(desc(simulationResults.startTime))

    if (status) {
      query = query.where(eq(simulationResults.status, status as any)) as any
    }

    query = query.limit(limit).offset(offset) as any
    const simulations = await query

    // Parse JSON fields
    const parsedSimulations = simulations.map(sim => ({
      ...sim,
      parameters: JSON.parse(sim.parameters),
      results: sim.results ? JSON.parse(sim.results) : null,
    }))

    // Get total count
    const [{ count }] = await trainDb
      .select({ count: sql<number>`count(*)` })
      .from(simulationResults)
      .where(status ? eq(simulationResults.status, status as any) : sql`1=1`)

    return NextResponse.json({
      success: true,
      data: parsedSimulations,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count,
      },
    })
  } catch (error) {
    console.error("Error fetching simulations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch simulations" }, { status: 500 })
  }
}

// POST /api/simulate - Run a new simulation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.simulationName || !body.parameters) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields: simulationName, parameters" 
      }, { status: 400 })
    }

    // Create new simulation record
    const [newSimulation] = await trainDb.insert(simulationResults).values({
      simulationName: body.simulationName,
      parameters: JSON.stringify(body.parameters),
      results: JSON.stringify({}), // Empty initially
      status: "Running",
      createdBy: body.userId || null,
    }).returning()

    // Run simulation asynchronously (in real app, this would be queued)
    setTimeout(async () => {
      try {
        const simulationData = await runSimulation(body.parameters, newSimulation.simulationId)
        
        // Update with results
        await trainDb
          .update(simulationResults)
          .set({
            results: JSON.stringify(simulationData),
            status: "Completed",
            endTime: new Date(),
          })
          .where(eq(simulationResults.simulationId, newSimulation.simulationId))
      } catch (error) {
        console.error("Simulation failed:", error)
        await trainDb
          .update(simulationResults)
          .set({
            status: "Failed",
            endTime: new Date(),
            results: JSON.stringify({ error: "Simulation failed" }),
          })
          .where(eq(simulationResults.simulationId, newSimulation.simulationId))
      }
    }, 1000) // Simulate 1 second processing time

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newSimulation,
          parameters: JSON.parse(newSimulation.parameters),
          results: {},
        },
        message: "Simulation started successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error starting simulation:", error)
    return NextResponse.json({ success: false, error: "Failed to start simulation" }, { status: 500 })
  }
}

// PUT /api/simulate/[id] - Update simulation status (mainly for manual control)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const url = new URL(request.url)
    const simulationId = parseInt(url.pathname.split('/').pop() || '0')

    if (!simulationId) {
      return NextResponse.json({ success: false, error: "Invalid simulation ID" }, { status: 400 })
    }

    const updateData: any = {}
    if (body.status) updateData.status = body.status
    if (body.results) updateData.results = JSON.stringify(body.results)
    if (body.status === "Completed" || body.status === "Failed") {
      updateData.endTime = new Date()
    }

    const [updatedSimulation] = await trainDb
      .update(simulationResults)
      .set(updateData)
      .where(eq(simulationResults.simulationId, simulationId))
      .returning()

    if (!updatedSimulation) {
      return NextResponse.json({ success: false, error: "Simulation not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedSimulation,
        parameters: JSON.parse(updatedSimulation.parameters),
        results: updatedSimulation.results ? JSON.parse(updatedSimulation.results) : null,
      },
    })
  } catch (error) {
    console.error("Error updating simulation:", error)
    return NextResponse.json({ success: false, error: "Failed to update simulation" }, { status: 500 })
  }
}

// Simulation engine - This would be much more complex in a real system
async function runSimulation(parameters: any, simulationId: number) {
  // Get current trainset data
  const trainsetsData = await trainDb.select().from(trainsets)
  
  const {
    simulationType = "optimization",
    duration = 24, // hours
    scenarios = ["normal", "peak", "maintenance"],
    optimizationTarget = "efficiency"
  } = parameters

  // Simulate different scenarios
  const results: any = {
    simulationId,
    startTime: new Date(),
    duration,
    scenarios: {},
    summary: {},
    recommendations: [],
  }

  for (const scenario of scenarios) {
    const scenarioResults = await simulateScenario(scenario, trainsetsData, parameters)
    results.scenarios[scenario] = scenarioResults
  }

  // Generate summary and recommendations
  results.summary = generateSummary(results.scenarios)
  results.recommendations = generateRecommendations(results.scenarios, optimizationTarget)
  results.endTime = new Date()

  return results
}

async function simulateScenario(scenario: string, trainsets: any[], parameters: any) {
  // Mock simulation logic - in real app this would be complex algorithms
  const activeTrainsets = trainsets.filter(t => t.status === "Active")
  const totalTrainsets = trainsets.length
  
  let efficiency = 0.85
  let utilization = 0.75
  let maintenanceNeeds = 0.15

  switch (scenario) {
    case "peak":
      efficiency = 0.95
      utilization = 0.90
      maintenanceNeeds = 0.20
      break
    case "maintenance":
      efficiency = 0.70
      utilization = 0.60
      maintenanceNeeds = 0.30
      break
    case "normal":
    default:
      efficiency = 0.85
      utilization = 0.75
      maintenanceNeeds = 0.15
  }

  // Add some randomness to make it realistic
  efficiency += (Math.random() - 0.5) * 0.1
  utilization += (Math.random() - 0.5) * 0.1
  maintenanceNeeds += (Math.random() - 0.5) * 0.05

  return {
    scenario,
    metrics: {
      efficiency: Math.round(efficiency * 100) / 100,
      utilization: Math.round(utilization * 100) / 100,
      maintenanceNeeds: Math.round(maintenanceNeeds * 100) / 100,
      activeTrainsets: activeTrainsets.length,
      totalTrainsets,
      estimatedRevenue: Math.round(activeTrainsets.length * utilization * efficiency * 10000),
      operationalCost: Math.round(totalTrainsets * 5000 + maintenanceNeeds * 20000),
    },
    timeline: generateTimeline(scenario, parameters.duration || 24),
  }
}

function generateTimeline(scenario: string, hours: number) {
  const timeline = []
  for (let hour = 0; hour < hours; hour++) {
    timeline.push({
      hour,
      ridership: Math.floor(Math.random() * 1000) + 500,
      trainsetsDemand: Math.floor(Math.random() * 10) + 5,
      incidents: Math.random() < 0.1 ? 1 : 0,
    })
  }
  return timeline
}

function generateSummary(scenarios: any) {
  const scenarioKeys = Object.keys(scenarios)
  const avgEfficiency = scenarioKeys.reduce((sum, key) => 
    sum + scenarios[key].metrics.efficiency, 0) / scenarioKeys.length
  
  const avgUtilization = scenarioKeys.reduce((sum, key) => 
    sum + scenarios[key].metrics.utilization, 0) / scenarioKeys.length

  return {
    averageEfficiency: Math.round(avgEfficiency * 100) / 100,
    averageUtilization: Math.round(avgUtilization * 100) / 100,
    bestScenario: scenarioKeys.reduce((best, key) => 
      scenarios[key].metrics.efficiency > scenarios[best].metrics.efficiency ? key : best
    ),
    totalEstimatedRevenue: scenarioKeys.reduce((sum, key) => 
      sum + scenarios[key].metrics.estimatedRevenue, 0),
  }
}

function generateRecommendations(scenarios: any, target: string) {
  const recommendations = []
  
  if (scenarios.peak?.metrics.efficiency > 0.9) {
    recommendations.push({
      priority: "High",
      category: "Optimization",
      title: "Increase Peak Hour Capacity",
      description: "Consider adding more trainsets during peak hours to maintain high efficiency",
    })
  }

  if (scenarios.maintenance?.metrics.utilization < 0.6) {
    recommendations.push({
      priority: "Medium",
      category: "Maintenance",
      title: "Optimize Maintenance Scheduling",
      description: "Schedule maintenance during low-demand periods to improve overall utilization",
    })
  }

  recommendations.push({
    priority: "Low",
    category: "Analytics",
    title: "Monitor Performance Metrics",
    description: "Continue tracking efficiency and utilization metrics for continuous improvement",
  })

  return recommendations
}