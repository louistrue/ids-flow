"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { GitBranch } from "lucide-react"

export function PartOfNode({ data, selected }: NodeProps) {
    return (
        <Card
            className={`min-w-[220px] bg-card border-2 transition-all ${selected ? "border-chart-1 shadow-lg" : "border-border"
                }`}
        >
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-chart-1/10">
                        <GitBranch className="h-4 w-4 text-chart-1" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground font-mono">{data.entity}</h3>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">Part Of</p>
                    {data.relation && (
                        <p className="text-xs text-muted-foreground">
                            <span className="text-chart-1">Relation:</span>
                            <span className="ml-2 text-foreground font-mono">{data.relation}</span>
                        </p>
                    )}
                </div>
            </div>
            <Handle type="source" position={Position.Right} style={{ background: "oklch(0.65 0.15 140)" }} />
        </Card>
    )
}
