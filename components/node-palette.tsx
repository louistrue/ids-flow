"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Box, Tag, Layers, Package, GitBranch, Filter, Database, Info } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface NodePaletteProps {
  onAddNode: (type: string, position: { x: number; y: number }) => void
}

const nodeCategories = [
  {
    title: "Core",
    nodes: [
      { type: "spec", label: "Specification", icon: FileText, color: "text-primary" },
      { type: "entity", label: "Entity", icon: Box, color: "text-accent" },
      { type: "property", label: "Property", icon: Tag, color: "text-chart-3" },
    ],
  },
  {
    title: "Advanced",
    nodes: [
      { type: "attribute", label: "Attribute", icon: Database, color: "text-chart-4" },
      { type: "classification", label: "Classification", icon: Layers, color: "text-chart-5" },
      { type: "material", label: "Material", icon: Package, color: "text-chart-2" },
      { type: "partOf", label: "Part Of", icon: GitBranch, color: "text-chart-1" },
    ],
  },
  {
    title: "Restrictions",
    nodes: [{ type: "restriction", label: "Restriction", icon: Filter, color: "text-muted-foreground" }],
  },
]

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const handleAddNode = (type: string) => {
    // Add node to center of viewport
    onAddNode(type, { x: 400, y: 200 })
  }

  return (
    <Card className="w-64 h-full rounded-none border-r border-border bg-sidebar">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Node Palette</h2>
        <p className="text-sm text-muted-foreground mt-1">Click to add nodes to canvas</p>
      </div>
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-6">
          {nodeCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {category.title}
              </h3>
              <div className="space-y-2">
                {category.nodes.map((node) => {
                  const Icon = node.icon
                  return (
                    <Button
                      key={node.type}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-3 hover:bg-sidebar-accent"
                      onClick={() => handleAddNode(node.type)}
                    >
                      <Icon className={`h-4 w-4 ${node.color}`} />
                      <span className="text-sm text-sidebar-foreground">{node.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}

          <Separator className="my-4" />

          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Quick Tip</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Use templates for common specifications or clone existing specs as profiles for variants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  )
}
