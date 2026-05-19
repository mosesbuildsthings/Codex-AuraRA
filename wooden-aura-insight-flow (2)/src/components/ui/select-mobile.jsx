import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"

// Parses children to extract { value, label } pairs, OR accepts explicit options prop
function extractOptions(children) {
  const options = []
  React.Children.forEach(children, (child) => {
    if (!child) return
    if (child.props?.value !== undefined) {
      options.push({ value: child.props.value, label: child.props.children ?? child.props.value })
    }
  })
  return options
}

const SelectMobile = React.forwardRef(({
  className, children, value, onValueChange, defaultValue, placeholder, options: optionsProp, ...props
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  const controlled = value !== undefined
  const currentValue = controlled ? value : internalValue

  const handleChange = (val) => {
    if (!controlled) setInternalValue(val)
    onValueChange?.(val)
  }

  // Support both explicit options prop and SelectItem children
  const options = optionsProp ?? extractOptions(children)
  const selectedLabel = options.find(o => o.value === currentValue)?.label

  // Desktop: native Radix Select
  if (!isMobile) {
    if (optionsProp) {
      // Render with generated SelectItems from options prop
      return (
        <SelectPrimitive.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} {...props}>
          <SelectPrimitive.Trigger
            ref={ref}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
              className
            )}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon asChild>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Content className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <SelectPrimitive.Viewport className="p-1">
              {options.map(opt => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Root>
      )
    }

    // Children-based (standard usage)
    return (
      <SelectPrimitive.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} {...props}>
        <SelectPrimitive.Trigger
          ref={ref}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            className
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Content className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <SelectPrimitive.Viewport className="p-1">
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Root>
    )
  }

  // Mobile: Drawer with plain buttons (no Radix Select primitives inside)
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          ref={ref}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 select-none",
            className
          )}
        >
          <span className={cn("text-left truncate", !selectedLabel && "text-muted-foreground")}>
            {selectedLabel ?? placeholder ?? "Select..."}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4 pb-10 space-y-1">
          {options.map((opt) => (
            <DrawerTrigger asChild key={opt.value}>
              <button
                onClick={() => handleChange(opt.value)}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors select-none",
                  opt.value === currentValue
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                )}
              >
                {opt.label}
                {opt.value === currentValue && <Check className="w-4 h-4 shrink-0" />}
              </button>
            </DrawerTrigger>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
})

SelectMobile.displayName = "SelectMobile"

export { SelectMobile }