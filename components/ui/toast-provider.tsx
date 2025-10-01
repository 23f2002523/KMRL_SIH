"use client"

import { Toaster } from "sonner"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ToastProvider() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Toaster
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      position="top-right"
      richColors
      expand
      closeButton
    />
  )
}

// Custom toast functions with icons
export const customToast = {
  success: (message: string, description?: string) => {
    const { toast } = require("sonner")
    return toast.success(message, {
      description,
      duration: 4000,
    })
  },
  
  error: (message: string, description?: string) => {
    const { toast } = require("sonner")
    return toast.error(message, {
      description,
      duration: 5000,
    })
  },
  
  warning: (message: string, description?: string) => {
    const { toast } = require("sonner")
    return toast.warning(message, {
      description,
      duration: 4000,
    })
  },
  
  info: (message: string, description?: string) => {
    const { toast } = require("sonner")
    return toast.info(message, {
      description,
      duration: 3000,
    })
  },
  
  loading: (message: string) => {
    const { toast } = require("sonner")
    return toast.loading(message)
  },
  
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    const { toast } = require("sonner")
    return toast.promise(promise, {
      loading,
      success,
      error,
    })
  },
}