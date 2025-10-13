"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"

export function SpecificationNode({ data, selected }: NodeProps) {
  return (
    <Card
      className={`min-w-[250px] bg-card border-2 transition-all ${selected ? "border-primary shadow-lg" : "border-border"
        }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">{data.name}</h3>
            <p className="text-xs text-muted-foreground">{data.ifcVersion}</p>
          </div>
        </div>
        {data.description && <p className="text-xs text-muted-foreground line-clamp-2">{data.description}</p>}
        <div className="mt-4 pt-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Applicability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-chart-3" />
            <span className="text-xs text-muted-foreground">Requirements</span>
          </div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="applicability"
        style={{ top: "70%" }}
        className="bg-accent"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="requirements"
        style={{ top: "85%" }}
        className="bg-chart-3"
      />
    </Card>
  )
}
