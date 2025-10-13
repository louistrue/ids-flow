"use client"

import { useState, useEffect, useRef, useMemo } from "react"
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
    const [containerWidth, setContainerWidth] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth)
            }
        }

        updateWidth()

        // Use ResizeObserver for more accurate width tracking
        const resizeObserver = new ResizeObserver(updateWidth)
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        window.addEventListener('resize', updateWidth)
        return () => {
            window.removeEventListener('resize', updateWidth)
            resizeObserver.disconnect()
        }
    }, [])

    const handleAddValue = () => {
        if (newValue.trim() && !values.includes(newValue.trim())) {
            const newValues = [...values, newValue.trim()]
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

    const getTruncationLength = useMemo(() => {
        // Dynamic truncation for chip badges
        // Chips wrap so calculate based on reasonable single-chip width
        // Account for badge padding (~16px) + close button (~24px) = ~40px overhead per chip
        // Badge text is ~7px per char at text-xs
        const availableForText = Math.max(containerWidth - 80, 150)
        const estimatedChars = Math.floor(availableForText / 7)
        const result = Math.max(15, Math.min(estimatedChars, 100))
        return result
    }, [containerWidth])

    const truncateText = (text: string) => {
        const maxLength = getTruncationLength
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + "..."
    }

    return (
        <TooltipProvider>
            <div ref={containerRef} className="space-y-3 w-full">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-sidebar-foreground">
                        Enumeration Values ({values.length})
                    </span>
                </div>

                {/* Existing values as chips */}
                {values.length > 0 && (
                    <div className="flex flex-wrap gap-2 min-w-0">
                        {values.map((value, index) => {
                            const maxLength = getTruncationLength
                            const isLong = value.length > maxLength
                            const displayText = truncateText(value)

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
                                        <TooltipContent side="top" className="max-w-md">
                                            <p className="font-mono text-sm break-words whitespace-pre-wrap">{value}</p>
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
