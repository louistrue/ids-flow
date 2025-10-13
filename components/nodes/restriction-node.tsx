"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Filter } from "lucide-react"

export function RestrictionNode({ data, selected }: NodeProps) {
    const getRestrictionSummary = () => {
        switch (data.restrictionType) {
            case "enumeration":
                return `${data.values?.length || 0} values`
            case "pattern":
                return `Pattern: ${data.pattern || "regex"}`
            case "bounds":
                return `Min: ${data.minValue || "?"}, Max: ${data.maxValue || "?"}`
            case "length":
                return `Length: ${data.minLength || "?"}-${data.maxLength || "?"}`
            default:
                return "Restriction"
        }
    }

    return (
        <Card
            className={`min-w-[200px] bg-card border-2 transition-all ${selected ? "border-muted-foreground shadow-lg" : "border-border"
                }`}
        >
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-muted-foreground/10">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground font-mono">{data.restrictionType}</h3>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">Restriction</p>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-muted-foreground">Constraint:</span>
                        <span className="ml-2 text-foreground">{getRestrictionSummary()}</span>
                    </p>
                </div>
            </div>
            <Handle type="target" position={Position.Left} style={{ background: "oklch(0.45 0.15 180)" }} />
            <Handle type="source" position={Position.Right} style={{ background: "oklch(0.65 0.15 140)" }} />
        </Card>
    )
}
