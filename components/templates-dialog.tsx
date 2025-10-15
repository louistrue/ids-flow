"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Flame,
  Building2,
  Zap,
  Shield,
  Tag,
  Grid3x3,
  Package,
  MapPin,
  ListFilter
} from "lucide-react"
import { SPEC_TEMPLATES, getTemplateCategories } from "@/lib/templates"
import type { SpecTemplate } from "@/lib/templates"

interface TemplatesDialogProps {
  onApplyTemplate: (template: SpecTemplate) => void
}

const categoryIcons: Record<string, any> = {
  Safety: Flame,
  Structure: Building2,
  Energy: Zap,
  Space: FileText,
  Naming: Tag,
  Classification: Grid3x3,
  Material: Package,
  Spatial: MapPin,
  Restriction: ListFilter,
}

const categoryColors: Record<string, string> = {
  Safety: "text-red-500",
  Structure: "text-blue-500",
  Energy: "text-orange-500",
  Space: "text-purple-500",
  Naming: "text-green-500",
  Classification: "text-cyan-500",
  Material: "text-amber-500",
  Spatial: "text-indigo-500",
  Restriction: "text-pink-500",
}

export function TemplatesDialog({ onApplyTemplate }: TemplatesDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const categories = getTemplateCategories()

  const filteredTemplates = selectedCategory
    ? SPEC_TEMPLATES.filter((t) => t.category === selectedCategory)
    : SPEC_TEMPLATES

  const handleApplyTemplate = (template: SpecTemplate) => {
    onApplyTemplate(template)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Specification Templates</DialogTitle>
          <DialogDescription>Choose a template to quickly create common IFC specifications</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => {
            const Icon = categoryIcons[category] || Shield
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {category}
              </Button>
            )
          })}
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-2 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = categoryIcons[template.category] || Shield
              const colorClass = categoryColors[template.category] || "text-foreground"
              return (
                <div
                  key={template.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors cursor-pointer"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-accent/10 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-foreground mb-1">{template.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{template.nodes.length} nodes</span>
                    <span>•</span>
                    <span>{template.edges.length} connections</span>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
