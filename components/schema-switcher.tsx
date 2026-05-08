"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HelpCircle } from "lucide-react"
import type { IFCVersion } from "@/lib/ifc-schema"

interface SchemaSwitcherProps {
  version: IFCVersion
  onVersionChange: (version: IFCVersion) => void
}

const versionConfig: Record<IFCVersion, { label: string; badge: string; badgeVariant: "outline" | "default" | "secondary" }> = {
  IFC2X3: { label: "IFC2x3", badge: "Legacy", badgeVariant: "outline" },
  IFC4: { label: "IFC4", badge: "Stable", badgeVariant: "secondary" },
  IFC4X3_ADD2: { label: "IFC4X3 ADD2", badge: "Latest", badgeVariant: "default" },
}

export function SchemaSwitcher({ version, onVersionChange }: SchemaSwitcherProps) {
  const config = versionConfig[version]

  return (
    <div className="flex items-center h-8 bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <span className="px-3 text-xs text-muted-foreground border-r border-border bg-muted/30 inline-flex items-center gap-1.5">
        Schema
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="What does Schema mean?"
              className="text-muted-foreground/70 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 text-xs space-y-2">
            <p className="font-semibold text-sm text-foreground">IFC Schema Version</p>
            <p className="text-muted-foreground">
              Sets the IFC schema this IDS file targets. The official IDS XSD only
              accepts these three values:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              <li><span className="font-mono">IFC2X3</span> — legacy</li>
              <li><span className="font-mono">IFC4</span> — widely supported</li>
              <li><span className="font-mono">IFC4X3_ADD2</span> — latest IDS-recognized</li>
            </ul>
            <p className="text-muted-foreground">
              Newer IFC releases (e.g. IFC4.4) aren&apos;t in the IDS schema yet, so
              they&apos;re intentionally not listed — picking one would fail XSD
              validation downstream.
            </p>
            <p className="text-muted-foreground">
              The selection here is also used as the default for any new
              Specification node you drop on the canvas. You can still override it
              per-spec from the inspector.
            </p>
          </PopoverContent>
        </Popover>
      </span>
      <Select value={version} onValueChange={(value) => onVersionChange(value as IFCVersion)}>
        <SelectTrigger className="h-full border-0 rounded-none bg-transparent px-3 gap-2 text-sm font-medium min-w-[140px] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1">
          <div className="flex items-center gap-2">
            <span>{config.label}</span>
            <Badge variant={config.badgeVariant} className="text-[10px] px-1.5 py-0">
              {config.badge}
            </Badge>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="IFC2X3">
            <div className="flex items-center gap-3">
              <span className="font-medium">IFC2x3</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">Legacy</Badge>
            </div>
          </SelectItem>
          <SelectItem value="IFC4">
            <div className="flex items-center gap-3">
              <span className="font-medium">IFC4</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Stable</Badge>
            </div>
          </SelectItem>
          <SelectItem value="IFC4X3_ADD2">
            <div className="flex items-center gap-3">
              <span className="font-medium">IFC4X3 ADD2</span>
              <Badge variant="default" className="text-[10px] px-1.5 py-0">Latest</Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
