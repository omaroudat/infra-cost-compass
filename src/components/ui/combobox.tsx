import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Check, ChevronDown, Search, X, Loader2, AlertCircle } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
// Placeholder for keyboard navigation hook - will be implemented
import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"

const comboboxVariants = cva(
  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  {
    variants: {
      size: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
      variant: {
        default: "border-input",
        outline: "border-border bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
  group?: string
}

export interface ComboboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value">,
    VariantProps<typeof comboboxVariants> {
  options: ComboboxOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  loading?: boolean
  error?: string
  clearable?: boolean
  searchable?: boolean
  maxHeight?: number
  filter?: (option: ComboboxOption, search: string) => boolean
  renderOption?: (option: ComboboxOption, isSelected: boolean) => React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  className?: string
  contentClassName?: string
  triggerClassName?: string
}

const defaultFilter = (option: ComboboxOption, search: string) => {
  const searchLower = search.toLowerCase()
  return (
    option.label.toLowerCase().includes(searchLower) ||
    (option.description?.toLowerCase().includes(searchLower) ?? false)
  )
}


export const ComboBox = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  ComboboxProps
>(({
  options = [], // Default to empty array to prevent iteration errors
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled,
  loading,
  error,
  clearable = false,
  searchable = true,
  maxHeight = 300,
  filter = defaultFilter,
  renderOption,
  side = "bottom",
  align = "start",
  size,
  variant,
  className,
  contentClassName,
  triggerClassName,
  ...props
}, ref) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [internalValue, setInternalValue] = React.useState(value ?? defaultValue ?? "")
  const isMobile = useIsMobile()
  const searchRef = React.useRef<HTMLInputElement>(null)

  const currentValue = value ?? internalValue
  const selectedOption = (options || []).find(option => option.value === currentValue)

  // Filter and group options
  const filteredOptions = React.useMemo(() => {
    // Ensure options is always an array to prevent iteration errors
    const safeOptions = options || []
    
    let filtered = searchable && search 
      ? safeOptions.filter(option => filter(option, search))
      : safeOptions

    // Group options if they have groups
    const groups = new Map<string, ComboboxOption[]>()
    const ungrouped: ComboboxOption[] = []

    filtered.forEach(option => {
      if (option.group) {
        if (!groups.has(option.group)) {
          groups.set(option.group, [])
        }
        groups.get(option.group)!.push(option)
      } else {
        ungrouped.push(option)
      }
    })

    // Flatten back with group separators
    const result: ComboboxOption[] = []
    groups.forEach((groupOptions, groupName) => {
      if (result.length > 0) {
        result.push({ value: `__separator__${groupName}`, label: groupName, disabled: true })
      }
      result.push(...groupOptions)
    })
    
    if (ungrouped.length > 0) {
      if (result.length > 0 && groups.size > 0) {
        result.push({ value: "__separator__other", label: "Other", disabled: true })
      }
      result.push(...ungrouped)
    }

    return result
  }, [options, search, searchable, filter])

  // Handle value changes
  const handleValueChange = React.useCallback((newValue: string | undefined) => {
    if (!newValue || newValue.startsWith("__separator__")) return
    
    setInternalValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
    setSearch("")
  }, [onValueChange])

  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setInternalValue("")
    onValueChange?.(undefined)
    setSearch("")
  }, [onValueChange])

  // Focus search input when opened
  React.useEffect(() => {
    if (open && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 0)
    }
  }, [open, searchable])

  // Keyboard navigation - placeholder for now
  // useKeyboardNavigation({
  //   onArrowDown: () => {
  //     if (!open) setOpen(true)
  //   },
  //   onEscape: () => {
  //     setOpen(false)
  //   },
  //   onEnter: () => {
  //     if (!open) setOpen(true)
  //   }
  // })

  const TriggerContent = (
    <Button
      ref={ref}
      variant="outline"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      className={cn(comboboxVariants({ size, variant }), triggerClassName, className)}
      disabled={disabled || loading}
      {...props}
    >
      <div className="flex items-center flex-1 min-w-0">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : selectedOption ? (
          <>
            {selectedOption.icon && <span className="mr-2">{selectedOption.icon}</span>}
            <span className="truncate">{selectedOption.label}</span>
          </>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        {clearable && currentValue && !disabled && !loading && (
          <Button
            size="sm"
            variant="ghost"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
    </Button>
  )

  const Content = (
    <>
      {searchable && (
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            ref={searchRef}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-11 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}

      <div className={cn("max-h-60 overflow-hidden p-1", !searchable && "pt-2")}>
        {loading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-4 text-sm text-destructive">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
          </div>
        ) : filteredOptions.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <CommandPrimitive className="w-full">
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {filteredOptions.map((option) => (
                option.value.startsWith("__separator__") ? (
                  <div key={option.value} className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {option.label}
                  </div>
                ) : (
                  <CommandPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    onSelect={() => handleValueChange(option.value)}
                    className={cn(
                      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                      currentValue === option.value && "bg-accent text-accent-foreground"
                    )}
                  >
                    {renderOption ? renderOption(option, currentValue === option.value) : (
                      <>
                        <Check className={cn("mr-2 h-4 w-4", currentValue === option.value ? "opacity-100" : "opacity-0")} />
                        {option.icon && <span className="mr-2">{option.icon}</span>}
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          )}
                        </div>
                      </>
                    )}
                  </CommandPrimitive.Item>
                )
              ))}
            </div>
          </CommandPrimitive>
        )}
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {TriggerContent}
        </DrawerTrigger>
        <DrawerContent className="max-h-[80vh]">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Select Option</h3>
            {Content}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        {TriggerContent}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          className={cn(
            "z-50 min-w-[var(--radix-popover-trigger-width)] rounded-md border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            contentClassName
          )}
          sideOffset={4}
        >
          {Content}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
})

ComboBox.displayName = "ComboBox"