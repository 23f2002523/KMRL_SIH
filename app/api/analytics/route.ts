import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"

    // Mock analytics data - replace with actual database queries
    const analyticsData = {
      documentStats: {
        total: 15847,
        pending: 234,
        processed: 15613,
        overdue: 45,
      },
      departmentStats: [
        {
          name: "Human Resources",
          documents: 3245,
          pending: 23,
          slaCompliance: 92,
        },
        {
          name: "Engineering",
          documents: 5678,
          pending: 67,
          slaCompliance: 87,
        },
        {
          name: "Safety & Security",
          documents: 2134,
          pending: 12,
          slaCompliance: 95,
        },
        {
          name: "Operations",
          documents: 4790,
          pending: 132,
          slaCompliance: 78,
        },
      ],
      monthlyTrends: [
        { month: "Jan", uploaded: 1200, processed: 1150, overdue: 50 },
        { month: "Feb", uploaded: 1350, processed: 1300, overdue: 45 },
        { month: "Mar", uploaded: 1100, processed: 1080, overdue: 20 },
        { month: "Apr", uploaded: 1450, processed: 1400, overdue: 35 },
        { month: "May", uploaded: 1600, processed: 1550, overdue: 40 },
        { month: "Jun", uploaded: 1300, processed: 1280, overdue: 15 },
      ],
      categoryDistribution: [
        { category: "HR Policies", count: 3245, percentage: 20.5 },
        { category: "Safety Reports", count: 2890, percentage: 18.2 },
        { category: "Engineering Specs", count: 2567, percentage: 16.2 },
        { category: "Operations Manual", count: 2134, percentage: 13.5 },
        { category: "Regulatory Docs", count: 1890, percentage: 11.9 },
        { category: "Others", count: 3121, percentage: 19.7 },
      ],
      slaMetrics: {
        averageProcessingTime: 2.3,
        onTimeCompletion: 87,
        overdueDocuments: 45,
      },
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
