export interface GraphNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: NodeData
}

export type NodeData = Record<string, unknown> & (
  | SpecificationNodeData
  | EntityNodeData
  | PropertyNodeData
  | AttributeNodeData
  | ClassificationNodeData
  | MaterialNodeData
  | PartOfNodeData
  | RestrictionNodeData
)

// Cardinality values for IDS specifications and requirements
export type Cardinality = "required" | "optional" | "prohibited"

export interface SpecificationNodeData {
  name: string
  ifcVersion: string
  description: string
  hasEmptyApplicability?: boolean  // True if applicability exists but has no facets (wildcard pattern)
  applicabilityMinOccurs?: string  // Preserve minOccurs from empty applicability (deprecated - use applicabilityCardinality)
  applicabilityMaxOccurs?: string  // Preserve maxOccurs from empty applicability (deprecated - use applicabilityCardinality)
  applicabilityCardinality?: Cardinality  // Cardinality for applicability section
}

export interface EntityNodeData {
  name: string
  predefinedType?: string
}

export interface PropertyNodeData {
  propertySet: string
  baseName: string
  dataType?: string  // Optional - valid per IDS spec to omit dataType
  value?: string
  cardinality?: Cardinality  // Cardinality for requirement facets (not used in applicability)
}

export interface AttributeNodeData {
  name: string
  value?: string
  cardinality?: Cardinality  // Cardinality for requirement facets (not used in applicability)
}

export interface ClassificationNodeData {
  system: string
  value?: string
  uri?: string
  cardinality?: Cardinality  // Cardinality for requirement facets (not used in applicability)
}

export interface MaterialNodeData {
  value: string
  uri?: string
  cardinality?: Cardinality  // Cardinality for requirement facets (not used in applicability)
}

export interface PartOfNodeData {
  entity: string
  relation?: string
  cardinality?: Cardinality  // Cardinality for requirement facets (not used in applicability)
}

export interface RestrictionNodeData {
  restrictionType: "enumeration" | "pattern" | "bounds" | "length"
  values?: string[]
  pattern?: string
  minValue?: string
  maxValue?: string
  minLength?: string
  maxLength?: string
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  targetHandle?: string
}
