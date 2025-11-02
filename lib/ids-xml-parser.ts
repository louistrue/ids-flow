import { XMLParser } from "fast-xml-parser"
import type { GraphNode, GraphEdge, RestrictionNodeData } from "./graph-types"
import { DEFAULT_LAYOUT_CONFIG, calculateNodePosition, type LayoutConfig } from "./node-layout"

export interface ParsedIdsGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  ifcVersion?: string
}

interface IdCounters {
  spec: number
  entity: number
  property: number
  attribute: number
  classification: number
  material: number
  partOf: number
  restriction: number
  edge: number
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  trimValues: true,
})

export function convertIdsXmlToGraph(xml: string): ParsedIdsGraph {
  if (!xml.trim()) {
    throw new Error("IDS file is empty")
  }

  const parsed = parser.parse(xml)
  const root = parsed?.ids
  if (!root) {
    throw new Error("Invalid IDS file: missing ids root element")
  }

  const specifications = toArray(root.specifications?.specification ?? root.specification)
  if (specifications.length === 0) {
    throw new Error("IDS file contains no specifications")
  }

  const counters: IdCounters = {
    spec: 0,
    entity: 0,
    property: 0,
    attribute: 0,
    classification: 0,
    material: 0,
    partOf: 0,
    restriction: 0,
    edge: 0,
  }

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  let fallbackIfcVersion: string | undefined

  specifications.forEach((spec: any, specIndex: number) => {
    counters.spec += 1
    const specId = `spec-${counters.spec}`

    const specOffsetY = specIndex * (DEFAULT_LAYOUT_CONFIG.verticalSpacing * 4 + DEFAULT_LAYOUT_CONFIG.groupGap)

    const specNode: GraphNode = {
      id: specId,
      type: "spec",
      position: {
        x: DEFAULT_LAYOUT_CONFIG.specPosition.x,
        y: DEFAULT_LAYOUT_CONFIG.specPosition.y + specOffsetY,
      },
      data: {
        name: spec.name || spec.title || root.info?.title || `Specification ${specIndex + 1}`,
        ifcVersion: spec.ifcVersion || root.info?.ifcVersion || "IFC4X3_ADD2",
        description: spec.description || root.info?.description || "",
      },
    }

    fallbackIfcVersion = fallbackIfcVersion ?? (specNode.data.ifcVersion as string | undefined)

    nodes.push(specNode)

    const sectionBaseY = DEFAULT_LAYOUT_CONFIG.baseY + specOffsetY
    let applicabilityCount = 0
    let requirementsCount = 0

    const applicability = spec.applicability || spec.Applicability
    if (applicability) {
      parseApplicability(applicability, {
        specId,
        nodes,
        edges,
        counters,
        baseY: sectionBaseY,
        specPosition: specNode.position,
        applicabilityCountRef: () => applicabilityCount,
        incrementApplicability: () => { applicabilityCount += 1 },
      })
    }

    const requirements = spec.requirements || spec.Requirements
    if (requirements) {
      parseRequirements(requirements, {
        specId,
        nodes,
        edges,
        counters,
        baseY: sectionBaseY,
        specPosition: specNode.position,
        applicabilityCountRef: () => applicabilityCount,
        requirementsCountRef: () => requirementsCount,
        incrementRequirements: () => { requirementsCount += 1 },
      })
    }
  })

  return {
    nodes,
    edges,
    ifcVersion: fallbackIfcVersion,
  }
}

interface ApplicabilityContext {
  specId: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  counters: IdCounters
  baseY: number
  specPosition: { x: number; y: number }
  applicabilityCountRef: () => number
  incrementApplicability: () => void
}

interface RequirementsContext extends ApplicabilityContext {
  requirementsCountRef: () => number
  incrementRequirements: () => void
}

