"use client"

import { useCallback, useMemo, useEffect } from "react"
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, type Node, type Edge, type Connection, type OnConnect, type OnNodesChange, type OnEdgesChange, type OnSelectionChange, type OnNodeDragStop, NodeChange, EdgeChange } from "@xyflow/react"
import type { GraphNode, GraphEdge } from "@/lib/graph-types"
import { SpecificationNode } from "./nodes/specification-node"
import { EntityNode } from "./nodes/entity-node"
import { PropertyNode } from "./nodes/property-node"
import { AttributeNode } from "./nodes/attribute-node"
import { ClassificationNode } from "./nodes/classification-node"
import { MaterialNode } from "./nodes/material-node"
import { PartOfNode } from "./nodes/partof-node"
import { RestrictionNode } from "./nodes/restriction-node"

interface GraphCanvasProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNode: GraphNode | null
  onNodeSelect: (node: GraphNode | null) => void
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void
  onConnect: (sourceId: string, targetId: string, targetHandle?: string) => void
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

export function GraphCanvas({ nodes, edges, selectedNode, onNodeSelect, onNodeMove, onConnect }: GraphCanvasProps) {
  // Convert GraphNode/GraphEdge to ReactFlow format
  const initialNodes: Node[] = useMemo(() =>
    nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    })), [nodes]
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

  // Sync ReactFlow state with parent props, preserving selection and updating data
  useEffect(() => {
    console.log('GraphCanvas sync effect triggered, initialNodes:', initialNodes)
    setNodes((currentNodes) => {
      console.log('Current ReactFlow nodes:', currentNodes)

      // Get currently selected node IDs
      const selectedIds = currentNodes.filter(n => n.selected).map(n => n.id)
      console.log('Preserving selection for:', selectedIds)

      // Always sync data from parent, but preserve selection
      const updatedNodes = initialNodes.map(parentNode => {
        const currentNode = currentNodes.find(n => n.id === parentNode.id)
        return {
          ...parentNode,
          // Preserve selection state
          selected: selectedIds.includes(parentNode.id)
        }
      })

      console.log('Updated ReactFlow nodes:', updatedNodes)
      return updatedNodes
    })
  }, [initialNodes, setNodes])

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

  const onNodeDragStop: OnNodeDragStop = useCallback((_event, node) => {
    // Only update parent state when drag ends to prevent flicker
    onNodeMove(node.id, node.position)
    console.log(`Node ${node.id} dragged to:`, node.position) // Log node position
  }, [onNodeMove])

  const onSelectionChange: OnSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null
    onNodeSelect(selectedNode ? {
      id: selectedNode.id,
      type: selectedNode.type || 'spec',
      position: selectedNode.position,
      data: selectedNode.data,
    } : null)
  }, [onNodeSelect])


  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onConnect={onConnectHandler}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{ type: 'default' }}
        connectionLineType="Bezier"
        fitView
        attributionPosition="bottom-left"
      >
        <Background
          variant="dots"
          gap={16}
          size={1}
          color="oklch(0.25 0.01 265)"
        />
        <Controls className="bg-card border border-border rounded-lg shadow-lg" />
        <MiniMap
          className="bg-card border border-border rounded-lg shadow-lg"
          nodeColor={(node) => {
            switch (node.type) {
              case 'spec': return 'oklch(0.65 0.15 140)'
              case 'entity': return 'oklch(0.45 0.15 180)'
              case 'property': return 'oklch(0.65 0.15 140)'
              case 'attribute': return 'oklch(0.65 0.15 140)'
              case 'classification': return 'oklch(0.65 0.15 140)'
              case 'material': return 'oklch(0.65 0.15 140)'
              case 'partOf': return 'oklch(0.65 0.15 140)'
              case 'restriction': return 'oklch(0.55 0.18 265)'
              default: return 'oklch(0.55 0.18 265)'
            }
          }}
        />
      </ReactFlow>
    </div>
  )
}
