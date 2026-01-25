"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Box, Tag, Layers, Package, GitBranch, Filter, Database } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { FACET_COLORS } from "@/lib/facet-colors"
import type { IFCVersion } from "@/lib/ifc-schema"
import { useReactFlow } from "@xyflow/react"

interface NodePaletteProps {
  onAddNode: (type: string, position: { x: number; y: number }) => void
  ifcVersion: IFCVersion
}

const nodeCategories = [
  {
    title: "Core",
    nodes: [
      { type: "spec", label: "Specification", icon: FileText },
      { type: "entity", label: "Entity", icon: Box },
      { type: "property", label: "Property", icon: Tag },
    ],
  },
  {
    title: "Advanced",
    nodes: [
      { type: "attribute", label: "Attribute", icon: Database },
      { type: "classification", label: "Classification", icon: Layers },
      { type: "material", label: "Material", icon: Package },
      { type: "partOf", label: "Part Of", icon: GitBranch },
    ],
  },
  {
    title: "Restrictions",
    nodes: [{ type: "restriction", label: "Restriction", icon: Filter, color: "text-muted-foreground" }],
  },
]

export function NodePalette({ onAddNode, ifcVersion }: NodePaletteProps) {
  const reactFlow = useReactFlow()

  const handleAddNode = (type: string) => {
    // Get the bounding rectangle of the flow container
    const flowBounds = document.querySelector('.react-flow')?.getBoundingClientRect()

    if (flowBounds) {
      // Calculate the center point of the visible canvas area
      // Using the actual position on screen, accounting for sidebar offset
      const centerX = flowBounds.left + flowBounds.width / 2
      const centerY = flowBounds.top + flowBounds.height / 2

      // Convert screen coordinates to flow coordinates
      const position = reactFlow.screenToFlowPosition({ x: centerX, y: centerY })

      onAddNode(type, position)
    } else {
      // Fallback to a default position if we can't get the viewport
      onAddNode(type, { x: 400, y: 200 })
    }
  }

  return (
    <Card className="hidden md:flex md:flex-col w-64 shrink-0 rounded-none border-r border-border bg-sidebar">
      <div className="shrink-0 p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Node Palette</h2>
        <p className="text-sm text-muted-foreground mt-1">Click to add nodes to canvas</p>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          {nodeCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {category.title}
              </h3>
              <div className="space-y-2">
                {category.nodes.map((node) => {
                  const Icon = node.icon
                  const facet = FACET_COLORS[node.type as keyof typeof FACET_COLORS]
                  return (
                    <Button
                      key={node.type}
                      variant="ghost"
                      className="node-palette-btn w-full justify-start gap-3 h-auto py-3 hover:bg-sidebar-accent transition-all"
                      data-facet={node.type}
                      onClick={() => handleAddNode(node.type)}
                    >
                      <Icon className={`h-4 w-4 ${facet?.text ?? "text-primary"} transition-transform group-hover:scale-110`} />
                      <span className="text-sm text-sidebar-foreground">{node.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}

        </div>
      </ScrollArea>
    </Card>
  )
}
