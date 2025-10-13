"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Package } from "lucide-react"

export function MaterialNode({ data, selected }: NodeProps) {
    return (
        <Card
            className={`min-w-[200px] bg-card border-2 transition-all ${selected ? "border-chart-2 shadow-lg" : "border-border"
                }`}
        >
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-chart-2/10">
                        <Package className="h-4 w-4 text-chart-2" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground font-mono">{data.value || "Material"}</h3>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">Material</p>
                    {data.uri && (
                        <p className="text-xs text-muted-foreground truncate">
                            <span className="text-chart-2">URI:</span>
                            <span className="ml-2 text-foreground">{data.uri}</span>
                        </p>
                    )}
                </div>
            </div>
            <Handle type="source" position={Position.Right} style={{ background: "oklch(0.65 0.15 140)" }} />
        </Card>
    )
}
