"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
 React.ElementRef<typeof SwitchPrimitives.Root>,
 React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
 <SwitchPrimitives.Root
 className={cn(
 "peer relative inline-flex h-11 w-12 shrink-0 cursor-pointer items-center rounded-full bg-transparent before:absolute before:inset-x-0 before:inset-y-2 before:rounded-full before:border before:border-border before:bg-secondary data-[state=checked]:before:border-primary data-[state=checked]:before:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
 className
 )}
 {...props}
 ref={ref}
 >
 <SwitchPrimitives.Thumb
 className={cn(
 "pointer-events-none relative ml-1 block h-5 w-5 rounded-full bg-foreground shadow-sm ring-0 motion-safe:transition-transform data-[state=checked]:bg-primary-foreground data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
 )}
 />
 </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
