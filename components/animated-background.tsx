"use client"

import React, { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  connections: number[]
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const nodesRef = useRef<Node[]>([])
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize nodes
    const nodeCount = 80
    const nodes: Node[] = []
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        connections: []
      })
    }
    
    nodesRef.current = nodes

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Determine colors based on theme
      const isDark = theme === 'dark'
      const nodeColor = isDark ? 'rgba(34, 197, 94, 0.6)' : 'rgba(34, 197, 94, 0.4)'
      const connectionColor = isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)'
      const strongConnectionColor = isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'

      // Update node positions
      nodes.forEach(node => {
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1

        // Keep nodes within bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x))
        node.y = Math.max(0, Math.min(canvas.height, node.y))
      })

      // Draw connections
      ctx.strokeStyle = connectionColor
      ctx.lineWidth = 1

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const opacity = (150 - distance) / 150
            ctx.globalAlpha = opacity * 0.6
            
            // Make some connections stronger
            if (distance < 80) {
              ctx.strokeStyle = strongConnectionColor
              ctx.lineWidth = 2
            } else {
              ctx.strokeStyle = connectionColor
              ctx.lineWidth = 1
            }

            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      ctx.globalAlpha = 1
      nodes.forEach((node, index) => {
        // Create gradient for nodes
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 6)
        gradient.addColorStop(0, isDark ? 'rgba(34, 197, 94, 0.8)' : 'rgba(34, 197, 94, 0.6)')
        gradient.addColorStop(1, isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2)
        ctx.fill()

        // Add pulsing effect to some nodes
        if (index % 10 === 0) {
          const pulseRadius = 4 + Math.sin(Date.now() * 0.005 + index) * 2
          ctx.fillStyle = isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'
          ctx.beginPath()
          ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Add floating particles
      const time = Date.now() * 0.001
      for (let i = 0; i < 20; i++) {
        const x = Math.sin(time + i) * canvas.width * 0.3 + canvas.width * 0.5
        const y = Math.cos(time * 0.8 + i) * canvas.height * 0.3 + canvas.height * 0.5
        
        ctx.fillStyle = isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)'
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ 
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)'
      }}
    />
  )
}