function parseApplicability(applicability: any, ctx: ApplicabilityContext) {
  const entities = toArray(applicability.entity)
  entities.forEach(entity => {
    const name = getSimpleValue(entity?.name)
    const predefinedType = getSimpleValue(entity?.predefinedType)

    const position = calculateNodePosition(
      "entity",
      "applicability",
      ctx.nodes,
      ctx.edges,
      ctx.specId,
      getLayoutConfig(ctx)
    )

    const entityId = createNodeId(ctx.counters, "entity")
    const node: GraphNode = {
      id: entityId,
      type: "entity",
      position,
      data: {
        name: (name || "IFCENTITY").toUpperCase(),
        predefinedType: predefinedType || "",
      },
    }
    ctx.nodes.push(node)

    addEdge(ctx.edges, ctx.counters, entityId, ctx.specId, "applicability")
    ctx.incrementApplicability()
  })

  const properties = toArray(applicability.property)
  properties.forEach(property => {
    createFacetWithOptionalRestriction({
      ctx,
      targetHandle: "applicability",
      type: "property",
      data: {
        propertySet: getSimpleValue(property?.propertySet) || "",
        baseName: getSimpleValue(property?.baseName) || "",
        dataType: extractDataType(property),
      },
      valueNode: property?.value,
    })
  })

  const attributes = toArray(applicability.attribute)
  attributes.forEach(attribute => {
    createFacetWithOptionalRestriction({
      ctx,
      targetHandle: "applicability",
      type: "attribute",
      data: {
        name: getSimpleValue(attribute?.name) || "",
      },
      valueNode: attribute?.value,
    })
  })

  const classifications = toArray(applicability.classification)
  classifications.forEach(classification => {
    createFacetWithOptionalRestriction({
      ctx,
      targetHandle: "applicability",
      type: "classification",
      data: {
        system: getSimpleValue(classification?.system) || "",
        uri: classification?.uri || "",
      },
      valueNode: classification?.value,
    })
  })

  const materials = toArray(applicability.material)
  materials.forEach(material => {
    createFacetWithOptionalRestriction({
      ctx,
      targetHandle: "applicability",
      type: "material",
      data: {
        value: getSimpleValue(material?.value) || "",
        uri: material?.uri || "",
      },
      valueNode: material?.value,
    })
  })

  const partOfs = toArray(applicability.partOf)
  partOfs.forEach(partOf => {
    const position = calculateNodePosition(
      "partOf",
      "applicability",
      ctx.nodes,
      ctx.edges,
      ctx.specId,
      getLayoutConfig(ctx)
    )

    const nodeId = createNodeId(ctx.counters, "partOf")
    const node: GraphNode = {
      id: nodeId,
      type: "partOf",
      position,
      data: {
        entity: (getSimpleValue(partOf?.entity?.name) || "").toUpperCase(),
        relation: partOf?.relation || "",
      },
    }

    ctx.nodes.push(node)
    addEdge(ctx.edges, ctx.counters, nodeId, ctx.specId, "applicability")
    ctx.incrementApplicability()
  })
}

function parseRequirements(requirements: any, ctx: RequirementsContext) {
  const properties = toArray(requirements.property)
  properties.forEach(property => {
    createFacetWithOptionalRestriction({
      ctx,
      targetHandle: "requirements",
      type: "property",
      data: {
        propertySet: getSimpleValue(property?.propertySet) || "",
        baseName: getSimpleValue(property?.baseName) || "",
        dataType: extractDataType(property),
      },
      valueNode: property?.value,
    })
  })

  const attributes = toArray(requirements.attribute)
  attributes.forEach(attribute => {
    createFacetWithOptionalRestriction({
      ctx,
      targetHandle: "requirements",
      type: "attribute",
      data: {
        name: getSimpleValue(attribute?.name) || "",
      },
      valueNode: attribute?.value,
    })
  })

  const classifications = toArray(requirements.classification)
  classifications.forEach(classification => {
    createFacetWithOptionalRestriction({
      ctx,
      targetHandle: "requirements",
      type: "classification",
      data: {
        system: getSimpleValue(classification?.system) || "",
        uri: classification?.uri || "",
      },
      valueNode: classification?.value,
    })
  })

  const materials = toArray(requirements.material)
  materials.forEach(material => {
    createFacetWithOptionalRestriction({
      ctx,
      targetHandle: "requirements",
      type: "material",
      data: {
        value: getSimpleValue(material?.value) || "",
        uri: material?.uri || "",
      },
      valueNode: material?.value,
    })
  })

  const partOfs = toArray(requirements.partOf)
  partOfs.forEach(partOf => {
    const position = calculateNodePosition(
      "partOf",
      "requirements",
      ctx.nodes,
      ctx.edges,
      ctx.specId,
      getLayoutConfig(ctx)
    )

    const nodeId = createNodeId(ctx.counters, "partOf")
    const node: GraphNode = {
      id: nodeId,
      type: "partOf",
      position,
      data: {
        entity: (getSimpleValue(partOf?.entity?.name) || "").toUpperCase(),
        relation: partOf?.relation || "",
      },
    }

    ctx.nodes.push(node)
    addEdge(ctx.edges, ctx.counters, nodeId, ctx.specId, "requirements")
    ctx.incrementRequirements()
  })
}

