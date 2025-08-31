import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Check, ChevronDown, Search, X, Loader2, AlertCircle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
// Placeholder for keyboard navigation hook - will be implemented
import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"

const multiSelectVariants = cva(
  "flex min-h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "min-h-8 text-xs",
        default: "min-h-10 text-sm",
        lg: "min-h-12 text-base",
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

export interface MultiSelectOption {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
  group?: string
}

export interface MultiSelectProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value">,
    VariantProps<typeof multiSelectVariants> {
  options: MultiSelectOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  maxSelectedDisplay?: number
  disabled?: boolean
  loading?: boolean
  error?: string
  clearable?: boolean
  searchable?: boolean
  selectAllOption?: boolean
  maxHeight?: number
  filter?: (option: MultiSelectOption, search: string) => boolean
  renderOption?: (option: MultiSelectOption, isSelected: boolean) => React.ReactNode
  renderSelectedChip?: (option: MultiSelectOption, onRemove: () => void) => React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  className?: string
  contentClassName?: string
  triggerClassName?: string
}

const defaultFilter = (option: MultiSelectOption, search: string) => {
  const searchLower = search.toLowerCase()
  return (
    option.label.toLowerCase().includes(searchLower) ||
    (option.description?.toLowerCase().includes(searchLower) ?? false)
  )
}

export const MultiSelect = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  MultiSelectProps
>(({
  options = [], // Default to empty array to prevent iteration errors
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  maxSelectedDisplay = 2,
  disabled,
  loading,
  error,
  clearable = true,
  searchable = true,
  selectAllOption = false,
  maxHeight = 300,
  filter = defaultFilter,
  renderOption,
  renderSelectedChip,
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
  const [internalValue, setInternalValue] = React.useState<string[]>(value ?? defaultValue ?? [])
  const isMobile = useIsMobile()
  const searchRef = React.useRef<HTMLInputElement>(null)

  const currentValue = value ?? internalValue
  const selectedOptions = (options || []).filter(option => currentValue.includes(option.value))

  // Filter and group options
  const filteredOptions = React.useMemo(() => {
    // Ensure options is always an array to prevent iteration errors
    const safeOptions = options || []
    
    let filtered = searchable && search 
      ? safeOptions.filter(option => filter(option, search))
      : safeOptions

    // Group options if they have groups
    const groups = new Map<string, MultiSelectOption[]>()
    const ungrouped: MultiSelectOption[] = []

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
    const result: MultiSelectOption[] = []
    
    // Add select all option if enabled
    if (selectAllOption && filtered.length > 0) {
      const allSelected = filtered.every(opt => currentValue.includes(opt.value))
      result.push({
        value: "__select_all__",
        label: allSelected ? "Deselect All" : "Select All",
        disabled: false
      })
    }
    
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
  }, [options, search, searchable, filter, selectAllOption, currentValue])

  // Handle value changes
  const handleValueChange = React.useCallback((newValues: string[]) => {
    setInternalValue(newValues)
    onValueChange?.(newValues)
  }, [onValueChange])

  const handleOptionToggle = React.useCallback((optionValue: string) => {
    if (optionValue.startsWith("__separator__")) return
    
    if (optionValue === "__select_all__") {
      const filteredNonSpecial = filteredOptions.filter(opt => 
        !opt.value.startsWith("__separator__") && opt.value !== "__select_all__"
      )
      const allSelected = filteredNonSpecial.every(opt => currentValue.includes(opt.value))
      
      if (allSelected) {
        // Deselect all from current filter
        const newValue = currentValue.filter(val => 
          !filteredNonSpecial.some(opt => opt.value === val)
        )
        handleValueChange(newValue)
      } else {
        // Select all from current filter
        const valuesToAdd = filteredNonSpecial
          .filter(opt => !currentValue.includes(opt.value))
          .map(opt => opt.value)
        handleValueChange([...currentValue, ...valuesToAdd])
      }
      return
    }

    const newValue = currentValue.includes(optionValue)
      ? currentValue.filter(val => val !== optionValue)
      : [...currentValue, optionValue]
    
    handleValueChange(newValue)
  }, [currentValue, filteredOptions, handleValueChange])

  const handleRemoveOption = React.useCallback((optionValue: string) => {
    const newValue = currentValue.filter(val => val !== optionValue)
    handleValueChange(newValue)
  }, [currentValue, handleValueChange])

  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    handleValueChange([])
    setSearch("")
  }, [handleValueChange])

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
      className={cn(multiSelectVariants({ size, variant }), "h-auto p-3", triggerClassName, className)}
      disabled={disabled || loading}
      {...props}
    >
      <div className="flex items-center flex-wrap gap-1 flex-1 min-w-0">
        {loading ? (
          <div className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : selectedOptions.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          <>
            {selectedOptions.slice(0, maxSelectedDisplay).map(option => (
              renderSelectedChip ? renderSelectedChip(option, () => handleRemoveOption(option.value)) : (
                <Badge key={option.value} variant="secondary" className="text-xs">
                  {option.icon && <span className="mr-1">{option.icon}</span>}
                  {option.label}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveOption(option.value)
                    }}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )
            ))}
            {selectedOptions.length > maxSelectedDisplay && (
              <Badge variant="outline" className="text-xs">
                +{selectedOptions.length - maxSelectedDisplay} more
              </Badge>
            )}
          </>
        )}
      </div>
      
      <div className="flex items-center gap-1 ml-2">
        {clearable && currentValue.length > 0 && !disabled && !loading && (
          <Button
            size="sm"
            variant="ghost"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
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

      <div className={cn("max-h-60 overflow-y-auto p-1", !searchable && "pt-2")}>
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
          <div className="space-y-1">
            {filteredOptions.map((option) => {
              const isSelected = currentValue.includes(option.value)
              
              return option.value.startsWith("__separator__") ? (
                <div key={option.value} className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {option.label}
                </div>
              ) : (
                <button
                  key={option.value}
                  disabled={option.disabled}
                  onClick={() => handleOptionToggle(option.value)}
                  className={cn(
                    "w-full relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 text-left",
                    isSelected && "bg-accent text-accent-foreground"
                  )}
                >
                  {renderOption ? renderOption(option, isSelected) : (
                    <>
                      {option.value === "__select_all__" ? (
                        <Checkbox
                          checked={filteredOptions.filter(opt => 
                            !opt.value.startsWith("__separator__") && opt.value !== "__select_all__"
                          ).every(opt => currentValue.includes(opt.value))}
                          className="mr-2"
                        />
                      ) : (
                        <Checkbox
                          checked={isSelected}
                          className="mr-2"
                        />
                      )}
                      {option.icon && <span className="mr-2">{option.icon}</span>}
                      <div className="flex flex-col flex-1">
                        <span className={cn(option.value === "__select_all__" && "font-medium")}>
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        )}
                      </div>
                    </>
                  )}
                </button>
              )
            })}
          </div>
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
            <h3 className="font-semibold mb-4">Select Options</h3>
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

MultiSelect.displayName = "MultiSelect"