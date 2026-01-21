import { create } from "xmlbuilder2"
import type { GraphNode, GraphEdge, Cardinality, IdsMetadata } from "./graph-types"

export interface ConvertOptions {
  pretty?: boolean
  metadata?: IdsMetadata  // IDS file-level metadata
  author?: string         // Deprecated - use metadata.author
  date?: string           // Deprecated - use metadata.date
}

// Helper function to convert cardinality to minOccurs/maxOccurs
function occursFromCardinality(cardinality?: Cardinality): { minOccurs?: string; maxOccurs?: string } {
  if (!cardinality || cardinality === "required") {
    return { minOccurs: "1", maxOccurs: "unbounded" }
  }

  if (cardinality === "optional") {
    return { minOccurs: "0", maxOccurs: "unbounded" }
  }

  if (cardinality === "prohibited") {
    return { minOccurs: "0", maxOccurs: "0" }
  }

  // Default to required
  return { minOccurs: "1", maxOccurs: "unbounded" }
}

export function convertGraphToIdsXml(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: ConvertOptions = {}
): string {
  if (!nodes || nodes.length === 0) {
    throw new Error("No nodes provided for conversion")
  }

  // Find all specification nodes
  const specNodes = nodes.filter(node => node.type === 'spec')
  if (specNodes.length === 0) {
    throw new Error("No specification nodes found")
  }

  // Create root XML element
  const root = create({ version: "1.0", encoding: "UTF-8" }).ele("ids:ids", {
    "xmlns:ids": "http://standards.buildingsmart.org/IDS",
    "xmlns:xs": "http://www.w3.org/2001/XMLSchema",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "xsi:schemaLocation": "http://standards.buildingsmart.org/IDS http://standards.buildingsmart.org/IDS/1.0/ids.xsd",
  })

  // Build info section from metadata or fallback to first spec node
  const firstSpec = specNodes[0]
  buildIdsInfo(root, options, firstSpec)

  // Build specifications section
  const specs = root.ele("ids:specifications")

  for (const specNode of specNodes) {
    const { applicabilityNodes, requirementNodes } = groupNodesBySpecification(nodes, edges, specNode)
    buildSpecification(specs, specNode, applicabilityNodes, requirementNodes, edges, nodes)
  }

  return root.end({ prettyPrint: options.pretty ?? true })
}

function groupNodesBySpecification(
  nodes: GraphNode[],
  edges: GraphEdge[],
  specNode: GraphNode
): { applicabilityNodes: GraphNode[]; requirementNodes: GraphNode[] } {
  // Find nodes connected to this spec's applicability handle
  const applicabilityEdges = edges.filter(
    edge => edge.target === specNode.id && edge.targetHandle === 'applicability'
  )
  const applicabilityNodes = applicabilityEdges
    .map(edge => nodes.find(node => node.id === edge.source))
    .filter((node): node is GraphNode => node !== undefined)

  // Find nodes connected to this spec's requirements handle
  // Follow restriction chains: facet -> restriction -> spec
  const requirementEdges = edges.filter(
    edge => edge.target === specNode.id && edge.targetHandle === 'requirements'
  )
  const requirementNodes = requirementEdges
    .map(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source)
      if (!sourceNode) return null

      // If this is a restriction node, find the facet it's connected to
      if (sourceNode.type === 'restriction') {
        const facetEdge = edges.find(e => e.target === sourceNode.id)
        if (facetEdge) {
          const facetNode = nodes.find(node => node.id === facetEdge.source)
          return facetNode || null
        }
      }

      return sourceNode
    })
    .filter((node): node is GraphNode => node !== undefined)
    // Deduplicate by node ID to avoid duplicates from both direct and restriction edges
    .filter((node, index, self) => self.findIndex(n => n.id === node.id) === index)

  return { applicabilityNodes, requirementNodes }
}

