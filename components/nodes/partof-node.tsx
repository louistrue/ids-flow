"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { GitBranch } from "lucide-react"
import { getFacet } from "@/lib/facet-colors"

export function PartOfNode({ data, selected }: NodeProps) {
    const facet = getFacet("partOf")
    return (
        <Card
            className={`min-w-[220px] bg-card border-2 transition-all ${selected ? `${facet.border} ring-2 ${facet.ring}` : "border-border"}`}
        >
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded ${facet.iconBg}`}>
                        <GitBranch className={`h-4 w-4 ${facet.text}`} />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground font-mono">{data.entity}</h3>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">Part Of</p>
                    {data.relation && (
                        <p className="text-xs text-muted-foreground">
                            <span className={facet.text}>Relation:</span>
                            <span className="ml-2 text-foreground font-mono">{data.relation}</span>
                        </p>
                    )}
                </div>
            </div>
            <Handle type="source" position={Position.Right} className={facet.handle} />
        </Card>
    )
}
