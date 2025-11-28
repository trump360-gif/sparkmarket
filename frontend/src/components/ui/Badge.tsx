import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "bg-primary-100 text-primary-800 hover:bg-primary-100/80",
                secondary:
                    "bg-secondary-100 text-secondary-800 hover:bg-secondary-100/80",
                success:
                    "bg-green-100 text-green-800 hover:bg-green-100/80",
                destructive:
                    "bg-red-100 text-red-800 hover:bg-red-100/80",
                warning:
                    "bg-amber-100 text-amber-800 hover:bg-amber-100/80",
                outline:
                    "border border-slate-200 text-slate-700 hover:bg-slate-100",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
