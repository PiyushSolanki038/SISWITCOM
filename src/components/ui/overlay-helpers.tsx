import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const SafeSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & { container?: HTMLElement | null }
>(({ className, position = "popper", container, ...props }, ref) => (
  <SelectPrimitive.Portal container={container || document.body}>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-[10000] max-h-96 min-w-[8rem] overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1" />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)] max-h-80"
        )}
      >
        {props.children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1" />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SafeSelectContent.displayName = "SafeSelectContent";

export const SafeDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & { container?: HTMLElement | null }
>(({ className, sideOffset = 4, container, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal container={container || document.body}>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-[10000] min-w-[8rem] overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
SafeDropdownMenuContent.displayName = "SafeDropdownMenuContent";
