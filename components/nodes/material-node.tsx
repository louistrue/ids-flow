"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Package } from "lucide-react"
import { getFacet } from "@/lib/facet-colors"

export function MaterialNode({ data, selected }: NodeProps) {
    const facet = getFacet("material")
    return (
        <Card
            className={`min-w-[200px] bg-card border-2 transition-all ${selected ? `${facet.border} ring-2 ${facet.ring}` : "border-border"}`}
        >
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded ${facet.iconBg}`}>
                        <Package className={`h-4 w-4 ${facet.text}`} />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground font-mono">{data.value || "Material"}</h3>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">Material</p>
                    {data.uri && (
                        <p className="text-xs text-muted-foreground truncate">
                            <span className={facet.text}>URI:</span>
                            <span className="ml-2 text-foreground">{data.uri}</span>
                        </p>
                    )}
                </div>
            </div>
            <Handle type="source" position={Position.Right} className={facet.handle} />
        </Card>
    )
}
