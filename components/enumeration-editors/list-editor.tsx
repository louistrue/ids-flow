"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { X, Plus, Search, Trash2 } from "lucide-react"

interface EnumerationListEditorProps {
    values: string[]
    onChange: (values: string[]) => void
}

export function EnumerationListEditor({ values, onChange }: EnumerationListEditorProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [newValue, setNewValue] = useState("")
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

    const filteredValues = useMemo(() => {
        if (!searchTerm) return values
        return values.filter(value =>
            value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [values, searchTerm])

    const handleAddValue = () => {
        if (newValue.trim() && !values.includes(newValue.trim())) {
            onChange([...values, newValue.trim()])
            setNewValue("")
        }
    }

    const handleRemoveValue = (index: number) => {
        const newValues = values.filter((_, i) => i !== index)
        onChange(newValues)
        setSelectedItems(new Set())
    }

    const handleRemoveSelected = () => {
        const indicesToRemove = Array.from(selectedItems)
        const newValues = values.filter((_, index) => !indicesToRemove.includes(index))
        onChange(newValues)
        setSelectedItems(new Set())
    }

    const handleSelectAll = () => {
        if (selectedItems.size === filteredValues.length) {
            setSelectedItems(new Set())
        } else {
            const filteredIndices = filteredValues.map(value => values.indexOf(value))
            setSelectedItems(new Set(filteredIndices))
        }
    }

    const handleItemSelect = (index: number) => {
        const newSelected = new Set(selectedItems)
        if (newSelected.has(index)) {
            newSelected.delete(index)
        } else {
            newSelected.add(index)
        }
        setSelectedItems(newSelected)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            e.stopPropagation()
            handleAddValue()
        }
    }

    const truncateText = (text: string, maxLength: number = 50) => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + "..."
    }

    return (
        <TooltipProvider>
            <div className="space-y-3 w-full">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-sidebar-foreground">
                        Enumeration Values ({values.length})
                    </span>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            disabled={filteredValues.length === 0}
                        >
                            {selectedItems.size === filteredValues.length ? "Deselect" : "Select All"}
                        </Button>
                        {selectedItems.size > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRemoveSelected}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete ({selectedItems.size})
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search input */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search values..."
                        className="bg-input border-border text-foreground pl-9 w-full"
                    />
                </div>

                {/* Values list */}
                <ScrollArea className="h-64 border rounded-md w-full">
                    <div className="p-2 space-y-1 min-w-0">
                        {filteredValues.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                {searchTerm ? "No values match your search" : "No values added yet"}
                            </p>
                        ) : (
                            filteredValues.map((value, index) => {
                                const originalIndex = values.indexOf(value)
                                const isSelected = selectedItems.has(originalIndex)
                                const isLong = value.length > 50
                                const displayText = truncateText(value, 50)

                                return (
                                    <Tooltip key={originalIndex}>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2 p-2 rounded hover:bg-accent/50 min-w-0">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => handleItemSelect(originalIndex)}
                                                    className="flex-shrink-0"
                                                />
                                                <span className="flex-1 text-sm font-mono overflow-hidden text-ellipsis whitespace-nowrap pr-2">{displayText}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground flex-shrink-0"
                                                    onClick={() => handleRemoveValue(originalIndex)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TooltipTrigger>
                                        {isLong && (
                                            <TooltipContent side="right" className="max-w-xs">
                                                <p className="font-mono text-sm">{value}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>

                {/* Add new value input */}
                <div className="flex gap-2 w-full">
                    <Input
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add new value..."
                        className="bg-input border-border text-foreground flex-1"
                    />
                    <Button
                        onClick={handleAddValue}
                        disabled={!newValue.trim() || values.includes(newValue.trim())}
                        size="sm"
                        variant="outline"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Duplicate warning */}
                {newValue.trim() && values.includes(newValue.trim()) && (
                    <p className="text-xs text-destructive">
                        This value already exists
                    </p>
                )}
            </div>
        </TooltipProvider>
    )
}
