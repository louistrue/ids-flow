"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { IFCVersion } from "@/lib/ifc-schema"

interface SchemaSwitcherProps {
  version: IFCVersion
  onVersionChange: (version: IFCVersion) => void
}

export function SchemaSwitcher({ version, onVersionChange }: SchemaSwitcherProps) {
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-2 shadow-lg flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Schema:</span>
      <Select value={version} onValueChange={(value) => onVersionChange(value as IFCVersion)}>
        <SelectTrigger className="w-[200px] bg-input border-border text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="IFC2X3">
            <div className="flex items-center gap-2">
              <span>IFC2x3</span>
              <Badge variant="outline" className="text-xs">
                Legacy
              </Badge>
            </div>
          </SelectItem>
          <SelectItem value="IFC4">
            <div className="flex items-center gap-2">
              <span>IFC4</span>
              <Badge variant="outline" className="text-xs">
                Stable
              </Badge>
            </div>
          </SelectItem>
          <SelectItem value="IFC4X3_ADD2">
            <div className="flex items-center gap-2">
              <span>IFC4X3 ADD2</span>
              <Badge variant="default" className="text-xs">
                Latest
              </Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
