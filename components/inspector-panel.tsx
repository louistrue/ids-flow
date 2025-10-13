"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Node } from "@xyflow/react"
import type { NodeData } from "@/lib/graph-types"
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
  selectedNode: Node<any> | null
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
          {selectedNode.type === "attribute" && <AttributeFields node={selectedNode} onChange={handleChange} />}
          {selectedNode.type === "classification" && <ClassificationFields node={selectedNode} onChange={handleChange} />}
          {selectedNode.type === "material" && <MaterialFields node={selectedNode} onChange={handleChange} />}
          {selectedNode.type === "partOf" && <PartOfFields node={selectedNode} onChange={handleChange} />}
          {selectedNode.type === "restriction" && <RestrictionFields node={selectedNode} onChange={handleChange} />}
        </div>
      </ScrollArea>
    </Card>
  )
}

function SpecificationFields({ node, onChange }: { node: Node<any>; onChange: (field: string, value: any) => void }) {
  const data = node.data as any // Type assertion for now
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sidebar-foreground">
          Name
        </Label>
        <Input
          id="name"
          value={data.name || ""}
          onChange={(e) => onChange("name", e.target.value)}
          className="bg-input border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ifcVersion" className="text-sidebar-foreground">
          IFC Version
        </Label>
        <Select value={data.ifcVersion || "IFC4X3_ADD2"} onValueChange={(value) => onChange("ifcVersion", value)}>
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
          value={data.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          className="bg-input border-border text-foreground min-h-[100px]"
        />
      </div>
    </>
  )
}

function EntityFields({ node, onChange }: { node: Node<any>; onChange: (field: string, value: any) => void }) {
  const data = node.data as any // Type assertion for now
  const ifcVersion: IFCVersion = "IFC4X3_ADD2"
  const entities = getEntitiesForVersion(ifcVersion)
  const predefinedTypes = data.name ? getPredefinedTypesForEntity(data.name, ifcVersion) : []

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sidebar-foreground">
          Entity Name
        </Label>
        <Select value={data.name || "defaultEntity"} onValueChange={(value) => onChange("name", value)}>
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
            value={data.predefinedType || "None"}
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
      {data.name && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10">
          <CheckCircle2 className="h-4 w-4 text-accent" />
          <span className="text-xs text-muted-foreground">Valid IFC entity</span>
        </div>
      )}
    </>
  )
}

