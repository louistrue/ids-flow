"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

interface EnumerationImportDialogProps {
    onImport: (values: string[]) => void
    onClose: () => void
}

export function EnumerationImportDialog({ onImport, onClose }: EnumerationImportDialogProps) {
    const [inputText, setInputText] = useState("")
    const [removeDuplicates, setRemoveDuplicates] = useState(true)
    const [trimWhitespace, setTrimWhitespace] = useState(true)
    const [sortAlphabetically, setSortAlphabetically] = useState(false)

    const parsedValues = useMemo(() => {
        if (!inputText.trim()) return []

        let values: string[] = []

        // Try to detect format
        if (inputText.includes(",")) {
            // Comma-separated
            values = inputText.split(",").map(v => v.trim()).filter(v => v)
        } else if (inputText.includes(";")) {
            // Semicolon-separated
            values = inputText.split(";").map(v => v.trim()).filter(v => v)
        } else if (inputText.includes("\t")) {
            // Tab-separated
            values = inputText.split("\t").map(v => v.trim()).filter(v => v)
        } else {
            // Line-separated (default)
            values = inputText.split("\n").map(v => v.trim()).filter(v => v)
        }

        // Apply preprocessing
        if (trimWhitespace) {
            values = values.map(v => v.trim()).filter(v => v)
        }

        if (removeDuplicates) {
            values = [...new Set(values)]
        }

        if (sortAlphabetically) {
            values = [...values].sort()
        }

        return values
    }, [inputText, removeDuplicates, trimWhitespace, sortAlphabetically])

    const formatDetection = useMemo(() => {
        if (!inputText.trim()) return "Unknown"

        if (inputText.includes(",")) return "Comma-separated"
        if (inputText.includes(";")) return "Semicolon-separated"
        if (inputText.includes("\t")) return "Tab-separated"
        return "Line-separated"
    }, [inputText])

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target?.result as string
            setInputText(content)
        }
        reader.readAsText(file)
    }

    const handleImport = () => {
        onImport(parsedValues)
    }

    const previewCount = Math.min(10, parsedValues.length)
    const remainingCount = Math.max(0, parsedValues.length - previewCount)

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Import Enumeration Values</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Input methods */}
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById("file-upload")?.click()}
                            >
                                <Upload className="h-4 w-4 mr-1" />
                                Upload File
                            </Button>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".txt,.csv,.json"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <span className="text-xs text-muted-foreground self-center">
                                Supports TXT, CSV, JSON formats
                            </span>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paste-text">Paste Text</Label>
                            <Textarea
                                id="paste-text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Paste your enumeration values here..."
                                className="bg-input border-border text-foreground min-h-[120px] font-mono text-sm"
                            />
                        </div>
                    </div>

                    {/* Format detection */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        <span className="text-sm text-muted-foreground">
                            Format Detection: {formatDetection}
                        </span>
                    </div>

                    {/* Preview */}
                    {parsedValues.length > 0 && (
                        <div className="space-y-2">
                            <Label>Preview ({parsedValues.length} values)</Label>
                            <ScrollArea className="h-32 border rounded-md">
                                <div className="p-2 space-y-1">
                                    {parsedValues.slice(0, previewCount).map((value, index) => (
                                        <div key={index} className="text-sm font-mono">
                                            {index + 1}. {value}
                                        </div>
                                    ))}
                                    {remainingCount > 0 && (
                                        <div className="text-sm text-muted-foreground italic">
                                            ... and {remainingCount} more
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {/* Processing options */}
                    <div className="space-y-3">
                        <Label>Processing Options</Label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remove-duplicates"
                                    checked={removeDuplicates}
                                    onCheckedChange={setRemoveDuplicates}
                                />
                                <Label htmlFor="remove-duplicates" className="text-sm">
                                    Remove duplicates
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="trim-whitespace"
                                    checked={trimWhitespace}
                                    onCheckedChange={setTrimWhitespace}
                                />
                                <Label htmlFor="trim-whitespace" className="text-sm">
                                    Trim whitespace
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="sort-alphabetically"
                                    checked={sortAlphabetically}
                                    onCheckedChange={setSortAlphabetically}
                                />
                                <Label htmlFor="sort-alphabetically" className="text-sm">
                                    Sort alphabetically
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={parsedValues.length === 0}
                        >
                            Import {parsedValues.length} Values
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

