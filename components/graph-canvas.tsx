"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import type { GraphNode, GraphEdge } from "@/lib/graph-types"
import { GraphNodeComponent } from "./graph-node"

interface GraphCanvasProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNode: GraphNode | null
  onNodeSelect: (node: GraphNode | null) => void
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void
  onConnect: (sourceId: string, targetId: string, targetHandle?: string) => void
}

export function GraphCanvas({ nodes, edges, selectedNode, onNodeSelect, onNodeMove, onConnect }: GraphCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const handleNodeMouseDown = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      const node = nodes.find((n) => n.id === nodeId)
      if (node) {
        setDraggingNode(nodeId)
        setDragOffset({
          x: e.clientX - node.position.x * zoom - pan.x,
          y: e.clientY - node.position.y * zoom - pan.y,
        })
        onNodeSelect(node)
      }
    },
    [nodes, onNodeSelect, zoom, pan],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (draggingNode) {
        const newX = (e.clientX - dragOffset.x - pan.x) / zoom
        const newY = (e.clientY - dragOffset.y - pan.y) / zoom
        onNodeMove(draggingNode, { x: newX, y: newY })
      } else if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        })
      }
    },
    [draggingNode, dragOffset, onNodeMove, isPanning, panStart, zoom, pan],
  )

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null)
    setIsPanning(false)
  }, [])

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("graph-background")) {
        setIsPanning(true)
        setPanStart({
          x: e.clientX - pan.x,
          y: e.clientY - pan.y,
        })
        onNodeSelect(null)
      }
    },
    [pan, onNodeSelect],
  )

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY * -0.001
      const newZoom = Math.min(Math.max(0.5, zoom + delta), 2)
      setZoom(newZoom)
    },
    [zoom],
  )

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel)
      }
    }
  }, [handleMouseMove, handleMouseUp, handleWheel])

  return (
    <div
      ref={canvasRef}
      className="w-full h-full bg-background overflow-hidden relative cursor-grab active:cursor-grabbing"
      onMouseDown={handleCanvasMouseDown}
    >
      {/* Background pattern */}
      <div
        className="graph-background absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, oklch(0.25 0.01 265) 1px, transparent 1px)`,
          backgroundSize: `${16 * zoom}px ${16 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Edges */}
      <svg className="absolute inset-0 pointer-events-none" style={{ overflow: "visible" }}>
        {edges.map((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.source)
          const targetNode = nodes.find((n) => n.id === edge.target)
          if (!sourceNode || !targetNode) return null

          const sourceX = sourceNode.position.x * zoom + pan.x + 220
          const sourceY = sourceNode.position.y * zoom + pan.y + 40
          const targetX = targetNode.position.x * zoom + pan.x
          const targetY =
            targetNode.position.y * zoom +
            pan.y +
            (edge.targetHandle === "requirements" ? 100 : edge.targetHandle === "applicability" ? 70 : 40)

          const midX = (sourceX + targetX) / 2

          return (
            <g key={edge.id}>
              <path
                d={`M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`}
                stroke="oklch(0.55 0.18 265)"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
              <circle cx={targetX} cy={targetY} r="4" fill="oklch(0.55 0.18 265)" />
            </g>
          )
        })}
      </svg>

      {/* Nodes */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
      >
        {nodes.map((node) => (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.position.x,
              top: node.position.y,
              cursor: draggingNode === node.id ? "grabbing" : "grab",
            }}
            onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
          >
            <GraphNodeComponent node={node} selected={selectedNode?.id === node.id} />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg p-2 flex flex-col gap-2">
        <button
          className="px-3 py-1 text-sm hover:bg-secondary rounded"
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
        >
          +
        </button>
        <button
          className="px-3 py-1 text-sm hover:bg-secondary rounded"
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
        >
          −
        </button>
        <button
          className="px-3 py-1 text-sm hover:bg-secondary rounded"
          onClick={() => {
            setZoom(1)
            setPan({ x: 0, y: 0 })
          }}
        >
          ⊙
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg px-3 py-1 text-sm text-muted-foreground">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  )
}
