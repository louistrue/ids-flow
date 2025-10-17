"use client"

import { Handle, Position } from "@xyflow/react"

interface PortLabelRowProps {
    id: string
    label: string
    highlighted?: boolean
    highlightColor?: string
    handleColor?: string
    highlightSourceId?: string
}

export function PortLabelRow({ id, label, highlighted = false, highlightColor, handleColor, highlightSourceId }: PortLabelRowProps) {
    return (
        <div className="relative flex items-center" style={highlightColor ? ({ ['--highlight-color' as any]: highlightColor } as React.CSSProperties) : undefined}>
            <Handle
                type="target"
                position={Position.Left}
                id={id}
                className={handleColor || "bg-accent"}
                style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <span
                key={highlighted ? `${highlightSourceId}-${highlightColor}` : undefined}
                className={`port-text ${highlighted ? 'port-text-highlight' : ''}`}
            >
                {label}
            </span>
        </div>
    )
}


