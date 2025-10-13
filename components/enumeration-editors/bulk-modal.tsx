"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EnumerationImportDialog } from "@/components/enumeration-editors/import-dialog"
import { Upload, Download, SortAsc, Trash2, FileText, CheckCircle2, X } from "lucide-react"

interface BulkEditorModalProps {
    values: string[]
    onChange: (values: string[]) => void
    onImport: (importedValues: string[]) => void
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function BulkEditorModal({ values, onChange, onImport, open, onOpenChange }: BulkEditorModalProps) {
    const [textValue, setTextValue] = useState("")
    const [initialValues, setInitialValues] = useState<string[]>([])
    const [showImportDialog, setShowImportDialog] = useState(false)
    const debounceRef = useRef<NodeJS.Timeout>()

    // Initialize textValue only when modal opens, and store initial values
    useEffect(() => {
        if (open) {
            setInitialValues(values)
            setTextValue(values.join("\n"))
        }
    }, [open]) // Remove values dependency to prevent re-initialization

    // Derive preview values from textValue (never overwrite textValue from values while open)
    const previewValues = useMemo(() => {
        return textValue.split("\n").map(line => line.trim()).filter(Boolean)
    }, [textValue])

    // Compute hover previews for buttons
    const formatPreview = useMemo(() => {
        const lines = textValue.split("\n").map(line => line.trim()).filter(Boolean)
        return lines
    }, [textValue])

    const sortPreview = useMemo(() => {
        const lines = textValue.split("\n").map(line => line.trim()).filter(Boolean)
        const sorted = [...lines].sort()
        return sorted
    }, [textValue])

    // Check if format would change anything
    const formatHasChanges = useMemo(() => {
        const originalLines = textValue.split("\n")
        const formattedLines = textValue.split("\n").map(line => line.trim()).filter(Boolean)
        return JSON.stringify(originalLines) !== JSON.stringify(formattedLines)
    }, [textValue])

    // Check if sort would change anything
    const sortHasChanges = useMemo(() => {
        const lines = textValue.split("\n").map(line => line.trim()).filter(Boolean)
        const sorted = [...lines].sort()
        return JSON.stringify(lines) !== JSON.stringify(sorted)
    }, [textValue])

    // Compute remove duplicates preview
    const removeDupesPreview = useMemo(() => {
        const lines = textValue.split("\n").map(line => line.trim()).filter(Boolean)
        const unique = [...new Set(lines)]
        return unique
    }, [textValue])

    // Check if remove duplicates would change anything
    const removeDupesHasChanges = useMemo(() => {
        const lines = textValue.split("\n").map(line => line.trim()).filter(Boolean)
        const unique = [...new Set(lines)]
        return lines.length !== unique.length
    }, [textValue])

    // Get duplicate values for display
    const duplicateValues = useMemo(() => {
        const lines = textValue.split("\n").map(line => line.trim()).filter(Boolean)
        const seen = new Set()
        const duplicates = new Set()

        lines.forEach(line => {
            if (seen.has(line)) {
                duplicates.add(line)
            } else {
                seen.add(line)
            }
        })

        return Array.from(duplicates)
    }, [textValue])

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [])

