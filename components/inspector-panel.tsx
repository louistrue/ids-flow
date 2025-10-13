"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Node } from "@xyflow/react"
import type { NodeData } from "@/lib/graph-types"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText } from "lucide-react"
import { EnumerationChipsEditor } from "@/components/enumeration-editors/chips-editor"
import { EnumerationListEditor } from "@/components/enumeration-editors/list-editor"
import { BulkEditorModal } from "@/components/enumeration-editors/bulk-modal"
import { EnumerationImportDialog } from "@/components/enumeration-editors/import-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  getEntitiesForVersion,
  getPredefinedTypesForEntity,
  getPropertiesForPropertySet,
  getExpectedDataTypesForProperty,
  IFC_DATA_TYPES,
  type IFCVersion,
} from "@/lib/ifc-schema"
import type { ValidationState } from "@/lib/use-ids-validation"
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"

interface InspectorPanelProps {
  selectedNode: Node<any> | null
  onUpdateNode: (nodeId: string, data: any) => void
  validationState?: ValidationState
  onValidateNow?: () => void
  isValidating?: boolean
  isValidationDisabled?: boolean
}

export function InspectorPanel({
  selectedNode,
  onUpdateNode,
  validationState,
  onValidateNow,
  isValidating = false,
  isValidationDisabled = false
}: InspectorPanelProps) {
  if (!selectedNode) {
    return (
      <Card className="h-full rounded-none border-l border-border bg-sidebar">
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
    <Card className="h-full rounded-none border-l border-border bg-sidebar">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Inspector</h2>
        <p className="text-xs text-muted-foreground mt-1 capitalize">{selectedNode.type} Node</p>
      </div>
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-4 min-w-0">
          {/* Validation Section */}
          {validationState && (
            <>
              <ValidationSection
                validationState={validationState}
                onValidateNow={onValidateNow}
                isValidating={isValidating}
                isDisabled={isValidationDisabled}
              />
              <Separator />
            </>
          )}

          {/* Node Properties */}
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

  const handleBaseNameChange = (newBaseName: string) => {
    // Update the base name
    onChange("baseName", newBaseName)

    // Auto-select the correct data type for predefined properties
    const expectedTypes = getExpectedDataTypesForProperty(newBaseName)
    if (expectedTypes && expectedTypes.length > 0) {
      // Set to the first expected type (most common/recommended)
      onChange("dataType", expectedTypes[0])
    }
  }

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
            onValueChange={handleBaseNameChange}
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
            onChange={(e) => handleBaseNameChange(e.target.value)}
            placeholder="e.g., FireRating"
            className="bg-input border-border text-foreground font-mono"
          />
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="dataType" className="text-sidebar-foreground">
          Data Type
          {data.baseName && getExpectedDataTypesForProperty(data.baseName) && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Recommended: {getExpectedDataTypesForProperty(data.baseName)?.join(' or ')})
            </span>
          )}
        </Label>
        <Select value={data.dataType || "IFCLABEL"} onValueChange={(value) => onChange("dataType", value)}>
          <SelectTrigger className="bg-input border-border text-foreground font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {IFC_DATA_TYPES.map((dt) => {
              const expectedTypes = data.baseName ? getExpectedDataTypesForProperty(data.baseName) : null
              const isRecommended = expectedTypes?.includes(dt.name)

              return (
                <SelectItem key={dt.name} value={dt.name} className="font-mono">
                  <div className="flex flex-col items-start">
                    <span className={isRecommended ? "text-green-600 dark:text-green-500 font-medium" : ""}>
                      {dt.name}
                      {isRecommended && " ✓"}
                    </span>
                    <span className="text-xs text-muted-foreground">{dt.description}</span>
                  </div>
                </SelectItem>
              )
            })}
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
  const [enumerationMode, setEnumerationMode] = useState<"chips" | "list">("chips")
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)

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
        <div className="space-y-4">
          {/* View selector */}
          <Tabs value={enumerationMode} onValueChange={(value) => setEnumerationMode(value as "chips" | "list")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 min-w-0">
              <TabsTrigger value="chips" className="min-w-0">
                Chips ({data.values?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="list" className="min-w-0">
                List
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chips" className="mt-4">
              <EnumerationChipsEditor
                values={data.values || []}
                onChange={(values) => onChange("values", values)}
              />
            </TabsContent>

            <TabsContent value="list" className="mt-4">
              <EnumerationListEditor
                values={data.values || []}
                onChange={(values) => onChange("values", values)}
              />
            </TabsContent>
          </Tabs>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
            >
              <Upload className="h-4 w-4 mr-1" />
              Import Values
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkModal(true)}
            >
              <FileText className="h-4 w-4 mr-1" />
              Bulk Edit
            </Button>
          </div>
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

      {/* Import Dialog */}
      {showImportDialog && (
        <EnumerationImportDialog
          onImport={(values) => {
            onChange("values", values)
            setShowImportDialog(false)
          }}
          onClose={() => setShowImportDialog(false)}
        />
      )}

      {/* Bulk Editor Modal */}
      {showBulkModal && (
        <BulkEditorModal
          values={data.values || []}
          onChange={(values) => onChange("values", values)}
          onImport={(importedValues) => onChange("values", importedValues)}
          open={showBulkModal}
          onOpenChange={setShowBulkModal}
        />
      )}
    </>
  )
}

