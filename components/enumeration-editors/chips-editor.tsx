"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { X, Plus } from "lucide-react"

interface EnumerationChipsEditorProps {
    values: string[]
    onChange: (values: string[]) => void
}

export function EnumerationChipsEditor({ values, onChange }: EnumerationChipsEditorProps) {
    const [newValue, setNewValue] = useState("")

    const handleAddValue = () => {
        if (newValue.trim() && !values.includes(newValue.trim())) {
            const newValues = [...values, newValue.trim()]
            console.log('ChipsEditor handleAddValue:', { oldValues: values, newValues })
            onChange(newValues)
            setNewValue("")
        }
    }

    const handleRemoveValue = (valueToRemove: string) => {
        onChange(values.filter(v => v !== valueToRemove))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            e.stopPropagation()
            handleAddValue()
        }
    }

    const truncateText = (text: string, maxLength: number = 20) => {
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
                </div>

                {/* Existing values as chips */}
                {values.length > 0 && (
                    <div className="flex flex-wrap gap-2 min-w-0">
                        {values.map((value, index) => {
                            const isLong = value.length > 20
                            const displayText = truncateText(value, 20)

                            return (
                                <Tooltip key={index}>
                                    <TooltipTrigger asChild>
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1 px-2 py-1 text-xs max-w-[200px] min-w-0"
                                        >
                                            <span className="truncate flex-1 min-w-0">{displayText}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground flex-shrink-0"
                                                onClick={() => handleRemoveValue(value)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    </TooltipTrigger>
                                    {isLong && (
                                        <TooltipContent side="top" className="max-w-xs">
                                            <p className="font-mono text-sm">{value}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            )
                        })}
                    </div>
                )}

                {/* Add new value input */}
                <div className="flex gap-2 w-full">
                    <Input
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add value..."
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
