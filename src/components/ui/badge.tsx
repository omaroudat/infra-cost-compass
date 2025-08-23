import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-primary text-primary-foreground hover:bg-primary/80 shadow-elegant",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-subtle",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-elegant",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80 shadow-elegant",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80 shadow-elegant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<
  HTMLDivElement,
  BadgeProps
>(({ className, variant, ...props }, ref) => (
  <div 
    ref={ref}
    className={cn(badgeVariants({ variant }), "shadow-subtle transition-all duration-base hover:shadow-elegant", className)} 
    {...props} 
  />
))

export { Badge, badgeVariants }
