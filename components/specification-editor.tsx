"use client"

import { useState, useCallback } from "react"
import { NodePalette } from "./node-palette"
import { InspectorPanel } from "./inspector-panel"
import { SchemaSwitcher } from "./schema-switcher"
import { TemplatesDialog } from "./templates-dialog"
import { Button } from "./ui/button"
import { Copy, Download, Upload, FileText, Workflow } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import type { IFCVersion } from "@/lib/ifc-schema"
import type { SpecTemplate } from "@/lib/templates"
import { GraphCanvas } from "./graph-canvas"
import type { GraphNode, GraphEdge } from "@/lib/graph-types"
import { initialNodes, initialEdges } from "@/lib/initial-data"
import { convertGraphToIdsXml } from "@/lib/ids-xml-converter"

export function SpecificationEditor() {
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes)
  const [edges, setEdges] = useState<GraphEdge[]>(initialEdges)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [ifcVersion, setIfcVersion] = useState<IFCVersion>("IFC4X3_ADD2")
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null)

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } }
        }
        return node
      }),
    )
  }, [])

  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode: GraphNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: getDefaultNodeData(type),
    }
    setNodes((nds) => [...nds, newNode])
  }, [])

  const applyTemplate = useCallback((template: SpecTemplate) => {
    const timestamp = Date.now()
    const newNodes: GraphNode[] = template.nodes.map((node, index) => ({
      ...node,
      id: `${node.type}-${timestamp}-${index}`,
    }))

    const newEdges: GraphEdge[] = template.edges.map((edge, index) => {
      const sourceIndex = index < template.nodes.length - 1 ? index + 1 : index
      const targetIndex = 0
      return {
        id: `edge-${timestamp}-${index}`,
        source: newNodes[sourceIndex].id,
        target: newNodes[targetIndex].id,
        targetHandle: edge.targetHandle,
      }
    })

    setNodes((nds) => [...nds, ...newNodes])
    setEdges((eds) => [...eds, ...newEdges])
  }, [])

  const cloneAsProfile = useCallback(() => {
    if (!selectedNode || selectedNode.type !== "spec") return

    const relatedNodes = nodes.filter((node) => {
      return edges.some((edge) => edge.target === selectedNode.id && edge.source === node.id)
    })

    const timestamp = Date.now()
    const clonedSpec: GraphNode = {
      ...selectedNode,
      id: `spec-${timestamp}`,
      position: {
        x: selectedNode.position.x + 50,
        y: selectedNode.position.y + 50,
      },
      data: {
        ...selectedNode.data,
        name: `${selectedNode.data.name}-Profile`,
        description: `Profile variant of ${selectedNode.data.name}`,
      },
    }

    const clonedNodes: GraphNode[] = relatedNodes.map((node, index) => ({
      ...node,
      id: `${node.type}-${timestamp}-${index}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
    }))

    const clonedEdges: GraphEdge[] = edges
      .filter((edge) => edge.target === selectedNode.id && relatedNodes.some((n) => n.id === edge.source))
      .map((edge, index) => {
        const sourceNode = relatedNodes.find((n) => n.id === edge.source)
        const sourceIndex = relatedNodes.indexOf(sourceNode!)
        return {
          id: `edge-${timestamp}-${index}`,
          source: clonedNodes[sourceIndex].id,
          target: clonedSpec.id,
          targetHandle: edge.targetHandle,
        }
      })

    setNodes((nds) => [...nds, clonedSpec, ...clonedNodes])
    setEdges((eds) => [...eds, ...clonedEdges])
  }, [selectedNode, nodes, edges])

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

  const importCanvas = useCallback(() => {
    if (fileInputRef) {
      fileInputRef.click()
    }
  }, [fileInputRef])

  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
        if (canvasData.metadata?.ifcVersion) {
          setIfcVersion(canvasData.metadata.ifcVersion)
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
  }, [])

  const handleNodeMove = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, position }
        }
        return node
      }),
    )
  }, [])

  const handleConnect = useCallback((sourceId: string, targetId: string, targetHandle?: string) => {
    const newEdge: GraphEdge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      targetHandle,
    }
    setEdges((eds) => [...eds, newEdge])
  }, [])

  return (
    <div className="flex h-full w-full">
      <NodePalette onAddNode={addNode} />

      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
          <div className="bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
            <h1 className="text-lg font-semibold text-foreground">IFC Specification Editor</h1>
          </div>
          <SchemaSwitcher version={ifcVersion} onVersionChange={setIfcVersion} />
          <TemplatesDialog onApplyTemplate={applyTemplate} />
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

          <Button variant="outline" size="sm" className="gap-2 bg-card" onClick={importCanvas}>
            <Upload className="h-4 w-4" />
            Import
          </Button>

          <input
            ref={setFileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
        </div>

        <GraphCanvas
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
          onNodeMove={handleNodeMove}
          onConnect={handleConnect}
        />
      </div>

      <InspectorPanel selectedNode={selectedNode} onUpdateNode={updateNodeData} />
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
        name: "IFCWALL",
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
