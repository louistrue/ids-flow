"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Node } from "@xyflow/react"
import type { NodeData, GraphNode, GraphEdge } from "@/lib/graph-types"
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
  getExpectedDataTypesForPropertyAsync,
  getAllSimpleTypes,
  getAllPropertySets,
  getAllEntities,
  getPropertySetsForEntityAsync,
  getAttributesForEntity,
  getClassificationSystemsForEntity,
  getMaterialTypesForEntity,
  getSpatialRelationsForEntity,
  IFC_DATA_TYPES,
  type IFCVersion,
} from "@/lib/ifc-schema"
import { getEntityContext } from "@/lib/graph-utils"
import {
  getCustomPropertySets,
  addCustomPropertySet,
  addCustomProperty,
  getCustomProperties,
  isCustomPropertySet,
  type CustomPropertySet
} from "@/lib/custom-schema-store"
import type { ValidationState } from "@/lib/use-ids-validation"
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, MousePointerClick, Info, Zap, PlusCircle, Link2, Eye, ExternalLink, BookOpen } from "lucide-react"

interface InspectorPanelProps {
  selectedNode: Node<any> | null
  onUpdateNode: (nodeId: string, data: any) => void
  validationState?: ValidationState
  onValidateNow?: () => void
  isValidating?: boolean
  isValidationDisabled?: boolean
  ifcVersion?: IFCVersion
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// Helper function to check if a facet node is in the requirements section
function isInRequirementsSection(nodeId: string, edges: GraphEdge[]): boolean {
  // Check if this node (or a restriction node it's connected to) targets a spec's requirements handle
  const directEdge = edges.find(e => e.source === nodeId)
  if (directEdge?.targetHandle === 'requirements') {
    return true
  }

  // Check if connected through a restriction node
  const restrictionEdge = edges.find(e => e.source === nodeId)
  if (restrictionEdge) {
    const finalEdge = edges.find(e => e.source === restrictionEdge.target)
    if (finalEdge?.targetHandle === 'requirements') {
      return true
    }
  }

  return false
}

// Cardinality selector component for requirement facets
function CardinalitySelector({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="cardinality" className="text-sidebar-foreground">
        Cardinality
      </Label>
      <Select
        value={value || "required"}
        onValueChange={onChange}
      >
        <SelectTrigger className="bg-input border-border text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="required">
            <div className="flex items-center gap-2">
              <span className="font-medium">Required</span>
              <span className="text-xs text-muted-foreground">Must have this</span>
            </div>
          </SelectItem>
          <SelectItem value="optional">
            <div className="flex items-center gap-2">
              <span className="font-medium">Optional</span>
              <span className="text-xs text-muted-foreground">May have this</span>
            </div>
          </SelectItem>
          <SelectItem value="prohibited">
            <div className="flex items-center gap-2">
              <span className="font-medium">Prohibited</span>
              <span className="text-xs text-muted-foreground">Must not have this</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Defines whether this requirement is required, optional, or prohibited
      </p>
    </div>
  )
}

export function InspectorPanel({
  selectedNode,
  onUpdateNode,
  validationState,
  onValidateNow,
  isValidating = false,
  isValidationDisabled = false,
  ifcVersion = "IFC4X3_ADD2",
  nodes,
  edges
}: InspectorPanelProps) {
  if (!selectedNode) {
    return (
      <Card className="h-full rounded-none border-l border-border bg-sidebar flex flex-col overflow-hidden">
        <div className="p-4 border-b border-sidebar-border flex-shrink-0">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Inspector</h2>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 pb-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/20">
                  <Eye className="h-10 w-10 text-blue-500" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-sidebar-foreground">
                  Node Inspector
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select a node to view and edit its properties
                </p>
              </div>
            </div>

            <Separator />

            {/* Quick Start Guide */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <h4 className="text-sm font-semibold text-sidebar-foreground">Quick Start</h4>
              </div>
              <div className="space-y-2">
                <div className="flex gap-3 p-3 rounded-lg bg-accent/5 border border-border/50">
                  <PlusCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-sidebar-foreground">Add Nodes</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Drag facet nodes from the left palette onto the canvas to build your IDS specification
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 rounded-lg bg-accent/5 border border-border/50">
                  <MousePointerClick className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-sidebar-foreground">Select & Inspect</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Click on any node to view its details and edit properties in this panel
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 rounded-lg bg-accent/5 border border-border/50">
                  <Link2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-sidebar-foreground">Connect Nodes</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Drag from connection ports to create relationships between facets
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Node Types */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-semibold text-sidebar-foreground">Available Facets</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                  <p className="font-medium text-purple-700 dark:text-purple-400">Specification</p>
                  <p className="text-muted-foreground mt-0.5">Root node</p>
                </div>
                <div className="p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                  <p className="font-medium text-blue-700 dark:text-blue-400">Entity</p>
                  <p className="text-muted-foreground mt-0.5">IFC object type</p>
                </div>
                <div className="p-2.5 rounded-md bg-green-500/10 border border-green-500/20">
                  <p className="font-medium text-green-700 dark:text-green-400">Property</p>
                  <p className="text-muted-foreground mt-0.5">Property sets</p>
                </div>
                <div className="p-2.5 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">Attribute</p>
                  <p className="text-muted-foreground mt-0.5">Object attributes</p>
                </div>
                <div className="p-2.5 rounded-md bg-orange-500/10 border border-orange-500/20">
                  <p className="font-medium text-orange-700 dark:text-orange-400">Classification</p>
                  <p className="text-muted-foreground mt-0.5">Classification codes</p>
                </div>
                <div className="p-2.5 rounded-md bg-pink-500/10 border border-pink-500/20">
                  <p className="font-medium text-pink-700 dark:text-pink-400">Material</p>
                  <p className="text-muted-foreground mt-0.5">Material types</p>
                </div>
                <div className="p-2.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                  <p className="font-medium text-indigo-700 dark:text-indigo-400">Part Of</p>
                  <p className="text-muted-foreground mt-0.5">Spatial relations</p>
                </div>
                <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/20">
                  <p className="font-medium text-red-700 dark:text-red-400">Restriction</p>
                  <p className="text-muted-foreground mt-0.5">Value constraints</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tips */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-sidebar-foreground">💡 Tips</h4>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Use <kbd className="px-1.5 py-0.5 rounded bg-accent/10 border border-border text-[10px] font-mono">Ctrl+Z</kbd> to undo changes</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>
                    Hold{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-accent/10 border border-border text-[10px] font-mono">⌘</kbd> /{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-accent/10 border border-border text-[10px] font-mono">Ctrl</kbd>{' '}
                    to select multiple nodes
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Use the target icon in the canvas controls to reset the view</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Connect Entity nodes to other facets for context-aware suggestions</span>
                </p>
              </div>
            </div>

            <Separator />

            {/* Learning Resources */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-semibold text-sidebar-foreground">Learn More</h4>
              </div>
              <div className="space-y-2">
                <a
                  href="https://learn-ids.lt.plus/en/ids/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-border/50 hover:bg-accent/10 hover:border-border transition-colors group"
                >
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground group-hover:text-blue-500 transition-colors">
                      IDS Comprehensive Course
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      learn-ids.lt.plus
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </a>
                <a
                  href="https://idslight.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-border/50 hover:bg-accent/10 hover:border-border transition-colors group"
                >
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/20 group-hover:border-green-500/40 transition-colors">
                    <ExternalLink className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground group-hover:text-green-500 transition-colors">
                      IDS Light (simple IDS text editor)
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      idslight.com
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors flex-shrink-0" />
                </a>
                <a
                  href="https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-border/50 hover:bg-accent/10 hover:border-border transition-colors group"
                >
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500/20 to-sky-500/20 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
                    <ExternalLink className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground group-hover:text-indigo-500 transition-colors">
                      buildingSMART IDS Manual
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      github.com/buildingSMART/IDS
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Card>
    )
  }

  const handleChange = (field: string, value: any) => {
    onUpdateNode(selectedNode.id, { [field]: value })
  }

  return (
    <Card className="h-full rounded-none border-l border-border bg-sidebar flex flex-col">
      <div className="p-4 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Inspector</h2>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{selectedNode.type} Node</p>
          </div>
          {/* Compact Validation Badge */}
          {validationState && (
            <ValidationBadge
              validationState={validationState}
              onValidateNow={onValidateNow}
              isValidating={isValidating}
              isDisabled={isValidationDisabled}
            />
          )}
        </div>
        {/* Validation Issues (if any) */}
        {validationState && validationState.clientIssues && validationState.clientIssues.length > 0 && (
          <ValidationIssues issues={validationState.clientIssues} />
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 min-w-0">
          {/* Node Properties */}
          {selectedNode.type === "spec" && <SpecificationFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} />}
          {selectedNode.type === "entity" && <EntityFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} />}
          {selectedNode.type === "property" && <PropertyFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} nodes={nodes} edges={edges} />}
          {selectedNode.type === "attribute" && <AttributeFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} nodes={nodes} edges={edges} />}
          {selectedNode.type === "classification" && <ClassificationFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} nodes={nodes} edges={edges} />}
          {selectedNode.type === "material" && <MaterialFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} nodes={nodes} edges={edges} />}
          {selectedNode.type === "partOf" && <PartOfFields node={selectedNode} onChange={handleChange} ifcVersion={ifcVersion} nodes={nodes} edges={edges} />}
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
        <Label htmlFor="applicabilityCardinality" className="text-sidebar-foreground">
          Applicability Cardinality
        </Label>
        <Select
          value={data.applicabilityCardinality || "required"}
          onValueChange={(value) => onChange("applicabilityCardinality", value)}
        >
          <SelectTrigger className="bg-input border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="required">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">Required</Badge>
                <span className="text-xs text-muted-foreground">At least one must exist</span>
              </div>
            </SelectItem>
            <SelectItem value="optional">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Optional</Badge>
                <span className="text-xs text-muted-foreground">May or may not exist</span>
              </div>
            </SelectItem>
            <SelectItem value="prohibited">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">Prohibited</Badge>
                <span className="text-xs text-muted-foreground">Must not exist</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Defines whether matching entities are required, optional, or prohibited in the model
        </p>
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

function PropertyFields({ node, onChange, ifcVersion, nodes, edges }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion; nodes: GraphNode[]; edges: GraphEdge[] }) {
  const data = node.data as any // Type assertion for now
  const isRequirement = isInRequirementsSection(node.id, edges)

  // Use comprehensive property sets from the full schema
  const [propertySetOptions, setPropertySetOptions] = useState<SearchableSelectOption[]>([])
  const [allDataTypes, setAllDataTypes] = useState<any[]>([])
  const [loadedPropertySets, setLoadedPropertySets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Get entity context from graph connections
  const entityContext = React.useMemo(() => {
    return getEntityContext(node.id, nodes, edges)
  }, [node.id, nodes, edges])

  // Load property sets based on entity context
  useEffect(() => {
    const loadPropertySets = async () => {
      try {
        const dataTypes = await getAllSimpleTypes(ifcVersion)
        setAllDataTypes(dataTypes)

        // Build property data type cache for accurate recommendations
        // This needs to be called at least once to populate the cache
        await getExpectedDataTypesForPropertyAsync('Reference', ifcVersion)

        // Get custom property sets
        const customPsets = getCustomPropertySets()

        if (!entityContext.entityName) {
          // Show ALL property sets if no entity connected
          const allPsets = await getAllPropertySets(ifcVersion)

          // Deduplicate property sets by name (keep first occurrence)
          const uniquePsets = allPsets.filter((pset, index, self) =>
            index === self.findIndex(p => p.name === pset.name)
          )

          // Merge IFC and custom property sets, avoiding duplicates
          const ifcOptions: SearchableSelectOption[] = uniquePsets.map(pset => ({
            value: pset.name,
            label: pset.name,
            description: `${pset.properties?.length || 0} properties`,
            category: 'IFC Property Sets'
          }))

          const customOptions: SearchableSelectOption[] = customPsets
            .filter(customPset => !uniquePsets.some(ifcPset => ifcPset.name === customPset.name))
            .map(pset => ({
              value: pset.name,
              label: pset.name,
              description: `${pset.properties.length} custom properties`,
              category: 'Custom Property Sets'
            }))

          setPropertySetOptions([...ifcOptions, ...customOptions])
          setLoadedPropertySets([...uniquePsets, ...customPsets.filter(customPset => !uniquePsets.some(ifcPset => ifcPset.name === customPset.name))])
        } else {
          // Show only applicable property sets for connected entity
          const filteredPsets = await getPropertySetsForEntityAsync(entityContext.entityName, ifcVersion)

          // Deduplicate filtered property sets by name (keep first occurrence)
          const uniqueFilteredPsets = filteredPsets.filter((pset, index, self) =>
            index === self.findIndex(p => p.name === pset.name)
          )

          // Custom property sets are always available (entity-agnostic)
          const ifcOptions: SearchableSelectOption[] = uniqueFilteredPsets.map(pset => ({
            value: pset.name,
            label: pset.name,
            description: `${pset.properties?.length || 0} properties`,
            category: 'IFC Property Sets'
          }))

          const customOptions: SearchableSelectOption[] = customPsets
            .filter(customPset => !uniqueFilteredPsets.some(ifcPset => ifcPset.name === customPset.name))
            .map(pset => ({
              value: pset.name,
              label: pset.name,
              description: `${pset.properties.length} custom properties`,
              category: 'Custom Property Sets'
            }))

          setPropertySetOptions([...ifcOptions, ...customOptions])
          setLoadedPropertySets([...uniqueFilteredPsets, ...customPsets.filter(customPset => !uniqueFilteredPsets.some(ifcPset => ifcPset.name === customPset.name))])
        }
      } catch (error) {
        console.warn('Failed to load property sets:', error)
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

    loadPropertySets()
  }, [entityContext.entityName, ifcVersion])

  // Get properties for the selected property set
  const properties = React.useMemo(() => {
    if (!data.propertySet) return []

    // Check if it's a custom property set
    if (isCustomPropertySet(data.propertySet)) {
      return getCustomProperties(data.propertySet)
    }

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
      {/* Show cardinality selector only for requirements */}
      {isRequirement && (
        <CardinalitySelector
          value={data.cardinality}
          onChange={(value) => onChange("cardinality", value)}
        />
      )}
      <div className="space-y-2">
        <Label htmlFor="propertySet" className="text-sidebar-foreground">
          Property Set
          {loading && <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>}
          {entityContext.entityName && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Filtered for {entityContext.entityName})
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
          searchPlaceholder={entityContext.entityName ? `Search property sets for ${entityContext.entityName}...` : "Search property sets..."}
          emptyText="No property sets found"
          showCategories={true}
          maxHeight={300}
          disabled={loading}
          allowCustom={true}
          onCreateOption={(name) => {
            // Use the exact name provided by the user - no prefixing!
            // Pset_ prefix is RESERVED for standardized IFC property sets only
            addCustomPropertySet(name)
            onChange("propertySet", name)
            onChange("baseName", "") // Reset property

            // Reload options to include the new custom pset
            const customPsets = getCustomPropertySets()
            const newCustomOptions: SearchableSelectOption[] = customPsets.map(pset => ({
              value: pset.name,
              label: pset.name,
              description: `${pset.properties.length} custom properties`,
              category: 'Custom Property Sets'
            }))

            // Update options with new custom pset, avoiding duplicates
            setPropertySetOptions(prev => {
              const withoutOldCustom = prev.filter(opt => opt.category !== 'Custom Property Sets')
              const uniqueCustomOptions = newCustomOptions.filter(opt =>
                !withoutOldCustom.some(existing => existing.value === opt.value)
              )
              return [...withoutOldCustom, ...uniqueCustomOptions]
            })

            // Update loaded property sets, avoiding duplicates
            setLoadedPropertySets(prev => {
              const withoutOldCustom = prev.filter(pset => !isCustomPropertySet(pset.name))
              const uniqueCustomPsets = customPsets.filter(pset =>
                !withoutOldCustom.some(existing => existing.name === pset.name)
              )
              return [...withoutOldCustom, ...uniqueCustomPsets]
            })
          }}
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
        <SearchableSelect
          options={properties.map((prop: string) => {
            const expectedTypes = getExpectedDataTypesForProperty(prop)
            const isCustom = isCustomPropertySet(data.propertySet || '') && getCustomProperties(data.propertySet || '').includes(prop)
            return {
              value: prop,
              label: prop,
              description: expectedTypes ? `Recommended: ${expectedTypes.join(' or ')}` : (isCustom ? 'Custom Property' : 'Property'),
              category: isCustom ? 'Custom Properties' : (expectedTypes ? 'Recommended Type' : 'All Properties')
            }
          })}
          value={data.baseName || ""}
          onValueChange={handleBaseNameChange}
          placeholder="Search properties..."
          searchPlaceholder={`Search ${properties.length} properties...`}
          emptyText="No properties found"
          showCategories={true}
          maxHeight={300}
          allowCustom={true}
          onCreateOption={(name) => {
            if (data.propertySet) {
              addCustomProperty(data.propertySet, name)
              onChange("baseName", name)

              // Update properties list to include new custom property
              const updatedProperties = getCustomProperties(data.propertySet)

              // Update loaded property sets to reflect the change
              setLoadedPropertySets(prev => prev.map(pset => {
                if (pset.name === data.propertySet) {
                  return { ...pset, properties: updatedProperties }
                }
                return pset
              }))
            }
          }}
        />
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
          value={data.dataType || ""}
          onValueChange={(value) => onChange("dataType", value === "" ? undefined : value)}
          placeholder="Search data types... (optional)"
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

function getPlaceholderForDataType(dataType?: string): string {
  if (!dataType) {
    return "Enter value..."
  }
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

function AttributeFields({ node, onChange, ifcVersion, nodes, edges }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion; nodes: GraphNode[]; edges: GraphEdge[] }) {
  const data = node.data as any // Type assertion for now
  const isRequirement = isInRequirementsSection(node.id, edges)

  // Get entity context from graph connections
  const entityContext = React.useMemo(() => {
    return getEntityContext(node.id, nodes, edges)
  }, [node.id, nodes, edges])

  // Load attributes based on entity context
  const [attributeOptions, setAttributeOptions] = useState<SearchableSelectOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAttributes = async () => {
      try {
        if (!entityContext.entityName) {
          // Show common attributes if no entity connected
          const commonAttributes = [
            { name: "Name", type: "IFCLABEL", optional: false },
            { name: "Description", type: "IFCTEXT", optional: true },
            { name: "Tag", type: "IFCLABEL", optional: true },
            { name: "GlobalId", type: "IFCGLOBALLYUNIQUEID", optional: false },
            { name: "ObjectType", type: "IFCLABEL", optional: true },
            { name: "OwnerHistory", type: "IFCOWNERHISTORY", optional: false }
          ]
          const attributeOptions: SearchableSelectOption[] = commonAttributes.map(attr => ({
            value: attr.name,
            label: attr.name,
            description: `${attr.type}${attr.optional ? ' (optional)' : ''}`,
            category: attr.optional ? 'Optional' : 'Required'
          }))
          setAttributeOptions(attributeOptions)
        } else {
          // Show only attributes for connected entity
          const entityAttributes = await getAttributesForEntity(entityContext.entityName, ifcVersion)
          const attributeOptions: SearchableSelectOption[] = entityAttributes.map(attr => ({
            value: attr.name,
            label: attr.name,
            description: `${attr.type}${attr.optional ? ' (optional)' : ''}`,
            category: attr.optional ? 'Optional' : 'Required'
          }))
          setAttributeOptions(attributeOptions)
        }
      } catch (error) {
        console.warn('Failed to load attributes:', error)
        setAttributeOptions([])
      } finally {
        setLoading(false)
      }
    }

    loadAttributes()
  }, [entityContext.entityName, ifcVersion])

  return (
    <>
      {/* Show cardinality selector only for requirements */}
      {isRequirement && (
        <CardinalitySelector
          value={data.cardinality}
          onChange={(value) => onChange("cardinality", value)}
        />
      )}
      <div className="space-y-2">
        <Label htmlFor="attribute-name" className="text-sidebar-foreground">
          Attribute Name
          {loading && <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>}
          {entityContext.entityName && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Filtered for {entityContext.entityName})
            </span>
          )}
        </Label>
        {attributeOptions.length > 0 ? (
          <SearchableSelect
            options={attributeOptions}
            value={data.name || ""}
            onValueChange={(value) => onChange("name", value)}
            placeholder="Search attributes..."
            searchPlaceholder={entityContext.entityName ? `Search attributes for ${entityContext.entityName}...` : "Search attributes..."}
            emptyText="No attributes found"
            showCategories={true}
            maxHeight={300}
            disabled={loading}
          />
        ) : (
          <Input
            id="attribute-name"
            value={data.name || ""}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="e.g., Tag"
            className="bg-input border-border text-foreground font-mono"
          />
        )}
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

function ClassificationFields({ node, onChange, ifcVersion, nodes, edges }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion; nodes: GraphNode[]; edges: GraphEdge[] }) {
  const data = node.data as any // Type assertion for now
  const isRequirement = isInRequirementsSection(node.id, edges)

  // Get entity context from graph connections
  const entityContext = React.useMemo(() => {
    return getEntityContext(node.id, nodes, edges)
  }, [node.id, nodes, edges])

  // Load classification systems based on entity context
  const [classificationOptions, setClassificationOptions] = useState<SearchableSelectOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClassificationSystems = async () => {
      try {
        if (!entityContext.entityName) {
          // Show all classification systems if no entity connected
          const allSystems = [
            "Uniclass 2015", "ETIM", "CCI", "OmniClass", "MasterFormat", "Custom"
          ]
          const systemOptions: SearchableSelectOption[] = allSystems.map(system => ({
            value: system,
            label: system,
            description: 'Classification system',
            category: 'All Systems'
          }))
          setClassificationOptions(systemOptions)
        } else {
          // Show only applicable classification systems for connected entity
          const entitySystems = await getClassificationSystemsForEntity(entityContext.entityName, ifcVersion)
          const systemOptions: SearchableSelectOption[] = entitySystems.map(system => ({
            value: system,
            label: system,
            description: 'Applicable to ' + entityContext.entityName,
            category: 'Entity Specific'
          }))
          setClassificationOptions(systemOptions)
        }
      } catch (error) {
        console.warn('Failed to load classification systems:', error)
        setClassificationOptions([])
      } finally {
        setLoading(false)
      }
    }

    loadClassificationSystems()
  }, [entityContext.entityName, ifcVersion])

  return (
    <>
      {/* Show cardinality selector only for requirements */}
      {isRequirement && (
        <CardinalitySelector
          value={data.cardinality}
          onChange={(value) => onChange("cardinality", value)}
        />
      )}
      <div className="space-y-2">
        <Label htmlFor="classification-system" className="text-sidebar-foreground">
          Classification System
          {loading && <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>}
          {entityContext.entityName && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Filtered for {entityContext.entityName})
            </span>
          )}
        </Label>
        {classificationOptions.length > 0 ? (
          <SearchableSelect
            options={classificationOptions}
            value={data.system || ""}
            onValueChange={(value) => onChange("system", value)}
            placeholder="Search classification systems..."
            searchPlaceholder={entityContext.entityName ? `Search systems for ${entityContext.entityName}...` : "Search classification systems..."}
            emptyText="No classification systems found"
            showCategories={true}
            maxHeight={300}
            disabled={loading}
          />
        ) : (
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
        )}
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

function MaterialFields({ node, onChange, ifcVersion, nodes, edges }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion; nodes: GraphNode[]; edges: GraphEdge[] }) {
  const data = node.data as any // Type assertion for now
  const isRequirement = isInRequirementsSection(node.id, edges)

  // Get entity context from graph connections
  const entityContext = React.useMemo(() => {
    return getEntityContext(node.id, nodes, edges)
  }, [node.id, nodes, edges])

  // Load material types based on entity context
  const [materialOptions, setMaterialOptions] = useState<SearchableSelectOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMaterialTypes = async () => {
      try {
        if (!entityContext.entityName) {
          // Show all material types if no entity connected
          const allMaterials = [
            "concrete", "steel", "wood", "brick", "glass", "aluminum", "plastic", "composite", "custom"
          ]
          const materialOptions: SearchableSelectOption[] = allMaterials.map(material => ({
            value: material,
            label: material.charAt(0).toUpperCase() + material.slice(1),
            description: 'Material type',
            category: 'All Materials'
          }))
          setMaterialOptions(materialOptions)
        } else {
          // Show only applicable material types for connected entity
          const entityMaterials = await getMaterialTypesForEntity(entityContext.entityName, ifcVersion)
          const materialOptions: SearchableSelectOption[] = entityMaterials.map(material => ({
            value: material.toLowerCase(),
            label: material,
            description: 'Applicable to ' + entityContext.entityName,
            category: 'Entity Specific'
          }))
          setMaterialOptions(materialOptions)
        }
      } catch (error) {
        console.warn('Failed to load material types:', error)
        setMaterialOptions([])
      } finally {
        setLoading(false)
      }
    }

    loadMaterialTypes()
  }, [entityContext.entityName, ifcVersion])

  return (
    <>
      {/* Show cardinality selector only for requirements */}
      {isRequirement && (
        <CardinalitySelector
          value={data.cardinality}
          onChange={(value) => onChange("cardinality", value)}
        />
      )}
      <div className="space-y-2">
        <Label htmlFor="material-value" className="text-sidebar-foreground">
          Material Value
          {loading && <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>}
          {entityContext.entityName && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Filtered for {entityContext.entityName})
            </span>
          )}
        </Label>
        {materialOptions.length > 0 ? (
          <SearchableSelect
            options={materialOptions}
            value={data.value || ""}
            onValueChange={(value) => onChange("value", value)}
            placeholder="Search materials..."
            searchPlaceholder={entityContext.entityName ? `Search materials for ${entityContext.entityName}...` : "Search materials..."}
            emptyText="No materials found"
            showCategories={true}
            maxHeight={300}
            disabled={loading}
          />
        ) : (
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
        )}
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

