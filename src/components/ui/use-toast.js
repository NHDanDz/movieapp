// src/components/ui/use-toast.js
"use client"

import { toast } from "sonner"

export const useToast = () => {
  return {
    toast: ({ title, description, variant }) => {
      if (variant === "destructive") {
        return toast.error(title, {
          description: description
        })
      }
      return toast(title, {
        description: description
      })
    },
    // Những phương thức khác nếu cần
    dismiss: toast.dismiss
  }
}