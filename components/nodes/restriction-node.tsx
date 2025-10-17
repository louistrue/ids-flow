"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Filter } from "lucide-react"
import { getFacet } from "@/lib/facet-colors"

export function RestrictionNode({ data, selected }: NodeProps) {
    const facet = getFacet("restriction")
    const getRestrictionSummary = () => {
        switch (data.restrictionType) {
            case "enumeration":
                const count = data.values?.length || 0
                if (count === 0) return "No values"
                if (count === 1) return `1 value: ${data.values[0]}`
                if (count <= 3) return `${count} values: ${data.values.join(", ")}`
                return `${count} values`
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
            className={`min-w-[200px] bg-card border-2 transition-all ${selected ? `${facet.border} ring-2 ${facet.ring}` : "border-border"}`}
        >
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded ${facet.iconBg}`}>
                        <Filter className={`h-4 w-4 ${facet.text}`} />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground font-mono">{data.restrictionType}</h3>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">Restriction</p>
                    <p className="text-xs text-muted-foreground">
                        <span className={facet.text}>Constraint:</span>
                        <span className="ml-2 text-foreground">{getRestrictionSummary()}</span>
                    </p>
                </div>
            </div>
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-blue-500 border-2 border-white hover:bg-blue-600 transition-colors"
                title="Connect from facet nodes (property, attribute, material, classification)"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 bg-green-500 border-2 border-white hover:bg-green-600 transition-colors"
                title="Connect to spec node (requirements/applicability)"
            />
        </Card>
    )
}
