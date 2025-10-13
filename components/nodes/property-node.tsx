"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Tag } from "lucide-react"

export function PropertyNode({ data, selected }: NodeProps) {
  return (
    <Card
      className={`min-w-[220px] bg-card border-2 transition-all ${selected ? "border-chart-3 shadow-lg" : "border-border"
        }`}
    >
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded bg-chart-3/10">
            <Tag className="h-4 w-4 text-chart-3" />
          </div>
          <h3 className="font-semibold text-sm text-foreground font-mono">{data.baseName}</h3>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-mono">{data.propertySet}</p>
          <p className="text-xs text-muted-foreground">
            <span className="text-chart-3">{data.dataType}</span>
            {data.value && <span className="ml-2 text-foreground">= {data.value}</span>}
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: "oklch(0.65 0.15 140)" }} />
    </Card>
  )
}
