import { XMLParser } from "fast-xml-parser"
import type { GraphNode, GraphEdge, RestrictionNodeData, Cardinality } from "./graph-types"
import { DEFAULT_LAYOUT_CONFIG, calculateNodePosition, type LayoutConfig } from "./node-layout"

// Helper function to convert minOccurs/maxOccurs to cardinality
function cardinalityFromOccurs(minOccurs?: string, maxOccurs?: string): Cardinality {
  const min = minOccurs ? parseInt(minOccurs, 10) : 1
  const max = maxOccurs === "unbounded" ? Infinity : (maxOccurs ? parseInt(maxOccurs, 10) : Infinity)

  // Required: minOccurs=1, maxOccurs=unbounded
  if (min === 1 && max === Infinity) {
    return "required"
  }

  // Optional: minOccurs=0, maxOccurs=unbounded
  if (min === 0 && max === Infinity) {
    return "optional"
  }

  // Prohibited: minOccurs=0, maxOccurs=0
  if (min === 0 && max === 0) {
    return "prohibited"
  }

  // Default to required for other values
  return "required"
}

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

  // Parse IDS-level metadata from <info> block
  const metadata: IdsMetadata | undefined = root.info ? {
    title: root.info.title || "Untitled IDS",
    copyright: root.info.copyright,
    version: root.info.version,
    description: root.info.description,
    author: root.info.author,
    date: root.info.date,
    purpose: root.info.purpose,
    milestone: root.info.milestone,
  } : undefined

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
        name: spec.name || `Specification ${specIndex + 1}`,
        ifcVersion: spec.ifcVersion || "IFC4X3_ADD2",
        description: spec.description || "",
        identifier: spec.identifier,
        instructions: spec.instructions,
      },
    }

    fallbackIfcVersion = fallbackIfcVersion ?? (specNode.data.ifcVersion as string | undefined)

    nodes.push(specNode)

    const sectionBaseY = DEFAULT_LAYOUT_CONFIG.baseY + specOffsetY
    let applicabilityCount = 0
    let requirementsCount = 0

    const applicability = spec.applicability || spec.Applicability
    if (applicability) {
      // Check if applicability section exists but is empty (has attributes but no children)
      const hasEntities = Array.isArray(applicability.entity) || applicability.entity
      const hasProperties = Array.isArray(applicability.property) || applicability.property
      const hasAttributes = Array.isArray(applicability.attribute) || applicability.attribute
      const hasClassifications = Array.isArray(applicability.classification) || applicability.classification
      const hasMaterials = Array.isArray(applicability.material) || applicability.material
      const hasPartOf = Array.isArray(applicability.partOf) || applicability.partOf

      const isEmptyApplicability = !hasEntities && !hasProperties && !hasAttributes &&
        !hasClassifications && !hasMaterials && !hasPartOf

      if (isEmptyApplicability) {
        // Store empty applicability info in spec node
        specNode.data.hasEmptyApplicability = true
        const minOccurs = applicability.minOccurs || applicability.minoccurs
        const maxOccurs = applicability.maxOccurs || applicability.maxoccurs
        specNode.data.applicabilityMinOccurs = minOccurs || undefined
        specNode.data.applicabilityMaxOccurs = maxOccurs || undefined
        // Convert to cardinality for easier UI handling
        specNode.data.applicabilityCardinality = cardinalityFromOccurs(minOccurs, maxOccurs)
      } else {
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
    metadata,
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
        dataType: extractDataType(property, property?.value),
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
  // Parse entity facets in requirements
  const entities = toArray(requirements.entity)
  entities.forEach(entity => {
    const name = getSimpleValue(entity?.name)
    const predefinedType = getSimpleValue(entity?.predefinedType)

    const position = calculateNodePosition(
      "entity",
      "requirements",
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
        name: name?.toUpperCase() || "",
        predefinedType: predefinedType || "",
        ...(entity?.cardinality ? { cardinality: entity.cardinality as Cardinality } : {}),
        ...(entity?.instructions ? { instructions: entity.instructions } : {}),
      },
    }

    ctx.nodes.push(node)
    addEdge(ctx.edges, ctx.counters, entityId, ctx.specId, "requirements")
    ctx.incrementRequirements()
  })

  const properties = toArray(requirements.property)
  properties.forEach(property => {
    createFacetWithOptionalRestriction({
      ctx,
      targetHandle: "requirements",
      type: "property",
      data: {
        propertySet: getSimpleValue(property?.propertySet) || "",
        baseName: getSimpleValue(property?.baseName) || "",
        dataType: extractDataType(property, property?.value),
      },
      valueNode: property?.value,
      cardinality: property?.cardinality,
      instructions: property?.instructions,
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
      cardinality: attribute?.cardinality,
      instructions: attribute?.instructions,
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
      cardinality: classification?.cardinality,
      instructions: classification?.instructions,
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
      cardinality: material?.cardinality,
      instructions: material?.instructions,
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
        // Store cardinality for requirement facets only if explicitly provided
        ...(partOf?.cardinality ? { cardinality: partOf.cardinality as Cardinality } : {}),
        // Store instructions for requirement facets only if explicitly provided
        ...(partOf?.instructions ? { instructions: partOf.instructions } : {}),
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
  cardinality?: string    // Cardinality attribute from XML
  instructions?: string   // Instructions attribute from XML
}

function createFacetWithOptionalRestriction(input: FacetCreationInput) {
  const {
    ctx,
    targetHandle,
    type,
    data,
    valueNode,
    cardinality,
    instructions,
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
      // Store cardinality for requirement facets only if explicitly provided
      ...(cardinality && targetHandle === "requirements" ? { cardinality: cardinality as Cardinality } : {}),
      // Store instructions for requirement facets only if explicitly provided
      ...(instructions && targetHandle === "requirements" ? { instructions } : {}),
    },
  }

  ctx.nodes.push(node)

  const valueExtraction = parseValueNode(valueNode)
  if (valueExtraction.simpleValue !== undefined && valueExtraction.simpleValue !== "") {
    ; (node.data as any).value = valueExtraction.simpleValue
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
  } else {
    // Only add direct facet → spec edge when there's no restriction
    // (restrictions already create facet → restriction → spec chain)
    addEdge(ctx.edges, ctx.counters, nodeId, ctx.specId, targetHandle)
  }

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

  const restriction = node.restriction
    ?? node.Restriction
    ?? node['xs:restriction']
    ?? node['xs:Restriction']

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

  // Handle enumeration restrictions (most common)
  // Try multiple possible enumeration paths (with/without namespace prefixes)
  const enumerationArray = toArray(restriction.enumeration
    ?? restriction.Enumeration
    ?? restriction['xs:enumeration']
    ?? restriction['xs:Enumeration'])

  if (enumerationArray.length > 0) {
    const enumerations = enumerationArray.map((entry: any) => {
      // Handle value as attribute (most common: <xs:enumeration value="VALUE" />)
      if (entry?.value !== undefined) {
        return String(entry.value).trim()
      }
      // Handle value as text content
      return getSimpleValue(entry)?.trim()
    }).filter((value): value is string => !!value && value !== "")

    if (enumerations.length > 0) {
      return {
        restrictionType: "enumeration",
        values: Array.from(new Set(enumerations)),
      }
    }
  }

  // Handle pattern restrictions
  const pattern = restriction.pattern?.value
    ?? getSimpleValue(restriction.pattern)
    ?? restriction['xs:pattern']?.value
    ?? getSimpleValue(restriction['xs:pattern'])

  if (pattern) {
    return {
      restrictionType: "pattern",
      pattern: String(pattern).trim(),
    }
  }

  // Handle bounds restrictions
  const minValue = restriction.minInclusive?.value
    ?? getSimpleValue(restriction.minInclusive)
    ?? restriction['xs:minInclusive']?.value
    ?? getSimpleValue(restriction['xs:minInclusive'])

  const maxValue = restriction.maxInclusive?.value
    ?? getSimpleValue(restriction.maxInclusive)
    ?? restriction['xs:maxInclusive']?.value
    ?? getSimpleValue(restriction['xs:maxInclusive'])

  if (minValue || maxValue) {
    return {
      restrictionType: "bounds",
      minValue: minValue ? String(minValue).trim() : undefined,
      maxValue: maxValue ? String(maxValue).trim() : undefined,
    }
  }

  // Handle length restrictions
  const minLength = restriction.minLength?.value
    ?? getSimpleValue(restriction.minLength)
    ?? restriction['xs:minLength']?.value
    ?? getSimpleValue(restriction['xs:minLength'])

  const maxLength = restriction.maxLength?.value
    ?? getSimpleValue(restriction.maxLength)
    ?? restriction['xs:maxLength']?.value
    ?? getSimpleValue(restriction['xs:maxLength'])

  if (minLength || maxLength) {
    return {
      restrictionType: "length",
      minLength: minLength ? String(minLength).trim() : undefined,
      maxLength: maxLength ? String(maxLength).trim() : undefined,
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

function extractDataType(property: any, valueNode?: any): string | undefined {
  const dataType = getSimpleValue(property?.dataType)
    || getSimpleValue(property?.datatype)

  if (dataType) {
    return dataType.toUpperCase()
  }

  // Return undefined if no dataType is explicitly specified - leaving it empty is valid per IDS spec
  // Do NOT infer dataType from restrictions - users should specify it explicitly if needed
  return undefined
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
