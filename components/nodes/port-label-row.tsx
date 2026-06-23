"use client"

import { Handle, Position } from "@xyflow/react"

interface PortLabelRowProps {
    id: string
    label: string
    highlighted?: boolean
    highlightColor?: string
    handleColor?: string
    highlightSourceId?: string
    /**
     * Which side of the card the port handle should attach to.
     * Defaults to "left" — the original grouped-layout behaviour where
     * facets sit to the left of the spec card.
     *
     * When set to "right" (used by stacked-layout mode), the label aligns
     * to the right edge of the row and the handle sits on the right side
     * of the card, so edges from facets stacked below the spec can take a
     * clean right-side orthogonal path back up to the spec.
     */
    side?: "left" | "right"
}

export function PortLabelRow({ id, label, highlighted = false, highlightColor, handleColor, highlightSourceId, side = "left" }: PortLabelRowProps) {
    const isRight = side === "right"
    return (
        <div
            className={`relative flex items-center ${isRight ? "justify-end" : ""}`}
            style={highlightColor ? ({ ['--highlight-color' as any]: highlightColor } as React.CSSProperties) : undefined}
        >
            <Handle
                type="target"
                position={isRight ? Position.Right : Position.Left}
                id={id}
                className={handleColor || "bg-accent"}
                style={
                    isRight
                        ? { position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)' }
                        : { position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)' }
                }
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


