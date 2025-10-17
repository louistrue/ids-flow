import type { Node, Edge } from "@xyflow/react"

export interface SpecTemplate {
  id: string
  name: string
  description: string
  category: string
  nodes: Omit<Node, "id">[]
  edges: Omit<Edge, "id">[] // Allow explicit source/target definitions
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
          values: [
            "-", "E30", "E60", "E90", "E120", "E180",
            "EI30", "EI60", "EI90", "EI120", "EI180",
            "REI30", "REI60", "REI90", "REI120", "REI180", "REI240",
            "EW30", "EW60", "S", "K30", "K60"
          ],
        },
      },
    ],
    edges: [
      { source: "entity", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "restriction" },
      { source: "restriction", target: "spec", targetHandle: "requirements" },
    ],
  },
  {
    id: "door-types-enumeration",
    name: "Door types enumeration",
    description: "Door types must be from approved list",
    category: "Restriction",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 100 },
        data: {
          name: "DoorTypes-Enumeration",
          ifcVersion: "IFC4X3_ADD2",
          description: "Door types must be from approved enumeration",
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
          baseName: "DoorType",
          dataType: "IFCLABEL",
          value: "",
        },
      },
      {
        type: "restriction",
        position: { x: 300, y: 220 },
        data: {
          restrictionType: "enumeration",
          values: [
            "Single leaf", "Double leaf", "Sliding", "Folding", "Revolving",
            "Swing", "Automatic", "Manual", "Fire door", "Security door",
            "Accessible door", "Emergency exit", "Garage door", "Roller shutter",
            "Glass door", "Wooden door", "Metal door", "Composite door"
          ],
        },
      },
    ],
    edges: [
      { source: "entity", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "restriction" },
      { source: "restriction", target: "spec", targetHandle: "requirements" },
    ],
  },
  {
    id: "window-types-enumeration",
    name: "Window types enumeration",
    description: "Window types must be from approved list",
    category: "Restriction",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 100 },
        data: {
          name: "WindowTypes-Enumeration",
          ifcVersion: "IFC4X3_ADD2",
          description: "Window types must be from approved enumeration",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCWINDOW",
          predefinedType: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 220 },
        data: {
          propertySet: "Pset_WindowCommon",
          baseName: "WindowType",
          dataType: "IFCLABEL",
          value: "",
        },
      },
      {
        type: "restriction",
        position: { x: 300, y: 220 },
        data: {
          restrictionType: "enumeration",
          values: [
            "Fixed", "Casement", "Tilt and turn", "Sliding", "Pivot",
            "Awning", "Hopper", "Double hung", "Single hung", "Bay window",
            "Bow window", "Skylight", "Roof window", "French window",
            "Patio door", "Picture window", "Transom window"
          ],
        },
      },
    ],
    edges: [
      { source: "entity", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "restriction" },
      { source: "restriction", target: "spec", targetHandle: "requirements" },
    ],
  },
  {
    id: "material-types-enumeration",
    name: "Material types enumeration",
    description: "Material types must be from approved list",
    category: "Restriction",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 100 },
        data: {
          name: "MaterialTypes-Enumeration",
          ifcVersion: "IFC4X3_ADD2",
          description: "Material types must be from approved enumeration",
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
        type: "material",
        position: { x: 100, y: 220 },
        data: {
          value: "",
          uri: "",
        },
      },
      {
        type: "restriction",
        position: { x: 300, y: 220 },
        data: {
          restrictionType: "enumeration",
          values: [
            "Concrete", "Steel", "Wood", "Brick", "Stone", "Glass",
            "Aluminum", "Plastic", "Composite", "Ceramic", "Gypsum",
            "Insulation", "Masonry", "Timber", "Metal", "Fiber cement"
          ],
        },
      },
    ],
    edges: [
      { source: "entity", target: "spec", targetHandle: "applicability" },
      { source: "material", target: "restriction" },
      { source: "restriction", target: "spec", targetHandle: "requirements" },
    ],
  },
  {
    id: "space-types-enumeration",
    name: "Space types enumeration",
    description: "Space types must be from approved list",
    category: "Restriction",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 100 },
        data: {
          name: "SpaceTypes-Enumeration",
          ifcVersion: "IFC4X3_ADD2",
          description: "Space types must be from approved enumeration",
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
          baseName: "SpaceType",
          dataType: "IFCLABEL",
          value: "",
        },
      },
      {
        type: "restriction",
        position: { x: 300, y: 220 },
        data: {
          restrictionType: "enumeration",
          values: [
            "Office", "Meeting room", "Conference room", "Reception",
            "Kitchen", "Break room", "Storage", "Server room", "Toilet",
            "Corridor", "Lobby", "Atrium", "Stairwell", "Elevator shaft",
            "Mechanical room", "Electrical room", "Parking", "Loading dock"
          ],
        },
      },
    ],
    edges: [
      { source: "entity", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "restriction" },
      { source: "restriction", target: "spec", targetHandle: "requirements" },
    ],
  },
  // Complex multi-facet templates
  {
    id: "hvac-equipment-complete",
    name: "HVAC equipment complete",
    description: "Complete MEP validation for HVAC terminals with properties, naming and spatial requirements",
    category: "Energy",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 200 },
        data: {
          name: "HVAC-Complete",
          ifcVersion: "IFC4X3_ADD2",
          description: "HVAC equipment must have complete information including capacity, efficiency, naming and spatial containment",
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
        type: "attribute",
        position: { x: 100, y: 220 },
        data: {
          name: "Name",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_FlowTerminalOccurrence",
          baseName: "NominalAirFlowRate",
          dataType: "IFCVOLUMETRICFLOWRATEMEASURE",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 460 },
        data: {
          propertySet: "Pset_FlowTerminalOccurrence",
          baseName: "NominalHeatingCapacity",
          dataType: "IFCPOWERMEASURE",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 580 },
        data: {
          propertySet: "Pset_FlowTerminalOccurrence",
          baseName: "NominalCoolingCapacity",
          dataType: "IFCPOWERMEASURE",
          value: "",
        },
      },
      {
        type: "partOf",
        position: { x: 100, y: 700 },
        data: {
          entity: "IFCSPACE",
          relation: "IFCRELCONTAINEDINSPATIALSTRUCTURE",
        },
      },
    ],
    edges: [
      { targetHandle: "applicability" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
    ],
  },
  {
    id: "structural-analysis-ready",
    name: "Structural analysis ready",
    description: "Structural elements ready for analysis with material, load bearing status and geometric properties",
    category: "Structure",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 200 },
        data: {
          name: "Structural-AnalysisReady",
          ifcVersion: "IFC4X3_ADD2",
          description: "Structural elements must have complete information for structural analysis",
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
      {
        type: "material",
        position: { x: 100, y: 340 },
        data: {
          value: "",
          uri: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 460 },
        data: {
          propertySet: "Pset_ColumnCommon",
          baseName: "Reference",
          dataType: "IFCIDENTIFIER",
          value: "",
        },
      },
      {
        type: "classification",
        position: { x: 100, y: 580 },
        data: {
          system: "Uniclass 2015",
          value: "",
          uri: "",
        },
      },
    ],
    edges: [
      { targetHandle: "applicability" },
      { targetHandle: "applicability" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
    ],
  },
  {
    id: "accessible-doors-complete",
    name: "Accessible doors complete",
    description: "Accessibility requirements for doors including width, opening force, and hardware",
    category: "Safety",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 200 },
        data: {
          name: "Doors-Accessibility",
          ifcVersion: "IFC4X3_ADD2",
          description: "Accessible doors must meet width, force, and hardware requirements",
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
          baseName: "IsExternal",
          dataType: "IFCBOOLEAN",
          value: "false",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_DoorCommon",
          baseName: "HandicapAccessible",
          dataType: "IFCBOOLEAN",
          value: "true",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 460 },
        data: {
          propertySet: "Pset_DoorCommon",
          baseName: "OverallWidth",
          dataType: "IFCPOSITIVELENGHTMEASURE",
          value: "",
        },
      },
      {
        type: "restriction",
        position: { x: 300, y: 460 },
        data: {
          restrictionType: "bounds",
          minValue: "900",
          maxValue: "",
        },
      },
    ],
    edges: [
      { source: "entity", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "restriction" },
      { source: "restriction", target: "spec", targetHandle: "requirements" },
    ],
  },
  {
    id: "acoustic-walls-complete",
    name: "Acoustic walls complete",
    description: "Acoustic performance requirements for walls including sound reduction index",
    category: "Safety",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 200 },
        data: {
          name: "Walls-Acoustic",
          ifcVersion: "IFC4X3_ADD2",
          description: "Walls must meet acoustic performance requirements",
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
          value: "false",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_WallCommon",
          baseName: "AcousticRating",
          dataType: "IFCLABEL",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 460 },
        data: {
          propertySet: "Pset_WallCommon",
          baseName: "ThermalTransmittance",
          dataType: "IFCREAL",
          value: "",
        },
      },
      {
        type: "classification",
        position: { x: 100, y: 580 },
        data: {
          system: "Uniclass 2015",
          value: "",
          uri: "",
        },
      },
    ],
    edges: [
      { targetHandle: "applicability" },
      { targetHandle: "applicability" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
    ],
  },
  {
    id: "lighting-fixtures-complete",
    name: "Lighting fixtures complete",
    description: "Complete lighting specification with power, efficacy, color temperature and spatial location",
    category: "Energy",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 200 },
        data: {
          name: "Lighting-Complete",
          ifcVersion: "IFC4X3_ADD2",
          description: "Lighting fixtures must have complete electrical and photometric properties",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCLIGHTFIXTURE",
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
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_LightFixtureTypeCommon",
          baseName: "PowerConsumption",
          dataType: "IFCPOWERMEASURE",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 460 },
        data: {
          propertySet: "Pset_LightFixtureTypeCommon",
          baseName: "LuminousEfficacy",
          dataType: "IFCREAL",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 580 },
        data: {
          propertySet: "Pset_LightFixtureTypeCommon",
          baseName: "ColorTemperature",
          dataType: "IFCTHERMODYNAMICTEMPERATUREMEASURE",
          value: "",
        },
      },
      {
        type: "partOf",
        position: { x: 100, y: 700 },
        data: {
          entity: "IFCSPACE",
          relation: "IFCRELCONTAINEDINSPATIALSTRUCTURE",
        },
      },
    ],
    edges: [
      { targetHandle: "applicability" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
    ],
  },
  {
    id: "slabs-concrete-specification",
    name: "Concrete slabs specification",
    description: "Complete concrete slab specification with material, thickness, load bearing and fire rating",
    category: "Structure",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 200 },
        data: {
          name: "Slabs-Concrete",
          ifcVersion: "IFC4X3_ADD2",
          description: "Concrete slabs must have complete structural and safety properties",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCSLAB",
          predefinedType: "FLOOR",
        },
      },
      {
        type: "material",
        position: { x: 100, y: 220 },
        data: {
          value: "concrete",
          uri: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_SlabCommon",
          baseName: "LoadBearing",
          dataType: "IFCBOOLEAN",
          value: "true",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 460 },
        data: {
          propertySet: "Pset_SlabCommon",
          baseName: "FireRating",
          dataType: "IFCLABEL",
          value: "",
        },
      },
      {
        type: "restriction",
        position: { x: 300, y: 460 },
        data: {
          restrictionType: "enumeration",
          values: ["REI60", "REI90", "REI120", "REI180", "REI240"],
        },
      },
      {
        type: "property",
        position: { x: 100, y: 580 },
        data: {
          propertySet: "Pset_SlabCommon",
          baseName: "Reference",
          dataType: "IFCIDENTIFIER",
          value: "",
        },
      },
    ],
    edges: [
      { source: "entity", target: "spec", targetHandle: "applicability" },
      { source: "material", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "restriction" },
      { source: "restriction", target: "spec", targetHandle: "requirements" },
      { source: "property", target: "spec", targetHandle: "requirements" },
    ],
  },
  {
    id: "windows-energy-performance",
    name: "Windows energy performance",
    description: "Energy performance requirements for windows including U-value, SHGC and air tightness",
    category: "Energy",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 200 },
        data: {
          name: "Windows-EnergyPerformance",
          ifcVersion: "IFC4X3_ADD2",
          description: "Windows must meet energy performance standards",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCWINDOW",
          predefinedType: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 220 },
        data: {
          propertySet: "Pset_WindowCommon",
          baseName: "IsExternal",
          dataType: "IFCBOOLEAN",
          value: "true",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_WindowCommon",
          baseName: "ThermalTransmittance",
          dataType: "IFCREAL",
          value: "",
        },
      },
      {
        type: "restriction",
        position: { x: 300, y: 340 },
        data: {
          restrictionType: "bounds",
          minValue: "",
          maxValue: "1.8",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 460 },
        data: {
          propertySet: "Pset_WindowCommon",
          baseName: "GlazingAreaFraction",
          dataType: "IFCPOSITIVERATIOMEASURE",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 580 },
        data: {
          propertySet: "Pset_WindowCommon",
          baseName: "Infiltration",
          dataType: "IFCVOLUMETRICFLOWRATEMEASURE",
          value: "",
        },
      },
    ],
    edges: [
      { source: "entity", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "restriction" },
      { source: "restriction", target: "spec", targetHandle: "requirements" },
      { source: "property", target: "spec", targetHandle: "requirements" },
      { source: "property", target: "spec", targetHandle: "requirements" },
    ],
  },
  {
    id: "spaces-program-requirements",
    name: "Spaces program requirements",
    description: "Space program validation with area, occupancy, finishes and function",
    category: "Space",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 200 },
        data: {
          name: "Spaces-ProgramRequirements",
          ifcVersion: "IFC4X3_ADD2",
          description: "Spaces must meet program requirements for area, occupancy and finishes",
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
          baseName: "Reference",
          dataType: "IFCIDENTIFIER",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_SpaceCommon",
          baseName: "NetPlannedArea",
          dataType: "IFCAREAMEASURE",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 460 },
        data: {
          propertySet: "Pset_SpaceOccupancyRequirements",
          baseName: "OccupancyNumber",
          dataType: "IFCCOUNTMEASURE",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 580 },
        data: {
          propertySet: "Pset_SpaceCommon",
          baseName: "CeilingCovering",
          dataType: "IFCLABEL",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 700 },
        data: {
          propertySet: "Pset_SpaceCommon",
          baseName: "WallCovering",
          dataType: "IFCLABEL",
          value: "",
        },
      },
    ],
    edges: [
      { targetHandle: "applicability" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
    ],
  },
  {
    id: "roofs-waterproofing-requirements",
    name: "Roofs waterproofing requirements",
    description: "Roof waterproofing and insulation requirements with material and performance data",
    category: "Structure",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 200 },
        data: {
          name: "Roofs-Waterproofing",
          ifcVersion: "IFC4X3_ADD2",
          description: "Roofs must have waterproofing and insulation specifications",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCROOF",
          predefinedType: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 220 },
        data: {
          propertySet: "Pset_RoofCommon",
          baseName: "IsExternal",
          dataType: "IFCBOOLEAN",
          value: "true",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_RoofCommon",
          baseName: "ThermalTransmittance",
          dataType: "IFCREAL",
          value: "",
        },
      },
      {
        type: "restriction",
        position: { x: 300, y: 340 },
        data: {
          restrictionType: "bounds",
          minValue: "",
          maxValue: "0.25",
        },
      },
      {
        type: "material",
        position: { x: 100, y: 460 },
        data: {
          value: "",
          uri: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 580 },
        data: {
          propertySet: "Pset_RoofCommon",
          baseName: "Reference",
          dataType: "IFCIDENTIFIER",
          value: "",
        },
      },
    ],
    edges: [
      { source: "entity", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "restriction" },
      { source: "restriction", target: "spec", targetHandle: "requirements" },
      { source: "material", target: "spec", targetHandle: "requirements" },
      { source: "property", target: "spec", targetHandle: "requirements" },
    ],
  },
  {
    id: "stairs-code-compliance",
    name: "Stairs code compliance",
    description: "Stair code compliance with riser, tread, handrail and fire rating requirements",
    category: "Safety",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 250 },
        data: {
          name: "Stairs-CodeCompliance",
          ifcVersion: "IFC4X3_ADD2",
          description: "Stairs must meet building code requirements for dimensions and safety",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCSTAIR",
          predefinedType: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 220 },
        data: {
          propertySet: "Pset_StairCommon",
          baseName: "NumberOfRiser",
          dataType: "IFCINTEGER",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_StairCommon",
          baseName: "NumberOfTreads",
          dataType: "IFCINTEGER",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 460 },
        data: {
          propertySet: "Pset_StairCommon",
          baseName: "RequiredHeadroom",
          dataType: "IFCLENGTHMEASURE",
          value: "",
        },
      },
      {
        type: "restriction",
        position: { x: 300, y: 460 },
        data: {
          restrictionType: "bounds",
          minValue: "2000",
          maxValue: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 580 },
        data: {
          propertySet: "Pset_StairCommon",
          baseName: "HandicapAccessible",
          dataType: "IFCBOOLEAN",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 700 },
        data: {
          propertySet: "Pset_StairCommon",
          baseName: "FireRating",
          dataType: "IFCLABEL",
          value: "",
        },
      },
    ],
    edges: [
      { source: "entity", target: "spec", targetHandle: "applicability" },
      { source: "property", target: "spec", targetHandle: "requirements" },
      { source: "property", target: "spec", targetHandle: "requirements" },
      { source: "property", target: "restriction" },
      { source: "restriction", target: "spec", targetHandle: "requirements" },
      { source: "property", target: "spec", targetHandle: "requirements" },
      { source: "property", target: "spec", targetHandle: "requirements" },
    ],
  },
  {
    id: "ductwork-mep-coordination",
    name: "Ductwork MEP coordination",
    description: "HVAC ductwork with size, insulation, and system assignment for MEP coordination",
    category: "Energy",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 200 },
        data: {
          name: "Ductwork-MEPCoordination",
          ifcVersion: "IFC4X3_ADD2",
          description: "HVAC ductwork must have size, insulation and system information",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCDUCTFITTING",
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
      {
        type: "property",
        position: { x: 100, y: 340 },
        data: {
          propertySet: "Pset_DuctFittingTypeCommon",
          baseName: "NominalDiameter",
          dataType: "IFCPOSITIVELENGHTMEASURE",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 460 },
        data: {
          propertySet: "Pset_DuctFittingTypeCommon",
          baseName: "InsulationRequired",
          dataType: "IFCBOOLEAN",
          value: "",
        },
      },
      {
        type: "classification",
        position: { x: 100, y: 580 },
        data: {
          system: "Omniclass",
          value: "",
          uri: "",
        },
      },
    ],
    edges: [
      { targetHandle: "applicability" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
    ],
  },
  {
    id: "curtain-walls-facade-engineering",
    name: "Curtain walls facade engineering",
    description: "Curtain wall engineering requirements with materials, thermal, structural and acoustic properties",
    category: "Structure",
    nodes: [
      {
        type: "spec",
        position: { x: 500, y: 250 },
        data: {
          name: "CurtainWalls-FacadeEngineering",
          ifcVersion: "IFC4X3_ADD2",
          description: "Curtain walls must have complete facade engineering properties",
        },
      },
      {
        type: "entity",
        position: { x: 100, y: 100 },
        data: {
          name: "IFCCURTAINWALL",
          predefinedType: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 220 },
        data: {
          propertySet: "Pset_CurtainWallCommon",
          baseName: "IsExternal",
          dataType: "IFCBOOLEAN",
          value: "true",
        },
      },
      {
        type: "material",
        position: { x: 100, y: 340 },
        data: {
          value: "",
          uri: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 460 },
        data: {
          propertySet: "Pset_CurtainWallCommon",
          baseName: "ThermalTransmittance",
          dataType: "IFCREAL",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 580 },
        data: {
          propertySet: "Pset_CurtainWallCommon",
          baseName: "AcousticRating",
          dataType: "IFCLABEL",
          value: "",
        },
      },
      {
        type: "property",
        position: { x: 100, y: 700 },
        data: {
          propertySet: "Pset_CurtainWallCommon",
          baseName: "FireRating",
          dataType: "IFCLABEL",
          value: "",
        },
      },
      {
        type: "classification",
        position: { x: 100, y: 820 },
        data: {
          system: "Uniclass 2015",
          value: "",
          uri: "",
        },
      },
    ],
    edges: [
      { targetHandle: "applicability" },
      { targetHandle: "applicability" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
      { targetHandle: "requirements" },
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