function PartOfFields({ node, onChange, ifcVersion, nodes, edges }: { node: Node<any>; onChange: (field: string, value: any) => void; ifcVersion: IFCVersion; nodes: GraphNode[]; edges: GraphEdge[] }) {
  const data = node.data as any // Type assertion for now
  const isRequirement = isInRequirementsSection(node.id, edges)

  // Get entity context from graph connections
  const entityContext = React.useMemo(() => {
    return getEntityContext(node.id, nodes, edges)
  }, [node.id, nodes, edges])

  // Load spatial relations based on entity context
  const [relationOptions, setRelationOptions] = useState<SearchableSelectOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSpatialRelations = async () => {
      try {
        if (!entityContext.entityName) {
          // Show all spatial relations if no entity connected
          const allRelations = [
            "IFCRELAGGREGATES", "IFCRELASSIGNSTOGROUP", "IFCRELCONTAINEDINSPATIALSTRUCTURE",
            "IFCRELNESTS", "IFCRELVOIDSELEMENT", "IFCRELFILLSELEMENT"
          ]
          const relationOptions: SearchableSelectOption[] = allRelations.map(relation => ({
            value: relation,
            label: relation,
            description: 'Spatial relation',
            category: 'All Relations'
          }))
          setRelationOptions(relationOptions)
        } else {
          // Show only applicable spatial relations for connected entity
          const entityRelations = await getSpatialRelationsForEntity(entityContext.entityName, ifcVersion)
          const relationOptions: SearchableSelectOption[] = entityRelations.map(relation => ({
            value: relation,
            label: relation,
            description: 'Applicable to ' + entityContext.entityName,
            category: 'Entity Specific'
          }))
          setRelationOptions(relationOptions)
        }
      } catch (error) {
        console.warn('Failed to load spatial relations:', error)
        setRelationOptions([])
      } finally {
        setLoading(false)
      }
    }

    loadSpatialRelations()
  }, [entityContext.entityName, ifcVersion])

  const entities = getEntitiesForVersion(ifcVersion)

  return (
    <>
      {/* Show cardinality selector only for requirements */}
      {isRequirement && (
        <CardinalitySelector
          value={data.cardinality}
          onChange={(value) => onChange("cardinality", value)}
        />
      )}
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
          {loading && <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>}
          {entityContext.entityName && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Filtered for {entityContext.entityName})
            </span>
          )}
        </Label>
        {relationOptions.length > 0 ? (
          <SearchableSelect
            options={relationOptions}
            value={data.relation || ""}
            onValueChange={(value) => onChange("relation", value)}
            placeholder="Search relations..."
            searchPlaceholder={entityContext.entityName ? `Search relations for ${entityContext.entityName}...` : "Search relations..."}
            emptyText="No relations found"
            showCategories={true}
            maxHeight={300}
            disabled={loading}
          />
        ) : (
          <Select
            value={data.relation || ""}
            onValueChange={(value) => onChange("relation", value)}
          >
            <SelectTrigger className="bg-input border-border text-foreground font-mono">
              <SelectValue placeholder="Select relation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IFCRELAGGREGATES">IFCRELAGGREGATES</SelectItem>
              <SelectItem value="IFCRELASSIGNSTOGROUP">IFCRELASSIGNSTOGROUP</SelectItem>
              <SelectItem value="IFCRELCONTAINEDINSPATIALSTRUCTURE">IFCRELCONTAINEDINSPATIALSTRUCTURE</SelectItem>
              <SelectItem value="IFCRELNESTS">IFCRELNESTS</SelectItem>
              <SelectItem value="IFCRELVOIDSELEMENT">IFCRELVOIDSELEMENT</SelectItem>
              <SelectItem value="IFCRELFILLSELEMENT">IFCRELFILLSELEMENT</SelectItem>
            </SelectContent>
          </Select>
        )}
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

