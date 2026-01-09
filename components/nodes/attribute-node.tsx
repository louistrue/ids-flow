"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Database } from "lucide-react"
import { getFacet } from "@/lib/facet-colors"
import type { Cardinality } from "@/lib/graph-types"

// Helper function to get cardinality badge styling
function getCardinalityBadge(cardinality?: Cardinality) {
    if (!cardinality || cardinality === "required") {
        return { label: "R", title: "Required", color: "bg-emerald-500 text-white" }
    }
    if (cardinality === "optional") {
        return { label: "O", title: "Optional", color: "bg-amber-500 text-white" }
    }
    if (cardinality === "prohibited") {
        return { label: "P", title: "Prohibited", color: "bg-red-500 text-white" }
    }
    return { label: "R", title: "Required", color: "bg-emerald-500 text-white" }
}

export function AttributeNode({ data, selected }: NodeProps) {
    const facet = getFacet("attribute")
    const showCardinality = data.isInRequirements === true
    const badge = showCardinality ? getCardinalityBadge(data.cardinality as Cardinality) : null

    return (
        <Card
            className={`min-w-[200px] bg-card border-2 transition-all ${selected ? `${facet.border} ring-2 ${facet.ring}` : "border-border"}`}
        >
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded ${facet.iconBg}`}>
                        <Database className={`h-4 w-4 ${facet.text}`} />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground font-mono flex-1 truncate">{data.name}</h3>
                </div>
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-mono">Attribute</p>
                        {data.value && (
                            <p className="text-xs text-muted-foreground">
                                <span className={facet.text}>Value:</span>
                                <span className="ml-2 text-foreground">{data.value}</span>
                            </p>
                        )}
                    </div>
                    {badge && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.color}`} title={badge.title}>
                            {badge.label}
                        </span>
                    )}
                </div>
            </div>
            <Handle type="source" position={Position.Right} className={facet.handle} />
        </Card>
    )
}