function buildIdsInfo(root: any, options: ConvertOptions, fallbackSpec: GraphNode) {
  const info = root.ele("ids:info")
  const metadata = options.metadata
  const specData = fallbackSpec.data as any

  // Title (required) - use metadata, then spec name, then default
  const title = metadata?.title || specData.name || "Untitled IDS"
  info.ele("ids:title").txt(title)

  // Optional metadata fields
  if (metadata?.copyright) {
    info.ele("ids:copyright").txt(metadata.copyright)
  }

  if (metadata?.version) {
    info.ele("ids:version").txt(metadata.version)
  }

  if (metadata?.description || specData.description) {
    info.ele("ids:description").txt(metadata?.description || specData.description)
  }

  // Author (optional - only include if provided, must be valid email format per XSD pattern: [^@]+@[^\.]+\..+)
  const author = metadata?.author || options.author
  if (author) {
    const cleanAuthor = author.replace(/\s+/g, '').toLowerCase()
    // Ensure valid email format - if no @, add @idsedit.com; if invalid format, skip
    let authorEmail: string
    if (cleanAuthor.includes('@')) {
      // Validate email pattern: [^@]+@[^\.]+\..+
      const emailPattern = /^[^@]+@[^\.]+\..+$/
      if (emailPattern.test(cleanAuthor)) {
        authorEmail = cleanAuthor
        info.ele("ids:author").txt(authorEmail)
      }
      // If invalid format, skip author element (optional field)
    } else {
      // No @ found, append @idsedit.com
      authorEmail = `${cleanAuthor}@idsedit.com`
      info.ele("ids:author").txt(authorEmail)
    }
  }

  // Date (optional - only include if provided)
  const date = metadata?.date || options.date
  if (date) {
    info.ele("ids:date").txt(date)
  }

  // Purpose and milestone
  if (metadata?.purpose) {
    info.ele("ids:purpose").txt(metadata.purpose)
  }

  if (metadata?.milestone) {
    info.ele("ids:milestone").txt(metadata.milestone)
  }
}

function buildSpecification(
  parent: any,
  specNode: GraphNode,
  applicabilityNodes: GraphNode[],
  requirementNodes: GraphNode[],
  edges: GraphEdge[],
  nodes: GraphNode[]
) {
  const specData = specNode.data as any

  // Build specification attributes
  const specAttrs: any = {
    name: specData.name || "Generated Specification",
    ifcVersion: specData.ifcVersion || "IFC4X3_ADD2",
  }

  // Optional attributes
  if (specData.description) {
    specAttrs.description = specData.description
  }
  if (specData.identifier) {
    specAttrs.identifier = specData.identifier
  }
  if (specData.instructions) {
    specAttrs.instructions = specData.instructions
  }

  const spec = parent.ele("ids:specification", specAttrs)

  // Build applicability section - either with facets or empty (if originally empty)
  if (applicabilityNodes.length > 0) {
    const appl = spec.ele("ids:applicability")

    // XSD Required Order: entity → partOf → classification → attribute → property → material
    // Sort nodes by type to ensure correct order
    const typeOrder: Record<string, number> = {
      'entity': 1,
      'partOf': 2,
      'classification': 3,
      'attribute': 4,
      'property': 5,
      'material': 6
    }

    const sortedNodes = [...applicabilityNodes].sort((a, b) => {
      const orderA = typeOrder[a.type] || 99
      const orderB = typeOrder[b.type] || 99
      return orderA - orderB
    })

    // Build facets in correct order
    for (const node of sortedNodes) {
      switch (node.type) {
        case 'entity':
          buildEntityFacet(node, appl)
          break
        case 'partOf':
          buildPartOfFacet(node, appl)
          break
        case 'classification':
          buildClassificationFacet(node, appl, undefined, undefined, edges, nodes)
          break
        case 'attribute':
          // Attributes in applicability are treated as conditions
          buildAttributeFacet(node, appl, undefined, undefined, edges, nodes)
          break
        case 'property':
          // Properties in applicability are treated as conditions
          buildPropertyFacet(node, appl, undefined, undefined, edges, nodes)
          break
        case 'material':
          buildMaterialFacet(node, appl, undefined, undefined, edges, nodes)
          break
      }
    }
  } else if (specData.hasEmptyApplicability) {
    // Preserve empty applicability section with attributes (wildcard pattern)
    const applAttrs: any = {}

    // Use applicabilityCardinality if available, otherwise fall back to old minOccurs/maxOccurs
    if (specData.applicabilityCardinality) {
      const occurs = occursFromCardinality(specData.applicabilityCardinality as Cardinality)
      if (occurs.minOccurs) applAttrs.minOccurs = occurs.minOccurs
      if (occurs.maxOccurs) applAttrs.maxOccurs = occurs.maxOccurs
    } else {
      if (specData.applicabilityMinOccurs) {
        applAttrs.minOccurs = specData.applicabilityMinOccurs
      }
      if (specData.applicabilityMaxOccurs) {
        applAttrs.maxOccurs = specData.applicabilityMaxOccurs
      }
    }
    spec.ele("ids:applicability", applAttrs)
  }

  // Build requirements section
  const reqsAttrs: any = {}
  if (specData.requirementsDescription) {
    reqsAttrs.description = specData.requirementsDescription
  }
  const reqs = spec.ele("ids:requirements", reqsAttrs)

  for (const node of requirementNodes) {
    // Get cardinality and instructions from node data
    const nodeData = node.data as any
    const nodeCardinality = nodeData.cardinality || "required"
    const nodeInstructions = nodeData.instructions

    switch (node.type) {
      case 'entity':
        buildEntityFacet(node, reqs, nodeCardinality, nodeInstructions)
        break
      case 'property':
        buildPropertyFacet(node, reqs, nodeCardinality, nodeInstructions, edges, nodes)
        break
      case 'attribute':
        buildAttributeFacet(node, reqs, nodeCardinality, nodeInstructions, edges, nodes)
        break
      case 'classification':
        buildClassificationFacet(node, reqs, nodeCardinality, nodeInstructions, edges, nodes)
        break
      case 'material':
        buildMaterialFacet(node, reqs, nodeCardinality, nodeInstructions, edges, nodes)
        break
      case 'partOf':
        buildPartOfFacet(node, reqs, nodeCardinality, nodeInstructions)
        break
    }
  }
}

