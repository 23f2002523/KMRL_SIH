"use client"

import { useAuth } from '@/hooks/use-auth'
import { AuthForm } from '@/components/auth-form'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface Node3D {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  connections: number[]
  size: number
  pulse: number
}

interface Particle3D {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  life: number
}

export default function LoginPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const nodesRef = useRef<Node3D[]>([])
  const particlesRef = useRef<Particle3D[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      // Role-based redirect for already authenticated users
      if (user.role === 'Operator') {
        router.push('/operator/dashboard')
      } else {
        router.push('/') // Fallback
      }
    }
  }, [isAuthenticated, user, router, isLoading])

  // Initialize 3D Network Animation
  useEffect(() => {
    const canvas = document.getElementById('network-canvas') as HTMLCanvasElement
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

    // Initialize nodes in 3D space
    const nodeCount = 40
    const nodes: Node3D[] = []
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 400 + 100,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 0.5,
        connections: [],
        size: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2
      })
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dz = nodes[i].z - nodes[j].z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        
        if (distance < 200 && nodes[i].connections.length < 5) {
          nodes[i].connections.push(j)
        }
      }
    }

    nodesRef.current = nodes

    // Initialize particles
    const particles: Particle3D[] = []
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 200 + 50,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        life: Math.random()
      })
    }
    particlesRef.current = particles

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Create dynamic background gradient
      const time = Date.now() * 0.001
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time * 0.3) * 100,
        canvas.height / 2 + Math.cos(time * 0.2) * 100, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.5
      )
      gradient.addColorStop(0, `rgba(20, 184, 166, ${0.15 + Math.sin(time * 0.5) * 0.05})`)
      gradient.addColorStop(0.4, `rgba(16, 185, 129, ${0.08 + Math.cos(time * 0.3) * 0.03})`)
      gradient.addColorStop(1, 'rgba(6, 78, 59, 0.02)')
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
        
        if (mouseDistance < 150) {
          const force = (150 - mouseDistance) / 150
          node.vx += (node.x - mouseRef.current.x) * force * 0.002
          node.vy += (node.y - mouseRef.current.y) * force * 0.002
        }

        // Update position
        node.x += node.vx
        node.y += node.vy
        node.z += node.vz
        node.pulse += 0.02

        // Wrap around edges
        if (node.x < 0) node.x = canvas.width
        if (node.x > canvas.width) node.x = 0
        if (node.y < 0) node.y = canvas.height
        if (node.y > canvas.height) node.y = 0
        if (node.z < 50) node.z = 450
        if (node.z > 450) node.z = 50

        // 3D projection
        const perspective = 300
        const scale = perspective / (perspective + node.z)
        const projectedX = node.x + (node.x - canvas.width / 2) * (scale - 1) * 0.3
        const projectedY = node.y + (node.y - canvas.height / 2) * (scale - 1) * 0.3

        // Draw connections first (behind nodes)
        for (const connectionIndex of node.connections) {
          const connectedNode = nodes[connectionIndex]
          const connectedScale = perspective / (perspective + connectedNode.z)
          const connectedX = connectedNode.x + (connectedNode.x - canvas.width / 2) * (connectedScale - 1) * 0.3
          const connectedY = connectedNode.y + (connectedNode.y - canvas.height / 2) * (connectedScale - 1) * 0.3
          
          const distance = Math.sqrt(
            Math.pow(projectedX - connectedX, 2) + 
            Math.pow(projectedY - connectedY, 2)
          )
          
          if (distance < 300) {
            const opacity = (1 - distance / 300) * 0.4 * Math.min(scale, connectedScale)
            const pulseEffect = (Math.sin(time * 2 + i * 0.5) + 1) * 0.3
            
            ctx.strokeStyle = `rgba(20, 184, 166, ${opacity + pulseEffect * 0.2})`
            ctx.lineWidth = (1 + pulseEffect) * scale
            ctx.beginPath()
            ctx.moveTo(projectedX, projectedY)
            ctx.lineTo(connectedX, connectedY)
            ctx.stroke()
          }
        }

        // Draw node with 3D effect
        const pulseIntensity = (Math.sin(node.pulse) + 1) * 0.5
        const nodeSize = (node.size + pulseIntensity * 2) * scale
        const opacity = (0.6 + pulseIntensity * 0.4) * scale

        // Outer glow
        const glowSize = nodeSize * 4
        const glowGradient = ctx.createRadialGradient(
          projectedX, projectedY, 0,
          projectedX, projectedY, glowSize
        )
        glowGradient.addColorStop(0, `rgba(20, 184, 166, ${opacity * 0.8})`)
        glowGradient.addColorStop(0.3, `rgba(16, 185, 129, ${opacity * 0.4})`)
        glowGradient.addColorStop(1, 'rgba(20, 184, 166, 0)')
        
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(projectedX, projectedY, glowSize, 0, Math.PI * 2)
        ctx.fill()

        // Main node
        const nodeGradient = ctx.createRadialGradient(
          projectedX - nodeSize * 0.3, projectedY - nodeSize * 0.3, 0,
          projectedX, projectedY, nodeSize
        )
        nodeGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`)
        nodeGradient.addColorStop(0.4, `rgba(20, 184, 166, ${opacity * 0.9})`)
        nodeGradient.addColorStop(1, `rgba(6, 78, 59, ${opacity * 0.7})`)
        
        ctx.fillStyle = nodeGradient
        ctx.beginPath()
        ctx.arc(projectedX, projectedY, nodeSize, 0, Math.PI * 2)
        ctx.fill()

        // Inner highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.6})`
        ctx.beginPath()
        ctx.arc(projectedX - nodeSize * 0.2, projectedY - nodeSize * 0.2, nodeSize * 0.3, 0, Math.PI * 2)
        ctx.fill()
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]
        
        particle.x += particle.vx
        particle.y += particle.vy
        particle.z += particle.vz
        particle.life += 0.005

        // Wrap particles
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
        if (particle.z < 50) particle.z = 250
        if (particle.z > 250) particle.z = 50

        // Reset particle life
        if (particle.life > 1) particle.life = 0

        // 3D projection for particles
        const perspectiveP = 300
        const particleScale = perspectiveP / (perspectiveP + particle.z)
        const particleX = particle.x + (particle.x - canvas.width / 2) * (particleScale - 1) * 0.2
        const particleY = particle.y + (particle.y - canvas.height / 2) * (particleScale - 1) * 0.2
        
        // Draw particle
        const particleOpacity = (1 - particle.life) * particleScale * 0.7
        ctx.fillStyle = `rgba(16, 185, 129, ${particleOpacity})`
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-teal-900/20 via-slate-900 to-emerald-900/20"></div>
        <div className="flex flex-col items-center space-y-4 relative z-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          <p className="text-sm text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-teal-900/20 via-slate-900 to-emerald-900/20"></div>
      
      {/* 3D Canvas Network Animation */}
      <canvas 
        id="network-canvas" 
        className="fixed inset-0 w-full h-full z-0"
        style={{ background: 'transparent' }}
      />

      <div className="w-full max-w-md relative z-20">
        {/* KMRL Branding */}
        <div className="text-center mb-8 backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center mb-4 shadow-lg ring-2 ring-teal-300/30">
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">
            KMRL Train Management
          </h1>
          <p className="text-sm text-gray-300 mt-2 drop-shadow-sm">
            Kochi Metro Rail Limited - SIH 2025
          </p>
        </div>

        <div className="backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl">
          <AuthForm 
            onSuccess={(user) => {
              // Role-based redirect after successful login
              if (user?.role === 'Operator') {
                router.push('/operator/dashboard')
              } else {
                router.push('/')
              }
            }} 
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center backdrop-blur-sm bg-white/5 dark:bg-black/5 rounded-xl p-3 border border-white/10 dark:border-white/5">
          <p className="text-xs text-gray-400 drop-shadow-sm">
            Powered by KMRL-SIH 2025 © {new Date().getFullYear()}
          </p>
        </div>
      </div>


    </div>
  )
}