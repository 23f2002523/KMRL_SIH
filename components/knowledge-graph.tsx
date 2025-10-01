"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface GraphNode {
  id: string
  type: "document" | "person" | "department" | "keyword"
  label: string
  metadata: Record<string, any>
  x?: number
  y?: number
}

interface GraphEdge {
  source: string
  target: string
  type: "authored" | "reviewed" | "related" | "mentions" | "assigned"
  weight: number
}

interface KnowledgeGraphProps {
  language: "en" | "ml"
  selectedNodeId?: string
  onNodeSelect?: (node: GraphNode) => void
}

export function KnowledgeGraph({ language, selectedNodeId, onNodeSelect }: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    loadGraphData()
  }, [])

  useEffect(() => {
    if (nodes.length > 0) {
      renderGraph()
    }
  }, [nodes, edges, filter])

  const loadGraphData = async () => {
    try {
      const response = await fetch("/api/ai/knowledge-graph")
      const data = await response.json()

      if (data.success) {
        setNodes(data.data.nodes)
        setEdges(data.data.edges)
      }
    } catch (error) {
      console.error("Failed to load knowledge graph:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Filter nodes based on current filter
    const filteredNodes = filter === "all" ? nodes : nodes.filter((node) => node.type === filter)

    // Simple force-directed layout simulation
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const radius = Math.min(rect.width, rect.height) / 3

    filteredNodes.forEach((node, index) => {
      const angle = (index / filteredNodes.length) * 2 * Math.PI
      node.x = centerX + Math.cos(angle) * radius
      node.y = centerY + Math.sin(angle) * radius
    })

    // Draw edges
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 1
    edges.forEach((edge) => {
      const sourceNode = filteredNodes.find((n) => n.id === edge.source)
      const targetNode = filteredNodes.find((n) => n.id === edge.target)

      if (sourceNode && targetNode && sourceNode.x && sourceNode.y && targetNode.x && targetNode.y) {
        ctx.beginPath()
        ctx.moveTo(sourceNode.x, sourceNode.y)
        ctx.lineTo(targetNode.x, targetNode.y)
        ctx.stroke()
      }
    })

    // Draw nodes
    filteredNodes.forEach((node) => {
      if (!node.x || !node.y) return

      const isSelected = selectedNode?.id === node.id
      const nodeRadius = isSelected ? 12 : 8

      // Node background
      ctx.fillStyle = getNodeColor(node.type)
      ctx.beginPath()
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI)
      ctx.fill()

      // Node border
      if (isSelected) {
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Node label
      ctx.fillStyle = "#1f2937"
      ctx.font = "12px Inter"
      ctx.textAlign = "center"
      ctx.fillText(
        node.label.length > 15 ? node.label.substring(0, 15) + "..." : node.label,
        node.x,
        node.y + nodeRadius + 15,
      )
    })
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case "document":
        return "#3b82f6"
      case "person":
        return "#10b981"
      case "department":
        return "#f59e0b"
      case "keyword":
        return "#8b5cf6"
      default:
        return "#6b7280"
    }
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find clicked node
    const clickedNode = nodes.find((node) => {
      if (!node.x || !node.y) return false
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      return distance <= 12
    })

    if (clickedNode) {
      setSelectedNode(clickedNode)
      onNodeSelect?.(clickedNode)
    } else {
      setSelectedNode(null)
    }
  }

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {language === "en" ? "Loading knowledge graph..." : "നോളജ് ഗ്രാഫ് ലോഡ് ചെയ്യുന്നു..."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{language === "en" ? "Knowledge Graph" : "നോളജ് ഗ്രാഫ്"}</CardTitle>
            <div className="flex gap-2">
              {["all", "document", "person", "department", "keyword"].map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterType)}
                >
                  {filterType === "all"
                    ? language === "en"
                      ? "All"
                      : "എല്ലാം"
                    : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas ref={canvasRef} className="w-full h-96 border rounded cursor-pointer" onClick={handleCanvasClick} />

            {/* Legend */}
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs">{language === "en" ? "Documents" : "രേഖകൾ"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs">{language === "en" ? "People" : "ആളുകൾ"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs">{language === "en" ? "Departments" : "വകുപ്പുകൾ"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs">{language === "en" ? "Keywords" : "കീവേഡുകൾ"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Details Panel */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getNodeColor(selectedNode.type) }} />
              {selectedNode.label}
              <Badge variant="secondary">{selectedNode.type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(selectedNode.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm font-medium capitalize">{key}:</span>
                  <span className="text-sm text-muted-foreground">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
