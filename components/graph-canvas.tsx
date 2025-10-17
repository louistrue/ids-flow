"use client"

import { useCallback, useMemo, useEffect, useState, useRef } from "react"
import { ReactFlow, Background, BackgroundVariant, Controls, MiniMap, useNodesState, useEdgesState, type Node, type Edge, type Connection, type OnConnect, type OnNodesChange, type OnEdgesChange, NodeChange, EdgeChange } from "@xyflow/react"
import { Map } from "lucide-react"
import type { GraphNode, GraphEdge } from "@/lib/graph-types"
import { getEntityContext } from "@/lib/graph-utils"
import { SpecificationNode } from "./nodes/specification-node"
import { EntityNode } from "./nodes/entity-node"
import { PropertyNode } from "./nodes/property-node"
import { AttributeNode } from "./nodes/attribute-node"
import { ClassificationNode } from "./nodes/classification-node"
import { MaterialNode } from "./nodes/material-node"
import { PartOfNode } from "./nodes/partof-node"
import { RestrictionNode } from "./nodes/restriction-node"
import { FACET_COLORS } from "@/lib/facet-colors"

interface GraphCanvasProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNode: GraphNode | null
  onNodeSelect: (node: GraphNode | null) => void
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void
  onNodeDragStart?: () => void
  onConnect: (sourceId: string, targetId: string, targetHandle?: string) => void
  onNodesDelete?: (nodeIds: string[]) => void
  onEdgesDelete?: (edgeIds: string[]) => void
}

const nodeTypes = {
  spec: SpecificationNode,
  entity: EntityNode,
  property: PropertyNode,
  attribute: AttributeNode,
  classification: ClassificationNode,
  material: MaterialNode,
  partOf: PartOfNode,
  restriction: RestrictionNode,
}


