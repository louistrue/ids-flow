import { create } from "xmlbuilder2"
import type { GraphNode, GraphEdge } from "./graph-types"

export interface ConvertOptions {
  pretty?: boolean
  author?: string
  date?: string
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

  // Build info section from first spec node
  const firstSpec = specNodes[0]
  buildIdsInfo(root, firstSpec, options)

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

function buildIdsInfo(root: any, specNode: GraphNode, options: ConvertOptions) {
  const info = root.ele("ids:info")

  const specData = specNode.data as any
  if (specData.name) {
    info.ele("ids:title").txt(specData.name)
  }

  if (specData.description) {
    info.ele("ids:description").txt(specData.description)
  }

  // Normalize author to email format
  const author = options.author || specData.author || "idsedit"
  const cleanAuthor = author.replace(/\s+/g, '').toLowerCase()
  const authorEmail = cleanAuthor.includes('@') ? cleanAuthor : `${cleanAuthor}@idsedit.com`
  info.ele("ids:author").txt(authorEmail)

  // Use provided date or current date
  const date = options.date || new Date().toISOString().split('T')[0]
  info.ele("ids:date").txt(date)
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

  const spec = parent.ele("ids:specification", {
    name: specData.name || "Generated Specification",
    ifcVersion: specData.ifcVersion || "IFC4X3_ADD2",
    description: specData.description || "Generated from IDS Flow",
  })

  // Build applicability section - either with facets or empty (if originally empty)
  if (applicabilityNodes.length > 0) {
    const appl = spec.ele("ids:applicability")

    // Find entity nodes in applicability
    const entityNodes = applicabilityNodes.filter(node => node.type === 'entity')
    if (entityNodes.length > 0) {
      // Use first entity as primary entity
      buildEntityFacet(entityNodes[0], appl)
    }

    // Add other applicability facets
    for (const node of applicabilityNodes) {
      switch (node.type) {
        case 'partOf':
          buildPartOfFacet(node, appl)
          break
        case 'classification':
          buildClassificationFacet(node, appl, undefined, edges, nodes)
          break
        case 'material':
          buildMaterialFacet(node, appl, undefined, edges, nodes)
          break
        case 'property':
          // Properties in applicability are treated as conditions
          buildPropertyFacet(node, appl, undefined, edges, nodes)
          break
        case 'attribute':
          // Attributes in applicability are treated as conditions
          buildAttributeFacet(node, appl, undefined, edges, nodes)
          break
      }
    }
  } else if (specData.hasEmptyApplicability) {
    // Preserve empty applicability section with attributes (wildcard pattern)
    const applAttrs: any = {}
    if (specData.applicabilityMinOccurs) {
      applAttrs.minOccurs = specData.applicabilityMinOccurs
    }
    if (specData.applicabilityMaxOccurs) {
      applAttrs.maxOccurs = specData.applicabilityMaxOccurs
    }
    spec.ele("ids:applicability", applAttrs)
  }

  // Build requirements section
  const reqs = spec.ele("ids:requirements")

  for (const node of requirementNodes) {
    switch (node.type) {
      case 'property':
        buildPropertyFacet(node, reqs, "required", edges, nodes)
        break
      case 'attribute':
        buildAttributeFacet(node, reqs, "required", edges, nodes)
        break
      case 'classification':
        buildClassificationFacet(node, reqs, "required", edges, nodes)
        break
      case 'material':
        buildMaterialFacet(node, reqs, "required", edges, nodes)
        break
      case 'partOf':
        buildPartOfFacet(node, reqs, "required")
        break
    }
  }
}

// Helper function to create ids:simpleValue elements
function idsSimple(parent: any, tag: string, text: string) {
  parent.ele(tag).ele("ids:simpleValue").txt(text)
}

// Facet converter functions
function buildEntityFacet(node: GraphNode, parent: any) {
  const entity = parent.ele("ids:entity")
  const data = node.data as any
  idsSimple(entity, "ids:name", data.name.toUpperCase())
  if (data.predefinedType) {
    idsSimple(entity, "ids:predefinedType", data.predefinedType)
  }
}

function buildPropertyFacet(node: GraphNode, parent: any, cardinality?: string, edges?: GraphEdge[], nodes?: GraphNode[]) {
  const data = node.data as any
  const attrs: any = {}
  
  // Only include dataType if it exists (optional per IDS spec)
  if (data.dataType) {
    attrs.dataType = data.dataType
  }
  
  if (cardinality) {
    attrs.cardinality = cardinality
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

function buildAttributeFacet(node: GraphNode, parent: any, cardinality?: string, edges?: GraphEdge[], nodes?: GraphNode[]) {
  const data = node.data as any
  const attrs: any = {}
  if (cardinality) {
    attrs.cardinality = cardinality
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

function buildClassificationFacet(node: GraphNode, parent: any, cardinality?: string, edges?: GraphEdge[], nodes?: GraphNode[]) {
  const data = node.data as any
  const attrs: any = {}
  if (cardinality) {
    attrs.cardinality = cardinality
  }
  if (data.uri) {
    attrs.uri = data.uri
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

function buildMaterialFacet(node: GraphNode, parent: any, cardinality?: string, edges?: GraphEdge[], nodes?: GraphNode[]) {
  const data = node.data as any
  const attrs: any = {}
  if (cardinality) {
    attrs.cardinality = cardinality
  }
  if (data.uri) {
    attrs.uri = data.uri
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

function buildPartOfFacet(node: GraphNode, parent: any, cardinality?: string) {
  const data = node.data as any
  const attrs: any = {}
  if (cardinality) {
    attrs.cardinality = cardinality
  }
  if (data.relation) {
    attrs.relation = data.relation
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