function PropertyFields({ node, onChange }: { node: Node<any>; onChange: (field: string, value: any) => void }) {
  const data = node.data as any // Type assertion for now
  const propertySets = [
    "Pset_WallCommon",
    "Pset_SlabCommon",
    "Pset_ColumnCommon",
    "Pset_BeamCommon",
    "Pset_DoorCommon",
    "Pset_WindowCommon",
    "Pset_SpaceCommon",
  ]
  const properties = data.propertySet ? getPropertiesForPropertySet(data.propertySet) : []

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="propertySet" className="text-sidebar-foreground">
          Property Set
        </Label>
        <Select
          value={data.propertySet || "defaultPropertySet"}
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
            value={data.baseName || "defaultProperty"}
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
            value={data.baseName || ""}
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
        <Select value={data.dataType || "IFCLABEL"} onValueChange={(value) => onChange("dataType", value)}>
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
          value={data.value || ""}
          onChange={(e) => onChange("value", e.target.value)}
          placeholder={getPlaceholderForDataType(data.dataType)}
          className="bg-input border-border text-foreground"
        />
        {data.value && (
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

function AttributeFields({ node, onChange }: { node: Node<any>; onChange: (field: string, value: any) => void }) {
  const data = node.data as any // Type assertion for now
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="attribute-name" className="text-sidebar-foreground">
          Attribute Name
        </Label>
        <Select
          value={data.name || ""}
          onValueChange={(value) => onChange("name", value)}
        >
          <SelectTrigger className="bg-input border-border text-foreground font-mono">
            <SelectValue placeholder="Select attribute" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Name">Name</SelectItem>
            <SelectItem value="Description">Description</SelectItem>
            <SelectItem value="Tag">Tag</SelectItem>
            <SelectItem value="GlobalId">GlobalId</SelectItem>
            <SelectItem value="ObjectType">ObjectType</SelectItem>
            <SelectItem value="OwnerHistory">OwnerHistory</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="attribute-value" className="text-sidebar-foreground">
          Value (Optional)
        </Label>
        <Input
          id="attribute-value"
          value={data.value || ""}
          onChange={(e) => onChange("value", e.target.value)}
          placeholder="e.g., Fire Door"
          className="bg-input border-border text-foreground"
        />
      </div>
    </>
  )
}

function ClassificationFields({ node, onChange }: { node: Node<any>; onChange: (field: string, value: any) => void }) {
  const data = node.data as any // Type assertion for now
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="classification-system" className="text-sidebar-foreground">
          Classification System
        </Label>
        <Select
          value={data.system || ""}
          onValueChange={(value) => onChange("system", value)}
        >
          <SelectTrigger className="bg-input border-border text-foreground font-mono">
            <SelectValue placeholder="Select system" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Uniclass 2015">Uniclass 2015</SelectItem>
            <SelectItem value="ETIM">ETIM</SelectItem>
            <SelectItem value="CCI">CCI</SelectItem>
            <SelectItem value="OmniClass">OmniClass</SelectItem>
            <SelectItem value="MasterFormat">MasterFormat</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="classification-value" className="text-sidebar-foreground">
          Classification Code (Optional)
        </Label>
        <Input
          id="classification-value"
          value={data.value || ""}
          onChange={(e) => onChange("value", e.target.value)}
          placeholder="e.g., Pr_20_70_05_05"
          className="bg-input border-border text-foreground font-mono"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="classification-uri" className="text-sidebar-foreground">
          URI (Optional)
        </Label>
        <Input
          id="classification-uri"
          value={data.uri || ""}
          onChange={(e) => onChange("uri", e.target.value)}
          placeholder="https://example.com/classification"
          className="bg-input border-border text-foreground"
        />
      </div>
    </>
  )
}

function MaterialFields({ node, onChange }: { node: Node<any>; onChange: (field: string, value: any) => void }) {
  const data = node.data as any // Type assertion for now
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="material-value" className="text-sidebar-foreground">
          Material Value
        </Label>
        <Select
          value={data.value || ""}
          onValueChange={(value) => onChange("value", value)}
        >
          <SelectTrigger className="bg-input border-border text-foreground font-mono">
            <SelectValue placeholder="Select material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="concrete">Concrete</SelectItem>
            <SelectItem value="steel">Steel</SelectItem>
            <SelectItem value="wood">Wood</SelectItem>
            <SelectItem value="brick">Brick</SelectItem>
            <SelectItem value="glass">Glass</SelectItem>
            <SelectItem value="aluminum">Aluminum</SelectItem>
            <SelectItem value="plastic">Plastic</SelectItem>
            <SelectItem value="composite">Composite</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="material-uri" className="text-sidebar-foreground">
          URI (Optional)
        </Label>
        <Input
          id="material-uri"
          value={data.uri || ""}
          onChange={(e) => onChange("uri", e.target.value)}
          placeholder="https://example.com/material"
          className="bg-input border-border text-foreground"
        />
      </div>
    </>
  )
}

