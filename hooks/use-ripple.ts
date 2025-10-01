"use client"

import { useCallback } from 'react'

export const useRipple = () => {
  const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    // Remove existing ripples
    const existingRipples = button.querySelectorAll('.ripple')
    existingRipples.forEach(ripple => ripple.remove())
    
    // Create new ripple
    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    ripple.style.width = ripple.style.height = size + 'px'
    ripple.style.left = x + 'px'
    ripple.style.top = y + 'px'
    
    button.appendChild(ripple)
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove()
    }, 600)
  }, [])

  return { createRipple }
}