"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Database } from "lucide-react"

export function AttributeNode({ data, selected }: NodeProps) {
    return (
        <Card
            className={`min-w-[200px] bg-card border-2 transition-all ${selected ? "border-chart-4 shadow-lg" : "border-border"
                }`}
        >
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-chart-4/10">
                        <Database className="h-4 w-4 text-chart-4" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground font-mono">{data.name}</h3>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">Attribute</p>
                    {data.value && (
                        <p className="text-xs text-muted-foreground">
                            <span className="text-chart-4">Value:</span>
                            <span className="ml-2 text-foreground">{data.value}</span>
                        </p>
                    )}
                </div>
            </div>
            <Handle type="source" position={Position.Right} className="bg-chart-3" />
        </Card>
    )
}
