"use client"

import { useEffect, useRef } from 'react'

export function SimpleNetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Simple animation variables
    let time = 0

    const animate = () => {
      time += 0.01
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw animated background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      )
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)')
      gradient.addColorStop(1, 'rgba(6, 78, 59, 0.05)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw moving circles
      for (let i = 0; i < 10; i++) {
        const x = canvas.width / 2 + Math.sin(time + i) * 200
        const y = canvas.height / 2 + Math.cos(time + i) * 200
        const radius = 5 + Math.sin(time * 2 + i) * 3

        ctx.fillStyle = `rgba(16, 185, 129, ${0.7 + Math.sin(time + i) * 0.3})`
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
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