"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Box } from "lucide-react"

export function EntityNode({ data, selected }: NodeProps) {
  return (
    <Card
      className={`min-w-[200px] bg-card border-2 transition-all ${selected ? "border-accent shadow-lg" : "border-border"
        }`}
    >
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-accent/10">
            <Box className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground font-mono">{data.name}</h3>
            {data.predefinedType && <p className="text-xs text-muted-foreground font-mono">{data.predefinedType}</p>}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="bg-accent" />
    </Card>
  )
}
