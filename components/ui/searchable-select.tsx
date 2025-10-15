"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import Fuse from "fuse.js"

export interface SearchableSelectOption {
    value: string
    label: string
    description?: string
    category?: string
}

interface SearchableSelectProps {
    options: SearchableSelectOption[]
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    className?: string
    disabled?: boolean
    showCategories?: boolean
    maxHeight?: number
    allowCustom?: boolean
    onCreateOption?: (value: string) => void
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = "Select an option...",
    searchPlaceholder = "Search...",
    emptyText = "No results found.",
    className,
    disabled = false,
    showCategories = false,
    maxHeight = 300,
    allowCustom = false,
    onCreateOption,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")

    const selectedOption = options.find((option) => option.value === value)

    // Setup Fuse.js for fuzzy search
    const fuse = React.useMemo(() => {
        return new Fuse(options, {
            keys: ['label', 'value', 'description'],
            threshold: 0.3,
            includeScore: true,
            includeMatches: true,
        })
    }, [options])

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) return options

        const results = fuse.search(searchQuery)
        return results.map(result => result.item)
    }, [options, searchQuery, fuse])

    // Group options by category if enabled
    const groupedOptions = React.useMemo(() => {
        if (!showCategories) return { 'All': filteredOptions }

        const groups: Record<string, SearchableSelectOption[]> = {}
        filteredOptions.forEach(option => {
            const category = option.category || 'Other'
            if (!groups[category]) groups[category] = []
            groups[category].push(option)
        })
        return groups
    }, [filteredOptions, showCategories])

    const handleSelect = (optionValue: string) => {
        onValueChange(optionValue)
        setOpen(false)
        setSearchQuery("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (allowCustom && onCreateOption && e.key === 'Enter' && searchQuery.trim()) {
            // Check if the search query doesn't match any existing option
            const exactMatch = options.some(option => 
                option.value.toLowerCase() === searchQuery.toLowerCase() ||
                option.label.toLowerCase() === searchQuery.toLowerCase()
            )
            
            if (!exactMatch) {
                onCreateOption(searchQuery.trim())
                setOpen(false)
                setSearchQuery("")
                e.preventDefault()
            }
        }
    }

    // Check if we should show "create new" option
    const shouldShowCreateOption = React.useMemo(() => {
        if (!allowCustom || !onCreateOption || !searchQuery.trim()) return false
        
        const exactMatch = options.some(option => 
            option.value.toLowerCase() === searchQuery.toLowerCase() ||
            option.label.toLowerCase() === searchQuery.toLowerCase()
        )
        
        return !exactMatch
    }, [allowCustom, onCreateOption, searchQuery, options])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between font-mono text-left",
                        !selectedOption && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <CommandInput
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            onKeyDown={handleKeyDown}
                            className="flex h-11"
                        />
                    </div>
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <ScrollArea style={{ maxHeight: `${maxHeight}px` }}>
                            {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                                <CommandGroup key={category} heading={showCategories ? category : undefined}>
                                    {categoryOptions.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.value}
                                            onSelect={() => handleSelect(option.value)}
                                            className="cursor-pointer"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === option.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col flex-1">
                                                <span className="font-mono">{option.label}</span>
                                                {option.description && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {option.description}
                                                    </span>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}
                            
                            {/* Show "Create new" option when typing non-matching text */}
                            {shouldShowCreateOption && (
                                <CommandGroup>
                                    <CommandItem
                                        value="__create_custom__"
                                        onSelect={() => {
                                            if (onCreateOption) {
                                                onCreateOption(searchQuery.trim())
                                                setOpen(false)
                                                setSearchQuery("")
                                            }
                                        }}
                                        className="cursor-pointer border-t border-border/50"
                                    >
                                        <div className="mr-2 h-4 w-4 flex items-center justify-center">
                                            <span className="text-xs text-muted-foreground">+</span>
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="font-mono text-primary">
                                                Create "{searchQuery.trim()}"
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Press Enter to create new option
                                            </span>
                                        </div>
                                    </CommandItem>
                                </CommandGroup>
                            )}
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