function ValidationSection({
  validationState,
  onValidateNow,
  isValidating,
  isDisabled
}: {
  validationState: ValidationState
  onValidateNow?: () => void
  isValidating: boolean
  isDisabled: boolean
}) {
  const getStatusIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }

    if (validationState.status === 'error') {
      return <XCircle className="h-4 w-4 text-red-500" />
    }

    if (validationState.result?.status === 0) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }

    if (validationState.result?.status && validationState.result.status !== 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }

    return <AlertCircle className="h-4 w-4 text-gray-400" />
  }

  const getStatusBadge = () => {
    if (isValidating) {
      return <Badge variant="secondary" className="text-xs">Validating...</Badge>
    }

    if (validationState.status === 'error') {
      return <Badge variant="destructive" className="text-xs">Error</Badge>
    }

    if (validationState.result?.status === 0) {
      return <Badge variant="default" className="text-xs bg-green-500">Valid</Badge>
    }

    if (validationState.result?.status && validationState.result.status !== 0) {
      return <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">Issues</Badge>
    }

    return <Badge variant="outline" className="text-xs">Not validated</Badge>
  }

  const getStatusMessage = () => {
    if (isValidating) {
      return "Validating IDS structure..."
    }

    if (validationState.status === 'error') {
      return validationState.error || "Validation failed"
    }

    if (validationState.result) {
      return validationState.result.message
    }

    return "Click 'Validate Now' to check IDS structure"
  }

  const hasClientIssues = validationState.clientIssues && validationState.clientIssues.length > 0
  const hasClientErrors = validationState.clientIssues?.some(issue => issue.severity === 'error')
  const hasClientWarnings = validationState.clientIssues?.some(issue => issue.severity === 'warning')

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-sidebar-foreground">IDS Validation</h3>
        {onValidateNow && (
          <Button
            variant="outline"
            size="sm"
            onClick={onValidateNow}
            disabled={isDisabled || isValidating}
            className="h-7 px-2 text-xs"
          >
            {isValidating ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Validate Now
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getStatusBadge()}
            {validationState.lastValidated && (
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(validationState.lastValidated)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {getStatusMessage()}
          </p>
        </div>
      </div>

      {isDisabled && (
        <p className="text-xs text-muted-foreground italic">
          Add a specification node to enable validation
        </p>
      )}

      {/* Client-side validation issues */}
      {hasClientIssues && (
        <div className="space-y-2 mt-3 pt-3 border-t border-sidebar-border">
          <h4 className="text-xs font-medium text-sidebar-foreground">
            {hasClientErrors ? 'Validation Errors' : 'Validation Warnings'}
          </h4>
          <div className="space-y-1">
            {validationState.clientIssues?.map((issue, index) => (
              <div
                key={index}
                className={`text-xs p-2 rounded ${issue.severity === 'error'
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
                  }`}
              >
                <div className="flex items-start gap-1">
                  {issue.severity === 'error' ? (
                    <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="leading-tight">{issue.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
