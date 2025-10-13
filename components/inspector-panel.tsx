"use client"

import React, { useState, useEffect } from "react"
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
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"
import {
  getEntitiesForVersion,
  getPredefinedTypesForEntity,
  getPropertiesForPropertySet,
  getExpectedDataTypesForProperty,
  getAllSimpleTypes,
  getAllPropertySets,
  getAllEntities,
  getPropertySetsForEntityAsync,
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
  ifcVersion?: IFCVersion
}

export function InspectorPanel({
  selectedNode,
  onUpdateNode,
  validationState,
  onValidateNow,
  isValidating = false,
  isValidationDisabled = false,
  ifcVersion = "IFC4X3_ADD2"
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
          {selectedNode.type === "spec" && <SpecificationFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} />}
          {selectedNode.type === "entity" && <EntityFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} />}
          {selectedNode.type === "property" && <PropertyFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} />}
          {selectedNode.type === "attribute" && <AttributeFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} />}
          {selectedNode.type === "classification" && <ClassificationFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} />}
          {selectedNode.type === "material" && <MaterialFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} />}
          {selectedNode.type === "partOf" && <PartOfFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} />}
          {selectedNode.type === "restriction" && <RestrictionFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} />}
        </div>
      </ScrollArea>
    </Card>
  )
}

function SpecificationFields({ node, onChange, ifcVersion }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion }) {
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

function EntityFields({ node, onChange, ifcVersion }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion }) {
  const data = node.data as any // Type assertion for now

  // Load comprehensive entities from schema
  const [allEntities, setAllEntities] = useState<SearchableSelectOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEntities = async () => {
      try {
        const entities = await getAllEntities(ifcVersion)
        const entityOptions: SearchableSelectOption[] = entities.map(entity => ({
          value: entity.name,
          label: entity.name,
          description: entity.description,
          category: entity.category
        }))
        setAllEntities(entityOptions)
      } catch (error) {
        console.warn('Failed to load comprehensive entities:', error)
        // Fallback to legacy entities
        const legacyEntities = getEntitiesForVersion(ifcVersion)
        setAllEntities(legacyEntities.map(entity => ({
          value: entity,
          label: entity,
          description: `IFC ${ifcVersion} entity: ${entity}`,
          category: 'Other'
        })))
      } finally {
        setLoading(false)
      }
    }

    loadEntities()
  }, [ifcVersion])

  const predefinedTypes = data.name ? getPredefinedTypesForEntity(data.name, ifcVersion) : []

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sidebar-foreground">
          Entity Name
          {loading && <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>}
        </Label>
        <SearchableSelect
          options={allEntities}
          value={data.name}
          onValueChange={(value) => onChange("name", value)}
          placeholder="Search entities..."
          searchPlaceholder="Search 876+ entities..."
          emptyText="No entities found"
          showCategories={true}
          maxHeight={400}
          disabled={loading}
        />
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

