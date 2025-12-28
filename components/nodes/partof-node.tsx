"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { GitBranch } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getFacet } from "@/lib/facet-colors"
import type { Cardinality } from "@/lib/graph-types"

// Helper function to get cardinality badge info
function getCardinalityBadge(cardinality?: Cardinality) {
  if (!cardinality || cardinality === "required") {
    return { label: "R", variant: "default" as const, title: "Required" }
  }
  if (cardinality === "optional") {
    return { label: "O", variant: "secondary" as const, title: "Optional" }
  }
  if (cardinality === "prohibited") {
    return { label: "P", variant: "destructive" as const, title: "Prohibited" }
  }
  return { label: "R", variant: "default" as const, title: "Required" }
}

export function PartOfNode({ data, selected }: NodeProps) {
    const facet = getFacet("partOf")
    // Only show badge for requirement facets (when cardinality is defined or explicitly set)
    const showCardinality = data.cardinality !== undefined || data.isRequirement
    const cardinalityBadge = showCardinality ? getCardinalityBadge(data.cardinality as Cardinality) : null

    return (
        <Card
            className={`min-w-[220px] bg-card border-2 transition-all ${selected ? `${facet.border} ring-2 ${facet.ring}` : "border-border"}`}
        >
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded ${facet.iconBg}`}>
                        <GitBranch className={`h-4 w-4 ${facet.text}`} />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground font-mono">{data.entity}</h3>
                    {cardinalityBadge && (
                        <Badge variant={cardinalityBadge.variant} className="text-xs px-1.5 py-0" title={cardinalityBadge.title}>
                            {cardinalityBadge.label}
                        </Badge>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">Part Of</p>
                    {data.relation && (
                        <p className="text-xs text-muted-foreground">
                            <span className={facet.text}>Relation:</span>
                            <span className="ml-2 text-foreground font-mono">{data.relation}</span>
                        </p>
                    )}
                </div>
            </div>
            <Handle type="source" position={Position.Right} className={facet.handle} />
        </Card>
    )
}
