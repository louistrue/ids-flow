import type { GraphNode, GraphEdge } from "./graph-types"

export const initialNodes: GraphNode[] = [
  {
    id: "SP1",
    type: "spec",
    position: { x: 600, y: 150 }, // Spec node center-right
    data: {
      name: "Walls-FireRating",
      ifcVersion: "IFC4X3_ADD2",
      description: "Fire rating requirements for walls",
    },
  },
  {
    id: "E1",
    type: "entity",
    position: { x: 100, y: 100 }, // Entity at top (applicability)
    data: {
      name: "IFCWALL",
      predefinedType: "",
    },
  },
  {
    id: "AP1",
    type: "property",
    position: { x: 100, y: 230 }, // Applicability property below entity
    data: {
      propertySet: "Pset_WallCommon",
      baseName: "IsExternal",
      dataType: "IFCBOOLEAN",
      value: "true",
    },
  },
  {
    id: "P1",
    type: "property",
    position: { x: 100, y: 480 }, // Requirements property (after gap)
    data: {
      propertySet: "Pset_WallCommon",
      baseName: "FireRating",
      dataType: "IFCLABEL",
      value: "",
    },
  },
]

export const initialEdges: GraphEdge[] = [
  {
    id: "e1-sp1",
    source: "E1",
    target: "SP1",
    targetHandle: "applicability",
  },
  {
    id: "ap1-sp1",
    source: "AP1",
    target: "SP1",
    targetHandle: "applicability",
  },
  {
    id: "p1-sp1",
    source: "P1",
    target: "SP1",
    targetHandle: "requirements",
  },
]