function PropertyFields({ node, onChange, ifcVersion }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion }) {
  const data = node.data as any // Type assertion for now

  // Use comprehensive property sets from the full schema
  const [propertySetOptions, setPropertySetOptions] = useState<SearchableSelectOption[]>([])
  const [allDataTypes, setAllDataTypes] = useState<any[]>([])
  const [loadedPropertySets, setLoadedPropertySets] = useState<any[]>([])
  const [allEntities, setAllEntities] = useState<SearchableSelectOption[]>([])
  const [loading, setLoading] = useState(true)

  // Load comprehensive data on component mount
  useEffect(() => {
    const loadComprehensiveData = async () => {
      try {
        const [propertySets, dataTypes, entities] = await Promise.all([
          getAllPropertySets(ifcVersion),
          getAllSimpleTypes(ifcVersion),
          getAllEntities(ifcVersion)
        ])

        const entityOptions: SearchableSelectOption[] = entities.map(entity => ({
          value: entity.name,
          label: entity.name,
          description: entity.description,
          category: entity.category
        }))

        const psetOptions: SearchableSelectOption[] = propertySets.map(pset => ({
          value: pset.name,
          label: pset.name,
          description: `${pset.properties?.length || 0} properties`,
          category: 'Property Sets'
        }))

        setAllEntities(entityOptions)
        setPropertySetOptions(psetOptions)
        setLoadedPropertySets(propertySets)
        setAllDataTypes(dataTypes)
      } catch (error) {
        console.warn('Failed to load comprehensive schema data:', error)
        // Fallback to legacy data
        const fallbackPsets = [
          "Pset_WallCommon", "Pset_SlabCommon", "Pset_ColumnCommon",
          "Pset_BeamCommon", "Pset_DoorCommon", "Pset_WindowCommon", "Pset_SpaceCommon"
        ]
        setPropertySetOptions(fallbackPsets.map(name => ({
          value: name,
          label: name,
          description: 'Legacy property set',
          category: 'Property Sets'
        })))
        setAllDataTypes(IFC_DATA_TYPES)
      } finally {
        setLoading(false)
      }
    }

    loadComprehensiveData()
  }, [ifcVersion])

  // Filter property sets by selected entity
  useEffect(() => {
    const filterPropertySetsByEntity = async () => {
      if (!data.applicableEntity) {
        // Show all property sets if no entity selected
        const allPsets = await getAllPropertySets(ifcVersion)
        const psetOptions: SearchableSelectOption[] = allPsets.map(pset => ({
          value: pset.name,
          label: pset.name,
          description: `${pset.properties?.length || 0} properties`,
          category: 'Property Sets'
        }))
        setPropertySetOptions(psetOptions)
        setLoadedPropertySets(allPsets)
        return
      }

      try {
        const filteredPsets = await getPropertySetsForEntityAsync(data.applicableEntity, ifcVersion)
        const psetOptions: SearchableSelectOption[] = filteredPsets.map(pset => ({
          value: pset.name,
          label: pset.name,
          description: `${pset.properties?.length || 0} properties`,
          category: 'Property Sets'
        }))
        setPropertySetOptions(psetOptions)
        setLoadedPropertySets(filteredPsets)
      } catch (error) {
        console.warn('Failed to filter property sets by entity:', error)
      }
    }

    filterPropertySetsByEntity()
  }, [data.applicableEntity, ifcVersion])

  // Get properties for the selected property set
  const properties = React.useMemo(() => {
    if (!data.propertySet) return []

    // Try loaded property sets first
    const loadedPset = loadedPropertySets.find(ps => ps.name === data.propertySet)
    if (loadedPset && loadedPset.properties) {
      // Extract property names from loaded property set
      return loadedPset.properties.map((p: any) => p.name || p)
    }

    // Fallback to legacy function
    return getPropertiesForPropertySet(data.propertySet)
  }, [data.propertySet, loadedPropertySets])

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
        <Label htmlFor="applicableEntity" className="text-sidebar-foreground">
          Applicable Entity
          {loading && <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>}
        </Label>
        <SearchableSelect
          options={allEntities}
          value={data.applicableEntity}
          onValueChange={(value) => {
            onChange("applicableEntity", value)
            onChange("propertySet", "") // Reset property set when changing entity
            onChange("baseName", "") // Reset property when changing entity
          }}
          placeholder="Search entities..."
          searchPlaceholder="Search 876+ entities..."
          emptyText="No entities found"
          showCategories={true}
          maxHeight={300}
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="propertySet" className="text-sidebar-foreground">
          Property Set
          {loading && <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>}
          {data.applicableEntity && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Filtered for {data.applicableEntity})
            </span>
          )}
        </Label>
        <SearchableSelect
          options={propertySetOptions}
          value={data.propertySet}
          onValueChange={(value) => {
            onChange("propertySet", value)
            onChange("baseName", "") // Reset property when changing set
          }}
          placeholder="Search property sets..."
          searchPlaceholder={data.applicableEntity ? `Search property sets for ${data.applicableEntity}...` : "Search property sets..."}
          emptyText="No property sets found"
          showCategories={false}
          maxHeight={300}
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="baseName" className="text-sidebar-foreground">
          Base Name
          {data.propertySet && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({properties.length} properties available)
            </span>
          )}
        </Label>
        {properties.length > 0 ? (
          <SearchableSelect
            options={properties.map((prop: string) => {
              const expectedTypes = getExpectedDataTypesForProperty(prop)
              return {
                value: prop,
                label: prop,
                description: expectedTypes ? `Recommended: ${expectedTypes.join(' or ')}` : 'Property',
                category: expectedTypes ? 'Recommended Type' : 'All Properties'
              }
            })}
            value={data.baseName || ""}
            onValueChange={handleBaseNameChange}
            placeholder="Search properties..."
            searchPlaceholder={`Search ${properties.length} properties...`}
            emptyText="No properties found"
            showCategories={true}
            maxHeight={300}
          />
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
        <SearchableSelect
          options={allDataTypes.map((dt) => {
            const expectedTypes = data.baseName ? getExpectedDataTypesForProperty(data.baseName) : null
            const isRecommended = expectedTypes?.includes(dt.name)

            return {
              value: dt.name,
              label: dt.name,
              description: dt.description,
              category: isRecommended ? 'Recommended' : 'All Types'
            }
          })}
          value={data.dataType || "IFCLABEL"}
          onValueChange={(value) => onChange("dataType", value)}
          placeholder="Search data types..."
          searchPlaceholder="Search 60+ data types..."
          emptyText="No data types found"
          showCategories={true}
          maxHeight={300}
        />
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

function AttributeFields({ node, onChange, ifcVersion }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion }) {
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

function ClassificationFields({ node, onChange, ifcVersion }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion }) {
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

function MaterialFields({ node, onChange, ifcVersion }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion }) {
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

function PartOfFields({ node, onChange, ifcVersion }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion }) {
  const data = node.data as any // Type assertion for now
  const entities = getEntitiesForVersion(ifcVersion)

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
            {entities.map((entity) => (
              <SelectItem key={entity} value={entity} className="font-mono">
                {entity}
              </SelectItem>
            ))}
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

function RestrictionFields({ node, onChange, ifcVersion }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion }) {
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
