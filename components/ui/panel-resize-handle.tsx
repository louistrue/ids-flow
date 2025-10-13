"use client"

import { PanelResizeHandle } from "react-resizable-panels"
import { cn } from "@/lib/utils"

interface PanelResizeHandleProps {
    className?: string
}

export function CustomPanelResizeHandle({ className }: PanelResizeHandleProps) {
    return (
        <PanelResizeHandle
            className={cn(
                "w-2 bg-border/50 hover:bg-border transition-colors cursor-col-resize group relative",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                className
            )}
        >
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-8 bg-muted-foreground/30 group-hover:bg-muted-foreground/60 transition-colors" />
            </div>
        </PanelResizeHandle>
    )
}