export function GraphCanvas({ nodes, edges, selectedNode, onNodeSelect, onNodeMove, onNodeDragStart, onConnect, onNodesDelete, onEdgesDelete }: GraphCanvasProps) {
  const [showMinimap, setShowMinimap] = useState(true)
  const [focusedSpecTargets, setFocusedSpecTargets] = useState<Record<string, 'applicability' | 'requirements'>>({})
  const [focusedFacetColor, setFocusedFacetColor] = useState<string | null>(null)
  const [focusedSourceNodeId, setFocusedSourceNodeId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const reactFlowContainerRef = useRef<HTMLDivElement>(null)

  // Memoize nodes without focus state to avoid recalculation during selection changes
  const baseNodes: Node[] = useMemo(() =>
    nodes.map(node => {
      const entityContext = getEntityContext(node.id, nodes, edges)
      return {
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          entityContext: entityContext.entityName,
        },
      }
    }), [nodes, edges]
  )

  // Add focus state to nodes separately
  const initialNodes: Node[] = useMemo(() =>
    baseNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        // Pass through focus hint to spec node so it can highlight a label
        highlightTarget: (node.type === 'spec' && focusedSpecTargets[node.id]) ? focusedSpecTargets[node.id] : undefined,
        highlightColor: (focusedFacetColor && node.type === 'spec') ? focusedFacetColor : undefined,
        highlightSourceId: (node.type === 'spec' && focusedSpecTargets[node.id]) ? focusedSourceNodeId : undefined,
      },
    })), [baseNodes, focusedSpecTargets, focusedFacetColor, focusedSourceNodeId]
  )

  const initialEdges: Edge[] = useMemo(() =>
    edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      targetHandle: edge.targetHandle,
      style: { stroke: "oklch(0.55 0.18 265)", strokeWidth: 2 },
    })), [edges]
  )

  // Use ReactFlow's built-in state management
  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Sync ReactFlow state with parent props only when base nodes change (not during selection/focus changes)
  useEffect(() => {
    // Don't sync while dragging
    if (isDragging) return

    setNodes((currentNodes) => {
      // Get currently selected node IDs
      const selectedIds = currentNodes.filter(n => n.selected).map(n => n.id)

      // Sync from parent - parent is the source of truth
      const updatedNodes = initialNodes.map(parentNode => {
        return {
          ...parentNode,
          // Preserve selection state
          selected: selectedIds.includes(parentNode.id),
          // Always use parent position - it's the source of truth
          position: parentNode.position,
        }
      })

      return updatedNodes
    })
  }, [baseNodes]) // Only depend on baseNodes, not on isDragging state changes

  // Separate effect to update only focus/highlight data without recreating nodes
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          highlightTarget: (node.type === 'spec' && focusedSpecTargets[node.id]) ? focusedSpecTargets[node.id] : undefined,
          highlightColor: (focusedFacetColor && node.type === 'spec') ? focusedFacetColor : undefined,
          highlightSourceId: (node.type === 'spec' && focusedSpecTargets[node.id]) ? focusedSourceNodeId : undefined,
        },
      }))
    )
  }, [focusedSpecTargets, focusedFacetColor, focusedSourceNodeId, setNodes])

  useEffect(() => {
    setEdges((currentEdges) => {
      // Preserve edge selection similarly
      const selectedIds = currentEdges.filter(e => e.selected).map(e => e.id)
      return initialEdges.map(edge => ({
        ...edge,
        selected: selectedIds.includes(edge.id)
      }))
    })
  }, [initialEdges, setEdges])

  const onConnectHandler: OnConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      onConnect(connection.source, connection.target, connection.targetHandle || undefined)
    }
  }, [onConnect])

  const handleNodeDragStart = useCallback(() => {
    setIsDragging(true)
    onNodeDragStart?.()
  }, [onNodeDragStart])

  const handleNodeDragStop = useCallback((_event: any, node: any) => {
    setIsDragging(false)
    // Only update parent state when drag ends to prevent flicker
    onNodeMove(node.id, node.position)
  }, [onNodeMove])

  const onSelectionChange = useCallback(({ nodes: selectedNodes }: any) => {
    const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null
    // Determine if the selected node feeds specs and which handles
    if (selectedNode) {
      const outgoing = edges.filter(e => e.source === selectedNode.id)
      if (outgoing.length > 0) {
        // Build a map of spec node IDs to their target handles
        const specTargets: Record<string, 'applicability' | 'requirements'> = {}
        outgoing.forEach(edge => {
          if (edge.targetHandle === 'applicability' || edge.targetHandle === 'requirements') {
            specTargets[edge.target] = edge.targetHandle as 'applicability' | 'requirements'
          }
        })
        setFocusedSpecTargets(specTargets)
        setFocusedSourceNodeId(selectedNode.id)
        // Determine facet color CSS var by type
        const type = selectedNode.type as string
        const colorVar =
          type === 'entity' ? 'var(--accent)'
            : type === 'property' ? 'var(--chart-3)'
              : type === 'attribute' ? 'var(--chart-4)'
                : type === 'classification' ? 'var(--chart-5)'
                  : type === 'material' ? 'var(--chart-2)'
                    : type === 'partOf' ? 'var(--chart-1)'
                      : type === 'spec' ? 'var(--primary)'
                        : 'var(--ring)'
        setFocusedFacetColor(colorVar)
      } else {
        setFocusedSpecTargets({})
        setFocusedFacetColor(null)
        setFocusedSourceNodeId(null)
      }
    } else {
      setFocusedSpecTargets({})
      setFocusedFacetColor(null)
      setFocusedSourceNodeId(null)
    }
    onNodeSelect(selectedNode ? {
      id: selectedNode.id,
      type: selectedNode.type || 'spec',
      position: selectedNode.position,
      data: selectedNode.data,
    } : null)
  }, [onNodeSelect, edges])

  // Detect node deletions
  const handleNodesChange: OnNodesChange = useCallback((changes) => {
    onNodesChange(changes)

    // Find deletion changes and notify parent
    const deletedNodeIds = changes
      .filter(change => change.type === 'remove')
      .map(change => change.id)

    if (deletedNodeIds.length > 0 && onNodesDelete) {
      onNodesDelete(deletedNodeIds)
    }
  }, [onNodesChange, onNodesDelete])

  // Detect edge deletions
  const handleEdgesChange: OnEdgesChange = useCallback((changes) => {
    onEdgesChange(changes)

    // Find deletion changes and notify parent
    const deletedEdgeIds = changes
      .filter(change => change.type === 'remove')
      .map(change => change.id)

    if (deletedEdgeIds.length > 0 && onEdgesDelete) {
      onEdgesDelete(deletedEdgeIds)
    }
  }, [onEdgesChange, onEdgesDelete])

  // Handle Select All keyboard shortcut (Cmd+A on Mac, Ctrl+A on Windows)
  useEffect(() => {
    const container = reactFlowContainerRef.current
    if (!container) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+A (Mac) or Ctrl+A (Windows)
      if ((event.metaKey || event.ctrlKey) && event.key === 'a') {
        event.preventDefault()

        setNodes((currentNodes) =>
          currentNodes.map(node => ({
            ...node,
            selected: true,
          }))
        )
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [setNodes])


  return (
    <div className="w-full h-full" ref={reactFlowContainerRef} tabIndex={0} style={{ outline: 'none' }}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges.map(e => ({
          ...e,
          style: {
            ...(e.style || {}),
            strokeDasharray: (selectedNode && (e.source === selectedNode.id)) ? '6 4' : undefined,
          }
        }))}
        onConnect={onConnectHandler}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onSelectionChange={onSelectionChange}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{ type: 'default' }}
        connectionLineType={undefined}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode={["Meta", "Control"]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="oklch(0.25 0.01 265)"
        />
        <Controls className="bg-card border border-border rounded-lg shadow-lg">
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className="react-flow__controls-button"
            title={showMinimap ? "Hide Minimap" : "Show Minimap"}
          >
            <Map className="w-4 h-4" />
          </button>
        </Controls>
        {showMinimap && (
          <MiniMap
            className="bg-card border border-border rounded-lg shadow-lg"
            nodeColor={(node) => {
              const baseColor = FACET_COLORS[node.type as keyof typeof FACET_COLORS]?.minimap || 'oklch(0.55 0.18 265)'
              return node.selected ? 'oklch(0.90 0.15 292)' : baseColor
            }}
            nodeClassName={(node) => node.selected ? 'minimap-selected-node' : ''}
          />
        )}
        {/* Inject focus hint into the spec node via data, so labels highlight */}
        <style>{`/* no-op style tag needed to avoid empty JSX warnings */`}</style>
      </ReactFlow>
    </div>
  )
}
