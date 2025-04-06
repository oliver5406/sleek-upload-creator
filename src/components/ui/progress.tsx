
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    isIndeterminate?: boolean;
  }
>(({ className, value, isIndeterminate = false, ...props }, ref) => (
  <div className="relative w-full">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      {isIndeterminate ? (
        <div className="w-full h-full">
          <div 
            className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce-x"
            style={{ 
              width: '30%', 
              animation: 'bounce-x 1.5s infinite alternate' 
            }}
          />
        </div>
      ) : (
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      )}
    </ProgressPrimitive.Root>

    <style jsx>{`
      @keyframes bounce-x {
        0% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(233%);
        }
      }
      .animate-bounce-x {
        animation: bounce-x 1.5s infinite alternate ease-in-out;
      }
    `}</style>
  </div>
))

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
