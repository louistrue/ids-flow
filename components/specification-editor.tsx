"use client"

import { useState, useCallback, useEffect } from "react"
import { Panel, PanelGroup } from "react-resizable-panels"
import { CustomPanelResizeHandle } from "@/components/ui/panel-resize-handle"
import { NodePalette } from "./node-palette"
import { InspectorPanel } from "./inspector-panel"
import { SchemaSwitcher } from "./schema-switcher"
import { TemplatesDialog } from "./templates-dialog"
import { Button } from "./ui/button"
import { Copy, Download, Upload, FileText, Workflow, Layout, RotateCcw, RotateCw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import type { IFCVersion } from "@/lib/ifc-schema"
import type { SpecTemplate } from "@/lib/templates"
import { GraphCanvas } from "./graph-canvas"
import type { GraphNode, GraphEdge, NodeData } from "@/lib/graph-types"
import { initialNodes, initialEdges } from "@/lib/initial-data"
import { convertGraphToIdsXml } from "@/lib/ids-xml-converter"
import { convertIdsXmlToGraph } from "@/lib/ids-xml-parser"
import { calculateSmartPositionForNewNode, findTemplateOffset, calculateNodePosition, DEFAULT_LAYOUT_CONFIG, relayoutNodes, findExistingNode } from "@/lib/node-layout"
import { useIdsValidation } from "@/lib/use-ids-validation"
import { useUndoRedo } from "@/lib/use-undo-redo"

export function SpecificationEditor() {
  const normalizeIfcVersion = useCallback((value: unknown): IFCVersion | undefined => {
    if (typeof value !== "string") return undefined
    const supported: IFCVersion[] = ["IFC2X3", "IFC4", "IFC4X3_ADD2"]
    return supported.includes(value as IFCVersion) ? (value as IFCVersion) : undefined
  }, [])

  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes)
  const [edges, setEdges] = useState<GraphEdge[]>(initialEdges)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [ifcVersion, setIfcVersion] = useState<IFCVersion>("IFC4X3_ADD2")
  const [jsonFileInputRef, setJsonFileInputRef] = useState<HTMLInputElement | null>(null)
  const [idsFileInputRef, setIdsFileInputRef] = useState<HTMLInputElement | null>(null)

  // IDS Validation hook
  const {
    validationState,
    validateNow,
    isValidating,
    hasErrors,
    isDisabled: isValidationDisabled,
  } = useIdsValidation(nodes, edges)

  // Undo/Redo hook
  const { undo, redo, takeSnapshot, canUndo, canRedo } = useUndoRedo(
    nodes,
    edges,
    setNodes,
    setEdges
  )

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        e.shiftKey ? redo() : undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    console.log('SpecificationEditor updateNodeData:', { nodeId, data })
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = { ...node, data: { ...node.data, ...data } }
          console.log('Updated node:', updatedNode)

          // Update selectedNode if it's the same node
          if (selectedNode && selectedNode.id === nodeId) {
            setSelectedNode(updatedNode)
            console.log('Updated selectedNode:', updatedNode)
          }

          return updatedNode
        }
        return node
      })
      console.log('All nodes after update:', updatedNodes)
      return updatedNodes
    })
  }, [selectedNode])

  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    takeSnapshot() // Capture BEFORE adding node
    const smartPosition = calculateSmartPositionForNewNode(type, nodes, edges, position)

    const newNode: GraphNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: smartPosition,
      data: getDefaultNodeData(type) as NodeData,
    }
    setNodes((nds) => [...nds, newNode])
  }, [nodes, edges, takeSnapshot])

  const arrangeAll = useCallback(() => {
    takeSnapshot() // Capture BEFORE rearranging
    const updatedNodes = relayoutNodes(nodes, edges)
    setNodes(updatedNodes)
  }, [nodes, edges, takeSnapshot])

  const applyTemplate = useCallback((template: SpecTemplate) => {
    const timestamp = Date.now()

    console.log(`🚀 Applying template: ${template.name}`)
    console.log(`📋 Template nodes:`, template.nodes.map(n => ({ type: n.type, data: n.data })))

    // Find a clear area for the new template (stack vertically)
    const offset = findTemplateOffset(nodes, { x: 600, y: 150 })

    // Track which nodes we're adding vs reusing
    const nodesToAdd: GraphNode[] = []
    const nodeIdMap = new Map<string, string>() // template index -> actual node id

    // First pass: check for existing nodes and create new ones
    template.nodes.forEach((node, index) => {
      if (node.type === 'spec') {
        // Always create new spec node
        const newNode: GraphNode = {
          ...node,
          id: `${node.type}-${timestamp}-${index}`,
          position: { x: offset.x, y: offset.y },
          type: node.type || 'spec',
          data: node.data as NodeData,
        }
        nodesToAdd.push(newNode)
        nodeIdMap.set(index.toString(), newNode.id)
      } else {
        // Check if we can reuse an existing node
        const existingNode = findExistingNode(nodes, node.type || 'spec', node.data)

        if (existingNode) {
          // Reuse existing node
          nodeIdMap.set(index.toString(), existingNode.id)
        } else {
          // Create new node
          const edge = template.edges[index - 1]
          const targetHandle = edge?.targetHandle as 'applicability' | 'requirements'

          console.log(`🔧 Creating new ${node.type} node (${targetHandle})`)

          // Find the spec node ID for this template
          const specNodeId = nodeIdMap.get('0') // First node is always the spec

          const position = calculateNodePosition(
            node.type || 'spec',
            targetHandle || 'requirements',
            [...nodes, ...nodesToAdd], // Include existing nodes AND nodes being added
            edges, // Pass current edges
            specNodeId || 'temp-spec', // Pass spec ID
            {
              ...DEFAULT_LAYOUT_CONFIG,
              specPosition: offset,
              baseX: offset.x - 500,
              baseY: offset.y - 50,
            }
          )

          const newNode: GraphNode = {
            ...node,
            id: `${node.type}-${timestamp}-${index}`,
            position,
            type: node.type || 'spec',
            data: node.data as NodeData,
          }
          nodesToAdd.push(newNode)
          nodeIdMap.set(index.toString(), newNode.id)

          console.log(`✅ Created node ${newNode.id} at:`, position)
        }
      }
    })

    // Create edges using the actual node IDs
    const newEdges: GraphEdge[] = template.edges.map((edge, index) => {
      let sourceId: string | undefined
      let targetId: string | undefined

      // Check if edge has explicit source/target definitions
      if (edge.source && edge.target) {
        // Find nodes by type matching
        const sourceNode = nodesToAdd.find(node => node.type === edge.source)
        const targetNode = nodesToAdd.find(node => node.type === edge.target)

        sourceId = sourceNode?.id
        targetId = targetNode?.id

        console.log(`🔗 Using explicit edge: ${edge.source} -> ${edge.target}`)
      } else {
        // Fall back to index-based mapping for backward compatibility
        const sourceIndex = index < template.nodes.length - 1 ? index + 1 : index
        const targetIndex = 0

        sourceId = nodeIdMap.get(sourceIndex.toString())
        targetId = nodeIdMap.get(targetIndex.toString())

        console.log(`🔗 Using index-based edge: ${sourceIndex} -> ${targetIndex}`)
      }

      if (!sourceId || !targetId) {
        console.warn('Missing node ID for edge:', { edge, sourceId, targetId })
        return null
      }

      return {
        id: `edge-${timestamp}-${index}`,
        source: sourceId,
        target: targetId,
        targetHandle: edge.targetHandle,
      }
    }).filter(Boolean) as GraphEdge[]

    // Add new nodes and edges
    takeSnapshot() // Capture BEFORE applying template
    setNodes((nds) => [...nds, ...nodesToAdd])
    setEdges((eds) => [...eds, ...newEdges])
  }, [nodes, takeSnapshot])

  const cloneAsProfile = useCallback(() => {
    if (!selectedNode || selectedNode.type !== "spec") return

    const relatedNodes = nodes.filter((node) => {
      return edges.some((edge) => edge.target === selectedNode.id && edge.source === node.id)
    })

    const timestamp = Date.now()

    // Find a clear area for the new profile (stack vertically like templates)
    const offset = findTemplateOffset(nodes, { x: 600, y: 150 })

    const clonedSpec: GraphNode = {
      ...selectedNode,
      id: `spec-${timestamp}`,
      position: offset,
      data: {
        ...selectedNode.data,
        name: `${selectedNode.data.name}-Profile`,
        description: `Profile variant of ${selectedNode.data.name}`,
      },
    }

    // Track which nodes we're adding vs reusing
    const nodesToAdd: GraphNode[] = []
    const nodeIdMap = new Map<string, string>() // original node id -> cloned node id

    // First pass: check for existing nodes and create new ones
    relatedNodes.forEach((node, index) => {
      // Check if we can reuse an existing node
      const existingNode = findExistingNode(nodes, node.type, node.data)

      if (existingNode) {
        // Reuse existing node
        nodeIdMap.set(node.id, existingNode.id)
      } else {
        // Create new node with smart positioning
        const edge = edges.find(e => e.source === node.id && e.target === selectedNode.id)
        const targetHandle = edge?.targetHandle as 'applicability' | 'requirements'

        console.log(`🔧 Creating new ${node.type} node (${targetHandle}) for profile`)

        const position = calculateNodePosition(
          node.type,
          targetHandle || 'requirements',
          [...nodes, ...nodesToAdd], // Include existing nodes AND nodes being added
          edges, // Pass current edges
          clonedSpec.id, // Pass cloned spec ID
          {
            ...DEFAULT_LAYOUT_CONFIG,
            specPosition: offset,
            baseX: offset.x - 500,
            baseY: offset.y - 50,
          }
        )

        const clonedNode: GraphNode = {
          ...node,
          id: `${node.type}-${timestamp}-${index}`,
          position,
        }
        nodesToAdd.push(clonedNode)
        nodeIdMap.set(node.id, clonedNode.id)

        console.log(`✅ Created cloned node ${clonedNode.id} at:`, position)
      }
    })

    // Create edges using the actual node IDs
    const clonedEdges: GraphEdge[] = edges
      .filter((edge) => edge.target === selectedNode.id && relatedNodes.some((n) => n.id === edge.source))
      .map((edge, index) => {
        const sourceId = nodeIdMap.get(edge.source)
        const targetId = clonedSpec.id

        if (!sourceId) {
          console.warn('Missing node ID for cloned edge:', { edge })
          return null
        }

        return {
          id: `edge-${timestamp}-${index}`,
          source: sourceId,
          target: targetId,
          targetHandle: edge.targetHandle,
        }
      }).filter(Boolean) as GraphEdge[]

    takeSnapshot() // Capture BEFORE cloning profile
    setNodes((nds) => [...nds, clonedSpec, ...nodesToAdd])
    setEdges((eds) => [...eds, ...clonedEdges])
  }, [selectedNode, nodes, edges, takeSnapshot])

  const exportCanvas = useCallback(() => {
    try {
      const canvasData = {
        version: "1.0",
        metadata: {
          exportedAt: new Date().toISOString(),
          nodeCount: nodes.length,
          edgeCount: edges.length,
          ifcVersion: ifcVersion,
        },
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          targetHandle: edge.targetHandle,
        })),
      }

      const blob = new Blob([JSON.stringify(canvasData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `canvas-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      alert("Canvas exported successfully!")
    } catch (error) {
      console.error("Canvas export failed:", error)
      alert(`Canvas export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [nodes, edges, ifcVersion])

  const exportIdsXml = useCallback(() => {
    try {
      const xml = convertGraphToIdsXml(nodes, edges, {
        pretty: true,
        author: "IDS Flow Editor",
        date: new Date().toISOString().split('T')[0]
      })

      const blob = new Blob([xml], { type: "application/xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `specification-${new Date().toISOString().split('T')[0]}.ids`
      a.click()
      URL.revokeObjectURL(url)

      alert("IDS XML exported successfully!")
    } catch (error) {
      console.error("IDS export failed:", error)
      alert(`IDS export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [nodes, edges])

  const handleJsonFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const canvasData = JSON.parse(content)

        // Validate the imported data structure
        if (!canvasData.nodes || !Array.isArray(canvasData.nodes)) {
          throw new Error("Invalid canvas file: missing or invalid nodes array")
        }
        if (!canvasData.edges || !Array.isArray(canvasData.edges)) {
          throw new Error("Invalid canvas file: missing or invalid edges array")
        }

        // Update the canvas with imported data
        setNodes(canvasData.nodes)
        setEdges(canvasData.edges)
        setSelectedNode(null) // Clear selection

        // Update IFC version if present in metadata
        const detectedVersion = normalizeIfcVersion(canvasData.metadata?.ifcVersion)
        if (detectedVersion) {
          setIfcVersion(detectedVersion)
        }

        alert(`Canvas imported successfully! Loaded ${canvasData.nodes.length} nodes and ${canvasData.edges.length} edges.`)
      } catch (error) {
        console.error("Import failed:", error)
        alert(`Import failed: ${error instanceof Error ? error.message : 'Invalid file format'}`)
      }
    }

    reader.readAsText(file)

    // Reset the input so the same file can be imported again
    event.target.value = ''
  }, [normalizeIfcVersion, setEdges, setIfcVersion, setNodes, setSelectedNode])

  const handleIdsFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const { nodes: importedNodes, edges: importedEdges, ifcVersion: importedIfcVersion } = convertIdsXmlToGraph(content)

        setNodes(importedNodes)
        setEdges(importedEdges)
        setSelectedNode(null)

        const detectedVersion = normalizeIfcVersion(importedIfcVersion)
        if (detectedVersion) {
          setIfcVersion(detectedVersion)
        }

        alert(`IDS imported successfully! Loaded ${importedNodes.length} nodes and ${importedEdges.length} edges.`)
      } catch (error) {
        console.error("IDS import failed:", error)
        alert(`IDS import failed: ${error instanceof Error ? error.message : 'Invalid IDS file format'}`)
      }
    }

    reader.readAsText(file)
    event.target.value = ''
  }, [normalizeIfcVersion, setEdges, setIfcVersion, setNodes, setSelectedNode])

  const handleNodeMove = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, position }
        }
        return node
      }),
    )
    // Don't take snapshot during drag - only on drag stop
  }, [])

  const handleNodeDragStart = useCallback(() => {
    takeSnapshot() // Capture before drag starts
  }, [takeSnapshot])

  const handleConnect = useCallback((sourceId: string, targetId: string, targetHandle?: string) => {
    takeSnapshot() // Capture BEFORE connecting
    const newEdge: GraphEdge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      targetHandle,
    }
    setEdges((eds) => [...eds, newEdge])
  }, [takeSnapshot])

  const handleNodesDelete = useCallback((nodeIds: string[]) => {
    takeSnapshot() // Capture BEFORE deletion
    setNodes((nds) => nds.filter(node => !nodeIds.includes(node.id)))
    // Also remove edges connected to deleted nodes
    setEdges((eds) =>
      eds.filter(edge => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target))
    )
  }, [takeSnapshot])

  const handleEdgesDelete = useCallback((edgeIds: string[]) => {
    takeSnapshot() // Capture BEFORE deletion
    setEdges((eds) => eds.filter(edge => !edgeIds.includes(edge.id)))
  }, [takeSnapshot])

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header row */}
      <div className="flex-none border-b border-border bg-background">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
              <h1 className="text-lg font-semibold text-foreground">IDS Spec Editor</h1>
            </div>
            <SchemaSwitcher version={ifcVersion} onVersionChange={setIfcVersion} />
          </div>
          <div className="flex items-center gap-3">
            <TemplatesDialog onApplyTemplate={applyTemplate} />
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-card"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="h-4 w-4" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-card"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
            >
              <RotateCw className="h-4 w-4" />
              Redo
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-card"
              onClick={arrangeAll}
            >
              <Layout className="h-4 w-4" />
              Arrange All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-card"
              onClick={cloneAsProfile}
              disabled={!selectedNode || selectedNode.type !== "spec"}
            >
              <Copy className="h-4 w-4" />
              Clone as Profile
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-card">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportCanvas}>
                  <Workflow className="h-4 w-4 mr-2" />
                  Export Canvas (.json)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportIdsXml}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export IDS (.ids)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-card">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => jsonFileInputRef?.click()}>
                  <Workflow className="h-4 w-4 mr-2" />
                  Import Canvas (.json)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => idsFileInputRef?.click()}>
                  <FileText className="h-4 w-4 mr-2" />
                  Import IDS (.ids)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
          </div>

          <input
            ref={setJsonFileInputRef}
            type="file"
            accept=".json"
            onChange={handleJsonFileImport}
            style={{ display: 'none' }}
          />
          <input
            ref={setIdsFileInputRef}
            type="file"
            accept=".ids,.xml"
            onChange={handleIdsFileImport}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Content row */}
      <div className="flex flex-1 min-h-0">
        <NodePalette onAddNode={addNode} ifcVersion={ifcVersion} />
        <PanelGroup direction="horizontal" className="flex-1">
          <Panel defaultSize={70} minSize={30} className="relative">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              selectedNode={selectedNode}
              onNodeSelect={setSelectedNode}
              onNodeMove={handleNodeMove}
              onNodeDragStart={handleNodeDragStart}
              onConnect={handleConnect}
              onNodesDelete={handleNodesDelete}
              onEdgesDelete={handleEdgesDelete}
            />
          </Panel>
          <CustomPanelResizeHandle />
          <Panel defaultSize={30} minSize={20} maxSize={50} className="min-w-0">
            <InspectorPanel
              selectedNode={selectedNode}
              onUpdateNode={updateNodeData}
              validationState={validationState}
              onValidateNow={validateNow}
              isValidating={isValidating}
              isValidationDisabled={isValidationDisabled}
              ifcVersion={ifcVersion}
              nodes={nodes}
              edges={edges}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}

function getDefaultNodeData(type: string) {
  switch (type) {
    case "spec":
      return {
        name: "New Specification",
        ifcVersion: "IFC4X3_ADD2",
        description: "",
      }
    case "entity":
      return {
        name: "",
        predefinedType: "",
      }
    case "property":
      return {
        propertySet: "Pset_WallCommon",
        baseName: "FireRating",
        dataType: "IFCLABEL",
        value: "",
      }
    case "attribute":
      return {
        name: "Name",
        value: "",
      }
    case "classification":
      return {
        system: "Uniclass 2015",
        value: "",
        uri: "",
      }
    case "material":
      return {
        value: "concrete",
        uri: "",
      }
    case "partOf":
      return {
        entity: "IFCSPACE",
        relation: "",
      }
    case "restriction":
      return {
        restrictionType: "enumeration",
        values: [],
      }
    default:
      return {}
  }
}
