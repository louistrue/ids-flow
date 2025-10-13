"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Layers } from "lucide-react"

export function ClassificationNode({ data, selected }: NodeProps) {
    return (
        <Card
            className={`min-w-[220px] bg-card border-2 transition-all ${selected ? "border-chart-5 shadow-lg" : "border-border"
                }`}
        >
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-chart-5/10">
                        <Layers className="h-4 w-4 text-chart-5" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground font-mono">{data.system}</h3>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">Classification</p>
                    {data.value && (
                        <p className="text-xs text-muted-foreground">
                            <span className="text-chart-5">Code:</span>
                            <span className="ml-2 text-foreground font-mono">{data.value}</span>
                        </p>
                    )}
                    {data.uri && (
                        <p className="text-xs text-muted-foreground truncate">
                            <span className="text-chart-5">URI:</span>
                            <span className="ml-2 text-foreground">{data.uri}</span>
                        </p>
                    )}
                </div>
            </div>
            <Handle type="source" position={Position.Right} className="bg-chart-3" />
        </Card>
    )
}
