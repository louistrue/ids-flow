"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Box } from "lucide-react"
import { getFacet } from "@/lib/facet-colors"
import type { Cardinality } from "@/lib/graph-types"

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

export function EntityNode({ data, selected }: NodeProps) {
  const facet = getFacet("entity")
  // Only show cardinality badge when entity is in requirements (has cardinality defined)
  const showCardinality = data.cardinality !== undefined
  const cardinalityBadge = showCardinality ? getCardinalityBadge(data.cardinality as Cardinality) : null

  return (
    <Card
      className={`min-w-[200px] bg-card border-2 transition-all ${selected ? `${facet.border} ring-2 ${facet.ring}` : "border-border"}`}
    >
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded ${facet.iconBg}`}>
            <Box className={`h-4 w-4 ${facet.text}`} />
          </div>
          <h3 className="font-semibold text-sm text-foreground font-mono">{data.name}</h3>
          {cardinalityBadge && (
            <Badge variant={cardinalityBadge.variant} className="text-xs px-1.5 py-0" title={cardinalityBadge.title}>
              {cardinalityBadge.label}
            </Badge>
          )}
        </div>
        {data.predefinedType && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-mono">{data.predefinedType}</p>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className={facet.handle} />
    </Card>
  )
}