// Helper function to create ids:simpleValue elements
function idsSimple(parent: any, tag: string, text: string) {
  parent.ele(tag).ele("ids:simpleValue").txt(text)
}

// Facet converter functions
function buildEntityFacet(node: GraphNode, parent: any, cardinality?: string, instructions?: string) {
  const data = node.data as any
  const attrs: any = {}

  // Instructions attribute for requirement entities (optional)
  if (instructions) {
    attrs.instructions = instructions
  }

  const entity = parent.ele("ids:entity", attrs)
  idsSimple(entity, "ids:name", data.name.toUpperCase())
  if (data.predefinedType) {
    idsSimple(entity, "ids:predefinedType", data.predefinedType)
  }
}

function buildPropertyFacet(node: GraphNode, parent: any, cardinality?: string, instructions?: string, edges?: GraphEdge[], nodes?: GraphNode[]) {
  const data = node.data as any
  const attrs: any = {}

  // Only include dataType if it exists (optional per IDS spec)
  if (data.dataType) {
    attrs.dataType = data.dataType
  }

  if (cardinality) {
    attrs.cardinality = cardinality
  }

  // URI attribute for requirement properties (optional)
  if (data.uri) {
    attrs.uri = data.uri
  }

  // Instructions attribute for requirement properties (optional)
  if (instructions || data.instructions) {
    attrs.instructions = instructions || data.instructions
  }

  const prop = parent.ele("ids:property", attrs)
  idsSimple(prop, "ids:propertySet", data.propertySet)
  idsSimple(prop, "ids:baseName", data.baseName)

  // Handle restrictions by checking for connected restriction nodes
  if (edges && nodes) {
    const restrictionEdge = edges.find(e => e.source === node.id)
    if (restrictionEdge) {
      const restrictionNode = nodes.find(n => n.id === restrictionEdge.target)
      if (restrictionNode && restrictionNode.type === 'restriction') {
        // Create value element with restriction
        const valueElement = prop.ele("ids:value")
        buildValueRestriction(valueElement, restrictionNode)
      } else if (data.value) {
        // Simple value constraint
        idsSimple(prop, "ids:value", data.value)
      }
    } else if (data.value) {
      // Simple value constraint
      idsSimple(prop, "ids:value", data.value)
    }
  } else if (data.value) {
    // Simple value constraint
    idsSimple(prop, "ids:value", data.value)
  }
}

function buildAttributeFacet(node: GraphNode, parent: any, cardinality?: string, instructions?: string, edges?: GraphEdge[], nodes?: GraphNode[]) {
  const data = node.data as any
  const attrs: any = {}
  if (cardinality) {
    attrs.cardinality = cardinality
  }

  // Instructions attribute for requirement attributes (optional)
  if (instructions || data.instructions) {
    attrs.instructions = instructions || data.instructions
  }

  const attr = parent.ele("ids:attribute", attrs)
  idsSimple(attr, "ids:name", data.name)

  // Handle restrictions by checking for connected restriction nodes
  if (edges && nodes) {
    const restrictionEdge = edges.find(e => e.source === node.id)
    if (restrictionEdge) {
      const restrictionNode = nodes.find(n => n.id === restrictionEdge.target)
      if (restrictionNode && restrictionNode.type === 'restriction') {
        // Create value element with restriction
        const valueElement = attr.ele("ids:value")
        buildValueRestriction(valueElement, restrictionNode)
      } else if (data.value) {
        // Simple value constraint
        idsSimple(attr, "ids:value", data.value)
      }
    } else if (data.value) {
      // Simple value constraint
      idsSimple(attr, "ids:value", data.value)
    }
  } else if (data.value) {
    // Simple value constraint
    idsSimple(attr, "ids:value", data.value)
  }
}