    // Debounced onChange to prevent excessive updates
    const debouncedOnChange = useCallback((lines: string[]) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }
        debounceRef.current = setTimeout(() => {
            // Only call onChange if values actually changed
            const currentValues = lines
            const hasChanged = JSON.stringify(currentValues) !== JSON.stringify(initialValues)
            if (hasChanged) {
                onChange(currentValues)
            }
        }, 500) // 500ms debounce for smoother UX
    }, [onChange, initialValues])

    const handleTextChange = (text: string) => {
        setTextValue(text)
        // Preview updates automatically via useMemo
        // Debounced save will commit sanitized values
        debouncedOnChange(text.split("\n").map(line => line.trim()).filter(Boolean))
    }

    const handleRemoveValue = (valueToRemove: string) => {
        const lines = textValue.split("\n").map(line => line.trim()).filter(Boolean)
        const updatedLines = lines.filter(line => line !== valueToRemove)
        const updatedText = updatedLines.join("\n")
        setTextValue(updatedText)
        debouncedOnChange(updatedLines)
    }

    const handleImport = (importedValues: string[]) => {
        const importedText = importedValues.join("\n")
        setTextValue(importedText)
        onChange(importedValues) // Immediate update for import
    }

    const handleFormat = () => {
        const lines = textValue.split("\n").map(line => line.trim()).filter(Boolean)
        const formatted = lines.join("\n")
        setTextValue(formatted)
        onChange(lines) // Immediate update for actions
    }

    const handleSort = () => {
        const lines = textValue.split("\n").map(line => line.trim()).filter(Boolean)
        const sorted = [...lines].sort()
        const sortedText = sorted.join("\n")
        setTextValue(sortedText)
        onChange(sorted) // Immediate update for actions
    }

    const handleRemoveDuplicates = () => {
        const lines = textValue.split("\n").map(line => line.trim()).filter(Boolean)
        const unique = [...new Set(lines)]
        const uniqueText = unique.join("\n")
        setTextValue(uniqueText)
        onChange(unique) // Immediate update for actions
    }

    const handleExport = () => {
        const blob = new Blob([textValue], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "enumeration-values.txt"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const stats = {
        totalLines: previewValues.length,
        uniqueLines: new Set(previewValues).size,
        duplicates: previewValues.length - new Set(previewValues).size,
        characters: textValue.length
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Flush any pending debounced changes when closing
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
            const lines = textValue.split("\n").map(line => line.trim()).filter(Boolean)
            // Only call onChange if values actually changed
            const hasChanged = JSON.stringify(lines) !== JSON.stringify(initialValues)
            if (hasChanged) {
                onChange(lines)
            }
        }
        onOpenChange(newOpen)
    }

    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Bulk Edit Enumeration Values</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col space-y-4 min-h-0">
                        {/* Header with stats and actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">
                                    Values ({stats.totalLines})
                                </span>
                                {stats.duplicates > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                        {stats.duplicates} duplicates
                                    </Badge>
                                )}
                                {stats.totalLines > 0 && stats.duplicates === 0 && (
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                        <CheckCircle2 className="h-3 w-3" />
                                        All unique
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowImportDialog(true)}
                                >
                                    <Upload className="h-4 w-4 mr-1" />
                                    Import
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExport}
                                    disabled={stats.totalLines === 0}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    Export
                                </Button>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleFormat}
                                        disabled={stats.totalLines === 0}
                                    >
                                        <FileText className="h-4 w-4 mr-1" />
                                        Format
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-sm">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">Format Preview:</p>
                                            {formatHasChanges && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {formatPreview.length} values
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="bg-muted/50 p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
                                            {formatPreview.length === 0 ? (
                                                <span className="text-muted-foreground">No values to format</span>
                                            ) : (
                                                <div className="space-y-1">
                                                    {formatPreview.map((line, index) => (
                                                        <div key={index} className="flex items-center">
                                                            <span className="text-muted-foreground mr-2 text-xs">
                                                                {index + 1}.
                                                            </span>
                                                            <span>{line}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatHasChanges
                                                ? "Will trim whitespace and remove empty lines"
                                                : "No changes needed"
                                            }
                                        </p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSort}
                                        disabled={stats.totalLines === 0}
                                    >
                                        <SortAsc className="h-4 w-4 mr-1" />
                                        Sort A-Z
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-sm">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">Sort Preview:</p>
                                            {sortHasChanges && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {sortPreview.length} values
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="bg-muted/50 p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
                                            {sortPreview.length === 0 ? (
                                                <span className="text-muted-foreground">No values to sort</span>
                                            ) : (
                                                <div className="space-y-1">
                                                    {sortPreview.map((line, index) => (
                                                        <div key={index} className="flex items-center">
                                                            <span className="text-muted-foreground mr-2 text-xs">
                                                                {index + 1}.
                                                            </span>
                                                            <span>{line}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {sortHasChanges
                                                ? "Will sort values alphabetically"
                                                : "Values are already sorted"
                                            }
                                        </p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRemoveDuplicates}
                                        disabled={stats.duplicates === 0}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Remove Dupes
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-sm">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">Remove Duplicates Preview:</p>
                                            {removeDupesHasChanges && (
                                                <Badge variant="destructive" className="text-xs">
                                                    {stats.duplicates} duplicates
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="bg-muted/50 p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
                                            {removeDupesPreview.length === 0 ? (
                                                <span className="text-muted-foreground">No values to process</span>
                                            ) : (
                                                <div className="space-y-1">
                                                    {removeDupesPreview.map((line, index) => (
                                                        <div key={index} className="flex items-center">
                                                            <span className="text-muted-foreground mr-2 text-xs">
                                                                {index + 1}.
                                                            </span>
                                                            <span>{line}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {duplicateValues.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-destructive">Duplicates to remove:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {duplicateValues.map((dup, index) => (
                                                        <Badge key={index} variant="destructive" className="text-xs">
                                                            {dup}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {removeDupesHasChanges
                                                ? `Will remove ${stats.duplicates} duplicate(s), keeping ${removeDupesPreview.length} unique values`
                                                : "No duplicates found"
                                            }
                                        </p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Text input area */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Enter values (one per line)
                            </label>
                            <Textarea
                                value={textValue}
                                onChange={(e) => handleTextChange(e.target.value)}
                                onKeyDown={(e) => {
                                    // Allow normal Enter behavior for new lines
                                    if (e.key === 'Enter' && !e.ctrlKey) {
                                        // Let Enter insert newline normally - don't prevent default
                                        return
                                    }
                                    // Ctrl+Enter to save and close
                                    if (e.key === 'Enter' && e.ctrlKey) {
                                        e.preventDefault()
                                        handleOpenChange(false)
                                    }
                                }}
                                placeholder="Enter values, one per line... (Ctrl+Enter to save)"
                                className="bg-input border-border text-foreground font-mono text-sm resize-none min-h-[120px]"
                                style={{ lineHeight: "1.5" }}
                            />
                        </div>

                        {/* Preview area */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Preview ({stats.totalLines} values)
                            </label>
                            <div className="border rounded-md bg-muted/20 min-h-[200px] max-h-[300px]">
                                {previewValues.length === 0 ? (
                                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                        <div className="text-center">
                                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No values yet</p>
                                            <p className="text-xs">Start typing above to see preview</p>
                                        </div>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[200px] p-3">
                                        <div className="flex flex-wrap gap-2">
                                            {previewValues.map((value, index) => (
                                                <div
                                                    key={index}
                                                    className="group relative inline-flex items-center"
                                                >
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs font-mono pr-6 hover:bg-secondary/80 transition-colors duration-200"
                                                    >
                                                        {value}
                                                    </Badge>
                                                    <button
                                                        onClick={() => handleRemoveValue(value)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 bg-destructive/20 hover:bg-destructive/30 rounded-full p-0.5"
                                                        title={`Remove "${value}"`}
                                                    >
                                                        <X className="h-3 w-3 text-destructive" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </div>
                        </div>

                        {/* Help text */}
                        <p className="text-xs text-muted-foreground">
                            Enter one value per line. Changes are saved automatically. Press Ctrl+Enter to save and close.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {showImportDialog && (
                <EnumerationImportDialog
                    onImport={(importedValues) => {
                        handleImport(importedValues)
                        setShowImportDialog(false)
                    }}
                    onClose={() => setShowImportDialog(false)}
                />
            )}
        </TooltipProvider>
    )
}