interface FacetCreationInput {
  ctx: ApplicabilityContext | RequirementsContext
  targetHandle: "applicability" | "requirements"
  type: GraphNode["type"]
  data: Record<string, unknown>
  valueNode?: any
}

function createFacetWithOptionalRestriction(input: FacetCreationInput) {
  const {
    ctx,
    targetHandle,
    type,
    data,
    valueNode,
  } = input

  const position = calculateNodePosition(
    type,
    targetHandle,
    ctx.nodes,
    ctx.edges,
    ctx.specId,
    getLayoutConfig(ctx)
  )

  const nodeId = createNodeId(ctx.counters, type as keyof IdCounters & string)
  const node: GraphNode = {
    id: nodeId,
    type,
    position,
    data: {
      ...data,
    },
  }

  ctx.nodes.push(node)

  const valueExtraction = parseValueNode(valueNode)
  if (valueExtraction.simpleValue !== undefined && valueExtraction.simpleValue !== "") {
    ;(node.data as any).value = valueExtraction.simpleValue
  }

  if (valueExtraction.restriction) {
    if ('value' in node.data) {
      (node.data as any).value = ""
    }
    const restrictionNodeId = createNodeId(ctx.counters, "restriction")
    const restrictionPosition = calculateRestrictionPosition(node.position, ctx.specPosition)
    const restrictionNode: GraphNode = {
      id: restrictionNodeId,
      type: "restriction",
      position: restrictionPosition,
      data: valueExtraction.restriction,
    }
    ctx.nodes.push(restrictionNode)

    addSimpleEdge(ctx.edges, ctx.counters, nodeId, restrictionNodeId)
    addEdge(ctx.edges, ctx.counters, restrictionNodeId, ctx.specId, targetHandle)
  }

  addEdge(ctx.edges, ctx.counters, nodeId, ctx.specId, targetHandle)

  if (targetHandle === "applicability") {
    ctx.incrementApplicability()
  } else if ("incrementRequirements" in ctx) {
    ctx.incrementRequirements()
  }
}

function parseValueNode(node: any): { simpleValue?: string; restriction?: RestrictionNodeData } {
  if (!node) {
    return {}
  }

  if (typeof node === "string") {
    return { simpleValue: node }
  }

  if (typeof node === "number" || typeof node === "boolean") {
    return { simpleValue: String(node) }
  }

  const simple = node.simpleValue ?? node.SimpleValue
  if (simple !== undefined) {
    if (Array.isArray(simple)) {
      const values = simple
        .map(value => getSimpleValue(value))
        .filter((value): value is string => !!value)
      if (values.length > 1) {
        return {
          restriction: {
            restrictionType: "enumeration",
            values,
          },
        }
      }
      if (values.length === 1) {
        return { simpleValue: values[0] }
      }
    } else {
      const value = getSimpleValue(simple)
      if (value !== undefined) {
        return { simpleValue: value }
      }
    }
  }

  const restriction = node.restriction ?? node.Restriction
  if (restriction) {
    const parsedRestriction = parseRestriction(restriction)
    if (parsedRestriction) {
      return { restriction: parsedRestriction }
    }
  }

  // Some IDS files use ids:value>ids:simpleValue entries without wrapper object
  const values = toArray(node)
    .map(value => getSimpleValue(value))
    .filter((value): value is string => !!value)

  if (values.length > 1) {
    return {
      restriction: {
        restrictionType: "enumeration",
        values,
      },
    }
  }

  if (values.length === 1) {
    return { simpleValue: values[0] }
  }

  return {}
}