function ValidationBadge({
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
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
    }

    if (validationState.status === 'error') {
      return <XCircle className="h-3.5 w-3.5 text-red-500" />
    }

    if (validationState.result?.status === 0) {
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
    }

    if (validationState.result?.status && validationState.result.status !== 0) {
      return <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
    }

    return <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
  }

  const getStatusColor = () => {
    if (isValidating) return "border-blue-500/50 bg-blue-500/10"
    if (validationState.status === 'error') return "border-red-500/50 bg-red-500/10"
    if (validationState.result?.status === 0) return "border-green-500/50 bg-green-500/10"
    if (validationState.result?.status && validationState.result.status !== 0) return "border-yellow-500/50 bg-yellow-500/10"
    return "border-gray-400/50 bg-gray-400/10"
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-xs font-medium text-sidebar-foreground">IDS</span>
      </div>
      {onValidateNow && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onValidateNow}
          disabled={isDisabled || isValidating}
          className="h-7 w-7 p-0"
          title="Validate IDS"
        >
          {isValidating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </div>
  )
}

function ValidationIssues({ issues }: { issues: Array<{ severity: 'error' | 'warning'; message: string }> }) {
  return (
    <div className="mt-3 space-y-1">
      {issues.map((issue, index) => (
        <div
          key={index}
          className={`text-xs p-2 rounded ${issue.severity === 'error'
            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
            : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20'
            }`}
        >
          <div className="flex items-start gap-1.5">
            {issue.severity === 'error' ? (
              <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            )}
            <span className="leading-tight flex-1">{issue.message}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
