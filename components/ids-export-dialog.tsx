"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { IdsMetadata } from "@/lib/graph-types"

interface IdsExportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onExport: (metadata?: IdsMetadata) => void
}

// Email validation matching XSD pattern: [^@]+@[^\.]+\..+
function isValidEmail(email: string): boolean {
    if (!email || email.trim() === "") return false
    const pattern = /^[^@]+@[^\.]+\..+$/
    return pattern.test(email.trim())
}

export function IdsExportDialog({ open, onOpenChange, onExport }: IdsExportDialogProps) {
    const [title, setTitle] = useState("")
    const [author, setAuthor] = useState("")
    const [authorError, setAuthorError] = useState("")
    const [copyright, setCopyright] = useState("")
    const [version, setVersion] = useState("")
    const [description, setDescription] = useState("")
    const [purpose, setPurpose] = useState("")
    const [milestone, setMilestone] = useState("")

    // Check if user has entered any metadata
    const hasMetadata = title.trim() !== "" ||
        author.trim() !== "" ||
        copyright.trim() !== "" ||
        version.trim() !== "" ||
        description.trim() !== "" ||
        purpose.trim() !== "" ||
        milestone.trim() !== ""

    const handleExport = () => {
        // If no metadata entered, export without it
        if (!hasMetadata) {
            onExport(undefined)
            onOpenChange(false)
            return
        }

        // Validate author email format only if provided
        const trimmedAuthor = author.trim()
        if (trimmedAuthor !== "" && !isValidEmail(trimmedAuthor)) {
            setAuthorError("Author must be a valid email address (e.g., user@example.com)")
            return
        }

        const metadata: IdsMetadata = {
            title: title.trim() || "Untitled IDS",
            author: trimmedAuthor !== "" ? trimmedAuthor : undefined,
            copyright: copyright.trim() || undefined,
            version: version.trim() || undefined,
            description: description.trim() || undefined,
            purpose: purpose.trim() || undefined,
            milestone: milestone.trim() || undefined,
            date: new Date().toISOString().split('T')[0],
        }
        onExport(metadata)
        onOpenChange(false)
        // Reset form
        setTitle("")
        setAuthor("")
        setAuthorError("")
        setCopyright("")
        setVersion("")
        setDescription("")
        setPurpose("")
        setMilestone("")
    }

    const handleAuthorChange = (value: string) => {
        setAuthor(value)
        // Only validate if user has entered something
        const trimmed = value.trim()
        if (trimmed !== "" && !isValidEmail(trimmed)) {
            setAuthorError("Must be a valid email address")
        } else {
            setAuthorError("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Export IDS</DialogTitle>
                    <DialogDescription>
                        Add optional metadata to your IDS file.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Uses first specification name if empty"
                            className="bg-input border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="author" className="text-sm">
                            Author
                        </Label>
                        <Input
                            id="author"
                            type="email"
                            value={author}
                            onChange={(e) => handleAuthorChange(e.target.value)}
                            placeholder="user@example.com"
                            className={`bg-input border-border text-foreground ${authorError ? "border-destructive" : ""}`}
                            aria-invalid={!!authorError}
                        />
                        {authorError && (
                            <p className="text-xs text-destructive">{authorError}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="copyright" className="text-sm">
                            Copyright
                        </Label>
                        <Input
                            id="copyright"
                            value={copyright}
                            onChange={(e) => setCopyright(e.target.value)}
                            placeholder="e.g., © 2024 Company Name"
                            className="bg-input border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="version" className="text-sm">
                            Version
                        </Label>
                        <Input
                            id="version"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            placeholder="e.g., 1.0.0"
                            className="bg-input border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this IDS file..."
                            className="bg-input border-border text-foreground min-h-[80px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="purpose" className="text-sm">
                            Purpose
                        </Label>
                        <Input
                            id="purpose"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder="e.g., Fire Safety Compliance"
                            className="bg-input border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="milestone" className="text-sm">
                            Milestone
                        </Label>
                        <Input
                            id="milestone"
                            value={milestone}
                            onChange={(e) => setMilestone(e.target.value)}
                            placeholder="e.g., Design Development"
                            className="bg-input border-border text-foreground"
                        />
                    </div>
                </div>
                <DialogFooter>
                    {hasMetadata ? (
                        <>
                            <Button variant="outline" onClick={() => {
                                // Reset and export without metadata
                                setTitle("")
                                setAuthor("")
                                setAuthorError("")
                                setCopyright("")
                                setVersion("")
                                setDescription("")
                                setPurpose("")
                                setMilestone("")
                                onExport(undefined)
                                onOpenChange(false)
                            }}>
                                Export Without Metadata
                            </Button>
                            <Button onClick={handleExport}>
                                Export with Metadata
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleExport} className="w-full sm:w-auto">
                            Export
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
