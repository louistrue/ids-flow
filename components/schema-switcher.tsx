"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { IFCVersion } from "@/lib/ifc-schema"

interface SchemaSwitcherProps {
  version: IFCVersion
  onVersionChange: (version: IFCVersion) => void
}

const versionConfig: Record<IFCVersion, { label: string; badge: string; badgeVariant: "outline" | "default" | "secondary" }> = {
  IFC2X3: { label: "IFC2x3", badge: "Legacy", badgeVariant: "outline" },
  IFC4: { label: "IFC4", badge: "Stable", badgeVariant: "secondary" },
  IFC4X3_ADD2: { label: "IFC4X3", badge: "Latest", badgeVariant: "default" },
}

export function SchemaSwitcher({ version, onVersionChange }: SchemaSwitcherProps) {
  const config = versionConfig[version]

  return (
    <div className="flex items-center h-8 bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <span className="px-3 text-xs text-muted-foreground border-r border-border bg-muted/30">
        Schema
      </span>
      <Select value={version} onValueChange={(value) => onVersionChange(value as IFCVersion)}>
        <SelectTrigger className="h-full border-0 rounded-none bg-transparent px-3 gap-2 text-sm font-medium min-w-[120px] focus:ring-0 focus:ring-offset-0">
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
