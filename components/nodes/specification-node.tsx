"use client"

import { type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { PortLabelRow } from "./port-label-row"
import { type SpecificationNodeData } from "@/lib/graph-types"

export function SpecificationNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as SpecificationNodeData & {
    highlightTarget?: 'applicability' | 'requirements'
    highlightColor?: string
    highlightSourceId?: string
  }
  return (
    <Card
      className={`w-[280px] bg-card border-2 transition-all ${selected ? "border-primary ring-2 ring-primary/40" : "border-border"}`}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">{nodeData.name}</h3>
            <p className="text-xs text-muted-foreground">{nodeData.ifcVersion}</p>
          </div>
        </div>
        {nodeData.description && (
          <div className="mb-3 p-2 bg-muted/30 rounded border border-border">
            <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{nodeData.description}</p>
          </div>
        )}
        <div className="mt-4 pt-3 border-t border-border space-y-4">
          <PortLabelRow
            id="applicability"
            label="Applicability"
            handleColor="bg-accent"
            highlighted={nodeData.highlightTarget === 'applicability'}
            highlightColor={nodeData.highlightColor}
            highlightSourceId={nodeData.highlightSourceId}
          />
          <PortLabelRow
            id="requirements"
            label="Requirements"
            handleColor="bg-chart-3"
            highlighted={nodeData.highlightTarget === 'requirements'}
            highlightColor={nodeData.highlightColor}
            highlightSourceId={nodeData.highlightSourceId}
          />
        </div>
      </div>
    </Card>
  )
}

