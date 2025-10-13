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

export interface SpecificationNodeData {
  name: string
  ifcVersion: string
  description: string
}

export interface EntityNodeData {
  name: string
  predefinedType?: string
}

export interface PropertyNodeData {
  propertySet: string
  baseName: string
  dataType: string
  value?: string
}

export interface AttributeNodeData {
  name: string
  value?: string
}

export interface ClassificationNodeData {
  system: string
  value?: string
  uri?: string
}

export interface MaterialNodeData {
  value: string
  uri?: string
}

export interface PartOfNodeData {
  entity: string
  relation?: string
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
