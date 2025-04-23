// src/components/ui/toaster.js
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

export function Toaster({ ...props }) {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)"
      }}
      {...props}
    />
  )
}