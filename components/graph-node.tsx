"use client"

import type { GraphNode } from "@/lib/graph-types"
import { Card } from "@/components/ui/card"
import { FileText, Box, Tag } from "lucide-react"

interface GraphNodeComponentProps {
  node: GraphNode
  selected: boolean
}

export function GraphNodeComponent({ node, selected }: GraphNodeComponentProps) {
  if (node.type === "spec") {
    return (
      <Card
        className={`min-w-[250px] bg-card border-2 transition-all ${
          selected ? "border-primary shadow-lg" : "border-border"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground">{node.data.name}</h3>
              <p className="text-xs text-muted-foreground">{node.data.ifcVersion}</p>
            </div>
          </div>
          {node.data.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{node.data.description}</p>
          )}
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
      </Card>
    )
  }

  if (node.type === "entity") {
    return (
      <Card
        className={`min-w-[200px] bg-card border-2 transition-all ${
          selected ? "border-accent shadow-lg" : "border-border"
        }`}
      >
        <div className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-accent/10">
              <Box className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground font-mono">{node.data.name}</h3>
              {node.data.predefinedType && (
                <p className="text-xs text-muted-foreground font-mono">{node.data.predefinedType}</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (node.type === "property") {
    return (
      <Card
        className={`min-w-[220px] bg-card border-2 transition-all ${
          selected ? "border-chart-3 shadow-lg" : "border-border"
        }`}
      >
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded bg-chart-3/10">
              <Tag className="h-4 w-4 text-chart-3" />
            </div>
            <h3 className="font-semibold text-sm text-foreground font-mono">{node.data.baseName}</h3>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-mono">{node.data.propertySet}</p>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-3">{node.data.dataType}</span>
              {node.data.value && <span className="ml-2 text-foreground">= {node.data.value}</span>}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