function parseRestriction(restriction: any): RestrictionNodeData | null {
  if (!restriction) return null

  const enumerations = toArray(restriction.enumeration).map((entry: any) => {
    if (entry?.value !== undefined) {
      return String(entry.value)
    }
    return getSimpleValue(entry)
  }).filter((value): value is string => !!value)

  if (enumerations.length > 0) {
    return {
      restrictionType: "enumeration",
      values: Array.from(new Set(enumerations)),
    }
  }

  const pattern = restriction.pattern?.value ?? getSimpleValue(restriction.pattern)
  if (pattern) {
    return {
      restrictionType: "pattern",
      pattern,
    }
  }

  const minValue = restriction.minInclusive?.value ?? getSimpleValue(restriction.minInclusive)
  const maxValue = restriction.maxInclusive?.value ?? getSimpleValue(restriction.maxInclusive)
  if (minValue || maxValue) {
    return {
      restrictionType: "bounds",
      minValue: minValue || undefined,
      maxValue: maxValue || undefined,
    }
  }

  const minLength = restriction.minLength?.value ?? getSimpleValue(restriction.minLength)
  const maxLength = restriction.maxLength?.value ?? getSimpleValue(restriction.maxLength)
  if (minLength || maxLength) {
    return {
      restrictionType: "length",
      minLength: minLength || undefined,
      maxLength: maxLength || undefined,
    }
  }

  return null
}

function getLayoutConfig(ctx: ApplicabilityContext | RequirementsContext): LayoutConfig {
  return {
    ...DEFAULT_LAYOUT_CONFIG,
    specPosition: ctx.specPosition,
    baseX: DEFAULT_LAYOUT_CONFIG.baseX,
    baseY: ctx.baseY,
  }
}

function extractDataType(property: any): string {
  const dataType = getSimpleValue(property?.dataType)
    || getSimpleValue(property?.datatype)

  return dataType ? dataType.toUpperCase() : ""
}

function calculateRestrictionPosition(facetPosition: { x: number; y: number }, specPosition: { x: number; y: number }) {
  return {
    x: (facetPosition.x + specPosition.x) / 2,
    y: facetPosition.y,
  }
}

function createNodeId(counters: IdCounters, type: keyof IdCounters & string): string {
  counters[type] += 1
  return `${type}-${counters[type]}`
}

function addEdge(edges: GraphEdge[], counters: IdCounters, source: string, target: string, targetHandle: "applicability" | "requirements") {
  counters.edge += 1
  edges.push({
    id: `edge-${counters.edge}`,
    source,
    target,
    targetHandle,
  })
}

function addSimpleEdge(edges: GraphEdge[], counters: IdCounters, source: string, target: string) {
  counters.edge += 1
  edges.push({
    id: `edge-${counters.edge}`,
    source,
    target,
  })
}

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

function getSimpleValue(node: any): string | undefined {
  if (node === undefined || node === null) {
    return undefined
  }

  if (typeof node === "string") {
    return node
  }

  if (typeof node === "number" || typeof node === "boolean") {
    return String(node)
  }

  if (Array.isArray(node)) {
    const first = node.find(value => value !== undefined && value !== null)
    return first !== undefined ? getSimpleValue(first) : undefined
  }

  if (typeof node === "object") {
    if (node.simpleValue !== undefined) {
      return getSimpleValue(node.simpleValue)
    }
    if (node.value !== undefined && (typeof node.value === "string" || typeof node.value === "number" || typeof node.value === "boolean")) {
      return String(node.value)
    }
    if (node.text !== undefined) {
      return getSimpleValue(node.text)
    }
  }

  return undefined
}
