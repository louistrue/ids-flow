import type { Node, Edge } from "@xyflow/react"

export interface SpecTemplate {
  id: string
  name: string
  description: string
  category: string
  nodes: Omit<Node, "id">[]
  edges: Omit<Edge, "id" | "source" | "target">[]
}

export const SPEC_TEMPLATES: SpecTemplate[] = [
  {
    id: "walls-fire-rating",
    name: "Walls need FireRating",
    description: "Fire rating requirements for all walls",
    category: "Safety",
    nodes: [
      {
        type: "spec",
        position: { x: 400, y: 100 },
        data: {
          name: "Walls-FireRating",
          ifcVersion: "IFC4X3_ADD2",
          description: "All walls must have a fire rating specified",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCWALL",
          predefinedType: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 220 },
        data: {
          propertySet: "Pset_WallCommon",
          baseName: "FireRating",
          dataType: "IFCLABEL",
          value: "",
        },
      },
    ],
    edges: [{ targetHandle: "applicability" }, { targetHandle: "requirements" }],
  },
  {
    id: "columns-material",
    name: "Columns material set",
    description: "Material requirements for structural columns",
    category: "Structure",
    nodes: [
      {
        type: "spec",
        position: { x: 400, y: 100 },
        data: {
          name: "Columns-Material",
          ifcVersion: "IFC4X3_ADD2",
          description: "All structural columns must have material specified",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCCOLUMN",
          predefinedType: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 220 },
        data: {
          propertySet: "Pset_ColumnCommon",
          baseName: "LoadBearing",
          dataType: "IFCBOOLEAN",
          value: "true",
        },
      },
    ],
    edges: [{ targetHandle: "applicability" }, { targetHandle: "applicability" }],
  },
  {
    id: "spaces-min-area",
    name: "Spaces minimum area",
    description: "Minimum area requirements for spaces",
    category: "Space",
    nodes: [
      {
        type: "spec",
        position: { x: 400, y: 100 },
        data: {
          name: "Spaces-MinArea",
          ifcVersion: "IFC4X3_ADD2",
          description: "Spaces must meet minimum area requirements",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCSPACE",
          predefinedType: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 220 },
        data: {
          propertySet: "Pset_SpaceCommon",
          baseName: "NetPlannedArea",
          dataType: "IFCAREAMEASURE",
          value: "",
        },
      },
    ],
    edges: [{ targetHandle: "applicability" }, { targetHandle: "requirements" }],
  },
  {
    id: "external-walls-thermal",
    name: "External walls thermal",
    description: "Thermal transmittance for external walls",
    category: "Energy",
    nodes: [
      {
        type: "spec",
        position: { x: 450, y: 150 },
        data: {
          name: "ExternalWalls-Thermal",
          ifcVersion: "IFC4X3_ADD2",
          description: "External walls must meet thermal performance requirements",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCWALL",
          predefinedType: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 220 },
        data: {
          propertySet: "Pset_WallCommon",
          baseName: "IsExternal",
          dataType: "IFCBOOLEAN",
          value: "true",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_WallCommon",
          baseName: "ThermalTransmittance",
          dataType: "IFCREAL",
          value: "",
        },
      },
    ],
    edges: [{ targetHandle: "applicability" }, { targetHandle: "applicability" }, { targetHandle: "requirements" }],
  },
  {
    id: "doors-fire-exit",
    name: "Fire exit doors",
    description: "Requirements for fire exit doors",
    category: "Safety",
    nodes: [
      {
        type: "spec",
        position: { x: 450, y: 150 },
        data: {
          name: "Doors-FireExit",
          ifcVersion: "IFC4X3_ADD2",
          description: "Fire exit doors must meet safety requirements",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCDOOR",
          predefinedType: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 220 },
        data: {
          propertySet: "Pset_DoorCommon",
          baseName: "FireExit",
          dataType: "IFCBOOLEAN",
          value: "true",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_DoorCommon",
          baseName: "FireRating",
          dataType: "IFCLABEL",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 460 },
        data: {
          propertySet: "Pset_DoorCommon",
          baseName: "SelfClosing",
          dataType: "IFCBOOLEAN",
          value: "",
        },
      },
    ],
    edges: [
      { targetHandle: "applicability" },
      { targetHandle: "applicability" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
    ],
  },
  {
    id: "load-bearing-beams",
    name: "Load bearing beams",
    description: "Requirements for load bearing beams",
    category: "Structure",
    nodes: [
      {
        type: "spec",
        position: { x: 400, y: 150 },
        data: {
          name: "Beams-LoadBearing",
          ifcVersion: "IFC4X3_ADD2",
          description: "Load bearing beams must have fire rating",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCBEAM",
          predefinedType: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 220 },
        data: {
          propertySet: "Pset_BeamCommon",
          baseName: "LoadBearing",
          dataType: "IFCBOOLEAN",
          value: "true",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_BeamCommon",
          baseName: "FireRating",
          dataType: "IFCLABEL",
          value: "",
        },
      },
    ],
    edges: [{ targetHandle: "applicability" }, { targetHandle: "applicability" }, { targetHandle: "requirements" }],
  },
  {
    id: "doors-naming-convention",
    name: "Doors naming convention",
    description: "Doors must follow naming convention",
    category: "Naming",
    nodes: [
      {
        type: "spec",
        position: { x: 400, y: 100 },
        data: {
          name: "Doors-Naming",
          ifcVersion: "IFC4X3_ADD2",
          description: "All doors must follow naming convention",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCDOOR",
          predefinedType: "",
        },
      },
      {
        type: "attribute",
        position: { x: 100, y: 220 },
        data: {
          name: "Name",
          value: "",
        },
      },
    ],
    edges: [{ targetHandle: "applicability" }, { targetHandle: "requirements" }],
  },
  {
    id: "walls-classification",
    name: "Walls classification",
    description: "Walls must have Uniclass classification",
    category: "Classification",
    nodes: [
      {
        type: "spec",
        position: { x: 400, y: 100 },
        data: {
          name: "Walls-Classification",
          ifcVersion: "IFC4X3_ADD2",
          description: "All walls must have proper classification",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCWALL",
          predefinedType: "",
        },
      },
      {
        type: "classification",
        position: { x: 100, y: 220 },
        data: {
          system: "Uniclass 2015",
          value: "Pr_20_70_05_05",
          uri: "",
        },
      },
    ],
    edges: [{ targetHandle: "applicability" }, { targetHandle: "requirements" }],
  },
  {
    id: "structural-steel-material",
    name: "Structural steel material",
    description: "Structural elements must be steel",
    category: "Material",
    nodes: [
      {
        type: "spec",
        position: { x: 400, y: 100 },
        data: {
          name: "Structural-Steel",
          ifcVersion: "IFC4X3_ADD2",
          description: "Structural elements must use steel material",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCBEAM",
          predefinedType: "",
        },
      },
      {
        type: "material",
        position: { x: 100, y: 220 },
        data: {
          value: "steel",
          uri: "",
        },
      },
    ],
    edges: [{ targetHandle: "applicability" }, { targetHandle: "requirements" }],
  },
  {
    id: "equipment-in-spaces",
    name: "Equipment in spaces",
    description: "Equipment must be contained in spaces",
    category: "Spatial",
    nodes: [
      {
        type: "spec",
        position: { x: 400, y: 100 },
        data: {
          name: "Equipment-Spatial",
          ifcVersion: "IFC4X3_ADD2",
          description: "Equipment must be properly contained in spaces",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCFLOWTERMINAL",
          predefinedType: "",
        },
      },
      {
        type: "partOf",
        position: { x: 100, y: 220 },
        data: {
          entity: "IFCSPACE",
          relation: "IFCRELCONTAINEDINSPATIALSTRUCTURE",
        },
      },
    ],
    edges: [{ targetHandle: "applicability" }, { targetHandle: "requirements" }],
  },
  {
    id: "fire-rating-enumeration",
    name: "Fire rating enumeration",
    description: "Fire ratings must be from approved list",
    category: "Restriction",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 100 },
        data: {
          name: "FireRating-Enumeration",
          ifcVersion: "IFC4X3_ADD2",
          description: "Fire ratings must be from approved enumeration",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCWALL",
          predefinedType: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 220 },
        data: {
          propertySet: "Pset_WallCommon",
          baseName: "FireRating",
          dataType: "IFCLABEL",
          value: "",
        },
      },
      {
        type: "restriction",
        position: { x: 300, y: 220 },
        data: {
          restrictionType: "enumeration",
          values: ["REI30", "REI60", "REI90", "REI120"],
        },
      },
    ],
    edges: [
      { targetHandle: "applicability" },
      { targetHandle: "requirements" },
      { source: "property", target: "restriction" },
      { source: "restriction", target: "spec" },
    ],
  },
]

export function getTemplatesByCategory(category?: string): SpecTemplate[] {
  if (!category) return SPEC_TEMPLATES
  return SPEC_TEMPLATES.filter((t) => t.category === category)
}

export function getTemplateCategories(): string[] {
  return Array.from(new Set(SPEC_TEMPLATES.map((t) => t.category)))
}