function PartOfFields({ node, onChange }: { node: Node<any>; onChange: (field: string, value: any) => void }) {
  const data = node.data as any // Type assertion for now
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="partof-entity" className="text-sidebar-foreground">
          Entity Type
        </Label>
        <Select
          value={data.entity || ""}
          onValueChange={(value) => onChange("entity", value)}
        >
          <SelectTrigger className="bg-input border-border text-foreground font-mono">
            <SelectValue placeholder="Select entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IFCSPACE">IFCSPACE</SelectItem>
            <SelectItem value="IFCBUILDING">IFCBUILDING</SelectItem>
            <SelectItem value="IFCBUILDINGSTOREY">IFCBUILDINGSTOREY</SelectItem>
            <SelectItem value="IFCZONE">IFCZONE</SelectItem>
            <SelectItem value="IFCELEMENT">IFCELEMENT</SelectItem>
            <SelectItem value="IFCGROUP">IFCGROUP</SelectItem>
            <SelectItem value="IFCASSET">IFCASSET</SelectItem>
            <SelectItem value="IFCSYSTEM">IFCSYSTEM</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="partof-relation" className="text-sidebar-foreground">
          Relation Type (Optional)
        </Label>
        <Select
          value={data.relation || ""}
          onValueChange={(value) => onChange("relation", value)}
        >
          <SelectTrigger className="bg-input border-border text-foreground font-mono">
            <SelectValue placeholder="Select relation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IFCRELAGGREGATES">IFCRELAGGREGATES</SelectItem>
            <SelectItem value="IFCRELCONTAINEDINSPATIALSTRUCTURE">IFCRELCONTAINEDINSPATIALSTRUCTURE</SelectItem>
            <SelectItem value="IFCRELFILLSELEMENT">IFCRELFILLSELEMENT</SelectItem>
            <SelectItem value="IFCRELVOIDSELEMENT">IFCRELVOIDSELEMENT</SelectItem>
            <SelectItem value="IFCRELCONNECTSPATHELEMENTS">IFCRELCONNECTSPATHELEMENTS</SelectItem>
            <SelectItem value="IFCRELCONNECTSPORTS">IFCRELCONNECTSPORTS</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

function RestrictionFields({ node, onChange }: { node: Node<any>; onChange: (field: string, value: any) => void }) {
  const data = node.data as any // Type assertion for now
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="restriction-type" className="text-sidebar-foreground">
          Restriction Type
        </Label>
        <Select
          value={data.restrictionType || ""}
          onValueChange={(value) => onChange("restrictionType", value)}
        >
          <SelectTrigger className="bg-input border-border text-foreground font-mono">
            <SelectValue placeholder="Select restriction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enumeration">Enumeration</SelectItem>
            <SelectItem value="pattern">Pattern</SelectItem>
            <SelectItem value="bounds">Bounds</SelectItem>
            <SelectItem value="length">Length</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {data.restrictionType === "enumeration" && (
        <div className="space-y-2">
          <Label htmlFor="restriction-values" className="text-sidebar-foreground">
            Values (comma-separated)
          </Label>
          <Textarea
            id="restriction-values"
            value={Array.isArray(data.values) ? data.values.join(", ") : ""}
            onChange={(e) => onChange("values", e.target.value.split(",").map(v => v.trim()).filter(v => v))}
            placeholder="Value1, Value2, Value3"
            rows={3}
            className="bg-input border-border text-foreground"
          />
        </div>
      )}
      {data.restrictionType === "pattern" && (
        <div className="space-y-2">
          <Label htmlFor="restriction-pattern" className="text-sidebar-foreground">
            Pattern (Regex)
          </Label>
          <Input
            id="restriction-pattern"
            value={data.pattern || ""}
            onChange={(e) => onChange("pattern", e.target.value)}
            placeholder="^[A-Z][0-9]+$"
            className="bg-input border-border text-foreground font-mono"
          />
        </div>
      )}
      {data.restrictionType === "bounds" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="restriction-min" className="text-sidebar-foreground">
              Min Value
            </Label>
            <Input
              id="restriction-min"
              value={data.minValue || ""}
              onChange={(e) => onChange("minValue", e.target.value)}
              placeholder="0"
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restriction-max" className="text-sidebar-foreground">
              Max Value
            </Label>
            <Input
              id="restriction-max"
              value={data.maxValue || ""}
              onChange={(e) => onChange("maxValue", e.target.value)}
              placeholder="100"
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>
      )}
      {data.restrictionType === "length" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="restriction-min-length" className="text-sidebar-foreground">
              Min Length
            </Label>
            <Input
              id="restriction-min-length"
              value={data.minLength || ""}
              onChange={(e) => onChange("minLength", e.target.value)}
              placeholder="1"
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restriction-max-length" className="text-sidebar-foreground">
              Max Length
            </Label>
            <Input
              id="restriction-max-length"
              value={data.maxLength || ""}
              onChange={(e) => onChange("maxLength", e.target.value)}
              placeholder="255"
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>
      )}
    </>
  )
}
