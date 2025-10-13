"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Node } from "reactflow"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"
import {
  getEntitiesForVersion,
  getPredefinedTypesForEntity,
  getPropertiesForPropertySet,
  IFC_DATA_TYPES,
  type IFCVersion,
} from "@/lib/ifc-schema"

interface InspectorPanelProps {
  selectedNode: Node | null
  onUpdateNode: (nodeId: string, data: any) => void
}

export function InspectorPanel({ selectedNode, onUpdateNode }: InspectorPanelProps) {
  if (!selectedNode) {
    return (
      <Card className="w-80 h-full rounded-none border-l border-border bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Inspector</h2>
        </div>
        <div className="flex items-center justify-center h-[calc(100vh-80px)] p-6">
          <p className="text-sm text-muted-foreground text-center">Select a node to view and edit its properties</p>
        </div>
      </Card>
    )
  }

  const handleChange = (field: string, value: any) => {
    onUpdateNode(selectedNode.id, { [field]: value })
  }

  return (
    <Card className="w-80 h-full rounded-none border-l border-border bg-sidebar">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Inspector</h2>
        <p className="text-xs text-muted-foreground mt-1 capitalize">{selectedNode.type} Node</p>
      </div>
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-4">
          {selectedNode.type === "spec" && <SpecificationFields node={selectedNode} onChange={handleChange} />}
          {selectedNode.type === "entity" && <EntityFields node={selectedNode} onChange={handleChange} />}
          {selectedNode.type === "property" && <PropertyFields node={selectedNode} onChange={handleChange} />}
        </div>
      </ScrollArea>
    </Card>
  )
}

function SpecificationFields({ node, onChange }: { node: Node; onChange: (field: string, value: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sidebar-foreground">
          Name
        </Label>
        <Input
          id="name"
          value={node.data.name || ""}
          onChange={(e) => onChange("name", e.target.value)}
          className="bg-input border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ifcVersion" className="text-sidebar-foreground">
          IFC Version
        </Label>
        <Select value={node.data.ifcVersion || "IFC4X3_ADD2"} onValueChange={(value) => onChange("ifcVersion", value)}>
          <SelectTrigger className="bg-input border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IFC2X3">IFC2x3</SelectItem>
            <SelectItem value="IFC4">IFC4</SelectItem>
            <SelectItem value="IFC4X3_ADD2">IFC4X3 ADD2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sidebar-foreground">
          Description
        </Label>
        <Textarea
          id="description"
          value={node.data.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          className="bg-input border-border text-foreground min-h-[100px]"
        />
      </div>
    </>
  )
}

function EntityFields({ node, onChange }: { node: Node; onChange: (field: string, value: any) => void }) {
  const ifcVersion: IFCVersion = "IFC4X3_ADD2"
  const entities = getEntitiesForVersion(ifcVersion)
  const predefinedTypes = node.data.name ? getPredefinedTypesForEntity(node.data.name, ifcVersion) : []

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sidebar-foreground">
          Entity Name
        </Label>
        <Select value={node.data.name || "defaultEntity"} onValueChange={(value) => onChange("name", value)}>
          <SelectTrigger className="bg-input border-border text-foreground font-mono">
            <SelectValue placeholder="Select entity..." />
          </SelectTrigger>
          <SelectContent>
            {entities.map((entity) => (
              <SelectItem key={entity} value={entity} className="font-mono">
                {entity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {predefinedTypes.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="predefinedType" className="text-sidebar-foreground">
            Predefined Type
          </Label>
          <Select
            value={node.data.predefinedType || "None"}
            onValueChange={(value) => onChange("predefinedType", value)}
          >
            <SelectTrigger className="bg-input border-border text-foreground font-mono">
              <SelectValue placeholder="Optional..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None</SelectItem>
              {predefinedTypes.map((type) => (
                <SelectItem key={type} value={type} className="font-mono">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {node.data.name && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10">
          <CheckCircle2 className="h-4 w-4 text-accent" />
          <span className="text-xs text-muted-foreground">Valid IFC entity</span>
        </div>
      )}
    </>
  )
}

function PropertyFields({ node, onChange }: { node: Node; onChange: (field: string, value: any) => void }) {
  const propertySets = [
    "Pset_WallCommon",
    "Pset_SlabCommon",
    "Pset_ColumnCommon",
    "Pset_BeamCommon",
    "Pset_DoorCommon",
    "Pset_WindowCommon",
    "Pset_SpaceCommon",
  ]
  const properties = node.data.propertySet ? getPropertiesForPropertySet(node.data.propertySet) : []

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="propertySet" className="text-sidebar-foreground">
          Property Set
        </Label>
        <Select
          value={node.data.propertySet || "defaultPropertySet"}
          onValueChange={(value) => {
            onChange("propertySet", value)
            onChange("baseName", "") // Reset property when changing set
          }}
        >
          <SelectTrigger className="bg-input border-border text-foreground font-mono">
            <SelectValue placeholder="Select property set..." />
          </SelectTrigger>
          <SelectContent>
            {propertySets.map((pset) => (
              <SelectItem key={pset} value={pset} className="font-mono">
                {pset}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="baseName" className="text-sidebar-foreground">
          Base Name
        </Label>
        {properties.length > 0 ? (
          <Select
            value={node.data.baseName || "defaultProperty"}
            onValueChange={(value) => onChange("baseName", value)}
          >
            <SelectTrigger className="bg-input border-border text-foreground font-mono">
              <SelectValue placeholder="Select property..." />
            </SelectTrigger>
            <SelectContent>
              {properties.map((prop) => (
                <SelectItem key={prop} value={prop} className="font-mono">
                  {prop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="baseName"
            value={node.data.baseName || ""}
            onChange={(e) => onChange("baseName", e.target.value)}
            placeholder="e.g., FireRating"
            className="bg-input border-border text-foreground font-mono"
          />
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="dataType" className="text-sidebar-foreground">
          Data Type
        </Label>
        <Select value={node.data.dataType || "IFCLABEL"} onValueChange={(value) => onChange("dataType", value)}>
          <SelectTrigger className="bg-input border-border text-foreground font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {IFC_DATA_TYPES.map((dt) => (
              <SelectItem key={dt.name} value={dt.name} className="font-mono">
                <div className="flex flex-col items-start">
                  <span>{dt.name}</span>
                  <span className="text-xs text-muted-foreground">{dt.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="value" className="text-sidebar-foreground">
          Value (Optional)
        </Label>
        <Input
          id="value"
          value={node.data.value || ""}
          onChange={(e) => onChange("value", e.target.value)}
          placeholder={getPlaceholderForDataType(node.data.dataType)}
          className="bg-input border-border text-foreground"
        />
        {node.data.value && (
          <p className="text-xs text-muted-foreground">This property will be used as an applicability condition</p>
        )}
      </div>
    </>
  )
}

function getPlaceholderForDataType(dataType: string): string {
  switch (dataType) {
    case "IFCBOOLEAN":
      return "true or false"
    case "IFCINTEGER":
      return "e.g., 120"
    case "IFCREAL":
      return "e.g., 3.14"
    case "IFCLABEL":
      return "e.g., REI120"
    case "IFCTEXT":
      return "Enter text..."
    default:
      return "Enter value..."
  }
}
