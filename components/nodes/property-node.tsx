"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Tag, Filter } from "lucide-react"
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

export function PropertyNode({ data, selected }: NodeProps) {
  const facet = getFacet("property")
  const cardinalityBadge = getCardinalityBadge(data.cardinality as Cardinality)

  return (
    <Card
      className={`min-w-[220px] bg-card border-2 transition-all ${selected ? `${facet.border} ring-2 ${facet.ring}` : "border-border"}`}
    >
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded ${facet.iconBg}`}>
            <Tag className={`h-4 w-4 ${facet.text}`} />
          </div>
          <h3 className="font-semibold text-sm text-foreground font-mono">{data.baseName}</h3>
          <Badge variant={cardinalityBadge.variant} className="text-xs px-1.5 py-0" title={cardinalityBadge.title}>
            {cardinalityBadge.label}
          </Badge>
          {data.entityContext && (
            <Badge variant="secondary" className="ml-auto text-xs">
              <Filter className="h-3 w-3 mr-1" />
              {data.entityContext}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-mono">{data.propertySet}</p>
          <p className="text-xs text-muted-foreground">
            <span className={facet.text}>{data.dataType}</span>
            {data.value && <span className="ml-2 text-foreground">= {data.value}</span>}
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className={facet.handle} />
    </Card>
  )
}