function buildClassificationFacet(node: GraphNode, parent: any, cardinality?: string, instructions?: string, edges?: GraphEdge[], nodes?: GraphNode[]) {
  const data = node.data as any
  const attrs: any = {}
  if (cardinality) {
    attrs.cardinality = cardinality
  }
  if (data.uri) {
    attrs.uri = data.uri
  }

  // Instructions attribute for requirement classifications (optional)
  if (instructions || data.instructions) {
    attrs.instructions = instructions || data.instructions
  }

  const cls = parent.ele("ids:classification", attrs)

  // Per IDS XSD schema, 'value' must come before 'system'
  // Handle restrictions by checking for connected restriction nodes
  if (edges && nodes) {
    const restrictionEdge = edges.find(e => e.source === node.id)
    if (restrictionEdge) {
      const restrictionNode = nodes.find(n => n.id === restrictionEdge.target)
      if (restrictionNode && restrictionNode.type === 'restriction') {
        // Create value element with restriction
        const valueElement = cls.ele("ids:value")
        buildValueRestriction(valueElement, restrictionNode)
      } else if (data.value) {
        // Simple value constraint
        idsSimple(cls, "ids:value", data.value)
      }
    } else if (data.value) {
      // Simple value constraint
      idsSimple(cls, "ids:value", data.value)
    }
  } else if (data.value) {
    // Simple value constraint
    idsSimple(cls, "ids:value", data.value)
  }

  // System must come after value per IDS XSD schema
  idsSimple(cls, "ids:system", data.system)
}

function buildMaterialFacet(node: GraphNode, parent: any, cardinality?: string, instructions?: string, edges?: GraphEdge[], nodes?: GraphNode[]) {
  const data = node.data as any
  const attrs: any = {}
  if (cardinality) {
    attrs.cardinality = cardinality
  }
  if (data.uri) {
    attrs.uri = data.uri
  }

  // Instructions attribute for requirement materials (optional)
  if (instructions || data.instructions) {
    attrs.instructions = instructions || data.instructions
  }

  const mat = parent.ele("ids:material", attrs)

  // Handle restrictions by checking for connected restriction nodes
  if (edges && nodes) {
    const restrictionEdge = edges.find(e => e.source === node.id)
    if (restrictionEdge) {
      const restrictionNode = nodes.find(n => n.id === restrictionEdge.target)
      if (restrictionNode && restrictionNode.type === 'restriction') {
        // Create value element with restriction
        const valueElement = mat.ele("ids:value")
        buildValueRestriction(valueElement, restrictionNode)
      } else if (data.value) {
        // Simple value constraint
        idsSimple(mat, "ids:value", data.value)
      }
    } else if (data.value) {
      // Simple value constraint
      idsSimple(mat, "ids:value", data.value)
    }
  } else if (data.value) {
    // Simple value constraint
    idsSimple(mat, "ids:value", data.value)
  }
}

function buildPartOfFacet(node: GraphNode, parent: any, cardinality?: string, instructions?: string) {
  const data = node.data as any
  const attrs: any = {}
  if (cardinality) {
    attrs.cardinality = cardinality
  }
  if (data.relation) {
    attrs.relation = data.relation
  }

  // Instructions attribute for requirement partOf (optional)
  if (instructions || data.instructions) {
    attrs.instructions = instructions || data.instructions
  }

  const partOf = parent.ele("ids:partOf", attrs)
  const entity = partOf.ele("ids:entity")
  idsSimple(entity, "ids:name", data.entity.toUpperCase())
}

// Restriction handling (for future enhancement)
function buildValueRestriction(parent: any, restriction: GraphNode) {
  const data = restriction.data as any
  // parent is already the ids:value element, so add xs:restriction directly to it
  const r = parent.ele("xs:restriction", { base: "xs:string" })

  switch (data.restrictionType) {
    case "enumeration":
      if (data.values && data.values.length > 0) {
        // Sort for consistent output
        const sortedValues = [...data.values].sort()
        sortedValues.forEach((v: string) => {
          r.ele("xs:enumeration", { value: String(v) })
        })
      }
      break
    case "pattern":
      if (data.pattern) {
        r.ele("xs:pattern", { value: data.pattern })
      }
      break
    case "bounds":
      if (data.minValue) {
        r.ele("xs:minInclusive", { value: data.minValue })
      }
      if (data.maxValue) {
        r.ele("xs:maxInclusive", { value: data.maxValue })
      }
      break
    case "length":
      if (data.minLength) {
        r.ele("xs:minLength", { value: data.minLength })
      }
      if (data.maxLength) {
        r.ele("xs:maxLength", { value: data.maxLength })
      }
      break
  }
}
