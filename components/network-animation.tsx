"use client"

import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  connections: number[]
}

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  size: number
  opacity: number
}

export function NetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const nodesRef = useRef<Node[]>([])
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize nodes
    const nodeCount = 50
    const nodes: Node[] = []
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 300 + 50,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.3,
        connections: []
      })
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dz = nodes[i].z - nodes[j].z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        
        if (distance < 150 && nodes[i].connections.length < 4) {
          nodes[i].connections.push(j)
        }
      }
    }

    nodesRef.current = nodes

    // Initialize floating particles
    const particles: Particle[] = []
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 100 + 50,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2
      })
    }
    particlesRef.current = particles

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Create animated gradient background
      const time = Date.now() * 0.001
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time * 0.3) * 100, 
        canvas.height / 2 + Math.cos(time * 0.2) * 100, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      )
      gradient.addColorStop(0, `rgba(16, 185, 129, ${0.25 + Math.sin(time * 0.5) * 0.1})`)
      gradient.addColorStop(0.5, `rgba(6, 78, 59, ${0.15 + Math.cos(time * 0.3) * 0.05})`)
      gradient.addColorStop(1, 'rgba(6, 78, 59, 0.05)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        
        // Mouse interaction
        const mouseDistance = Math.sqrt(
          Math.pow(mouseRef.current.x - node.x, 2) + 
          Math.pow(mouseRef.current.y - node.y, 2)
        )
        
        if (mouseDistance < 100) {
          const force = (100 - mouseDistance) / 100
          node.vx += (node.x - mouseRef.current.x) * force * 0.001
          node.vy += (node.y - mouseRef.current.y) * force * 0.001
        }

        // Update position
        node.x += node.vx
        node.y += node.vy
        node.z += node.vz

        // Wrap around edges
        if (node.x < 0) node.x = canvas.width
        if (node.x > canvas.width) node.x = 0
        if (node.y < 0) node.y = canvas.height
        if (node.y > canvas.height) node.y = 0
        if (node.z < 50) node.z = 350
        if (node.z > 350) node.z = 50

        // 3D projection
        const scale = 200 / (200 + node.z)
        const projectedX = node.x + (node.x - canvas.width / 2) * (scale - 1)
        const projectedY = node.y + (node.y - canvas.height / 2) * (scale - 1)

        // Draw connections
        for (const connectionIndex of node.connections) {
          const connectedNode = nodes[connectionIndex]
          const connectedScale = 200 / (200 + connectedNode.z)
          const connectedX = connectedNode.x + (connectedNode.x - canvas.width / 2) * (connectedScale - 1)
          const connectedY = connectedNode.y + (connectedNode.y - canvas.height / 2) * (connectedScale - 1)
          
          const distance = Math.sqrt(
            Math.pow(projectedX - connectedX, 2) + 
            Math.pow(projectedY - connectedY, 2)
          )
          
          if (distance < 200) {
            const opacity = (1 - distance / 200) * 0.6 * scale
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`
            ctx.lineWidth = 2 * scale
            ctx.beginPath()
            ctx.moveTo(projectedX, projectedY)
            ctx.lineTo(connectedX, connectedY)
            ctx.stroke()
          }
        }

        // Draw node with pulsing effect
        const pulsePhase = (time + i * 0.5) % (Math.PI * 2)
        const pulseIntensity = (Math.sin(pulsePhase) + 1) * 0.5
        const nodeSize = (3 + pulseIntensity * 2) * scale
        const opacity = (0.7 + pulseIntensity * 0.3) * scale
        
        // Outer glow with pulse
        const glowSize = nodeSize * (3 + pulseIntensity * 2)
        const glowGradient = ctx.createRadialGradient(
          projectedX, projectedY, 0,
          projectedX, projectedY, glowSize
        )
        glowGradient.addColorStop(0, `rgba(16, 185, 129, ${opacity * 0.9})`)
        glowGradient.addColorStop(0.4, `rgba(16, 185, 129, ${opacity * 0.3})`)
        glowGradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
        
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(projectedX, projectedY, glowSize, 0, Math.PI * 2)
        ctx.fill()

        // Main node body
        const nodeGradient = ctx.createRadialGradient(
          projectedX - nodeSize * 0.3, projectedY - nodeSize * 0.3, 0,
          projectedX, projectedY, nodeSize
        )
        nodeGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.8})`)
        nodeGradient.addColorStop(0.3, `rgba(16, 185, 129, ${opacity})`)
        nodeGradient.addColorStop(1, `rgba(6, 78, 59, ${opacity * 0.6})`)
        
        ctx.fillStyle = nodeGradient
        ctx.beginPath()
        ctx.arc(projectedX, projectedY, nodeSize, 0, Math.PI * 2)
        ctx.fill()

        // Core sparkle
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * (0.6 + pulseIntensity * 0.4)})`
        ctx.beginPath()
        ctx.arc(projectedX - nodeSize * 0.4, projectedY - nodeSize * 0.4, nodeSize * 0.3, 0, Math.PI * 2)
        ctx.fill()
      }

      // Update and draw floating particles
      for (const particle of particles) {
        particle.x += particle.vx
        particle.y += particle.vy
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
        
        // 3D projection for particles
        const particleScale = 100 / (100 + particle.z)
        const particleX = particle.x + (particle.x - canvas.width / 2) * (particleScale - 1)
        const particleY = particle.y + (particle.y - canvas.height / 2) * (particleScale - 1)
        
        // Draw particle
        ctx.fillStyle = `rgba(16, 185, 129, ${particle.opacity * particleScale})`
        ctx.beginPath()
        ctx.arc(particleX, particleY, particle.size * particleScale, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0"
      style={{ background: 'transparent' }}
    />
  )
}