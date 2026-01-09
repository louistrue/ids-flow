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

// IDS file-level metadata (separate from specification-level data)
export interface IdsMetadata {
  title: string          // Required - overall IDS title
  copyright?: string     // Copyright information
  version?: string       // IDS version identifier
  description?: string   // IDS file description
  author?: string        // Email format
  date?: string          // ISO date format
  purpose?: string       // Purpose of this IDS
  milestone?: string     // Project milestone
}

export interface SpecificationNodeData {
  name: string
  ifcVersion: string
  description: string
  identifier?: string    // Unique identifier for this specification
  instructions?: string  // Instructions for this specification
  hasEmptyApplicability?: boolean  // True if applicability exists but has no facets (wildcard pattern)
  applicabilityMinOccurs?: string  // Preserve minOccurs from empty applicability (deprecated - use applicabilityCardinality)
  applicabilityMaxOccurs?: string  // Preserve maxOccurs from empty applicability (deprecated - use applicabilityCardinality)
  applicabilityCardinality?: Cardinality  // Cardinality for applicability section
  requirementsDescription?: string  // Requirements section description (optional)
}

export interface EntityNodeData {
  name: string
  predefinedType?: string
  cardinality?: Cardinality  // Cardinality when used in requirements section
  instructions?: string      // Instructions when used in requirements section
}

export interface PropertyNodeData {
  propertySet: string
  baseName: string
  dataType?: string  // Optional - valid per IDS spec to omit dataType
  value?: string
  cardinality?: Cardinality  // Cardinality for requirement facets (not used in applicability)
  uri?: string  // URI attribute for requirement properties (optional)
  instructions?: string  // Instructions attribute for requirement properties (optional)
}

export interface AttributeNodeData {
  name: string
  value?: string
  cardinality?: Cardinality  // Cardinality for requirement facets (not used in applicability)
  instructions?: string  // Instructions attribute for requirement attributes (optional)
}

export interface ClassificationNodeData {
  system: string
  value?: string
  uri?: string
  cardinality?: Cardinality  // Cardinality for requirement facets (not used in applicability)
  instructions?: string  // Instructions attribute for requirement classifications (optional)
}

export interface MaterialNodeData {
  value: string
  uri?: string
  cardinality?: Cardinality  // Cardinality for requirement facets (not used in applicability)
  instructions?: string  // Instructions attribute for requirement materials (optional)
}

export interface PartOfNodeData {
  entity: string
  relation?: string
  cardinality?: Cardinality  // Cardinality for requirement facets (not used in applicability)
  instructions?: string  // Instructions attribute for requirement partOf (optional)
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
