import * as React from "react"
import { cn } from "@/lib/utils"

const VisuallyHidden = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("sr-only", className)}
      {...props}
    />
  )
})
VisuallyHidden.displayName = "VisuallyHidden"

export { VisuallyHidden }