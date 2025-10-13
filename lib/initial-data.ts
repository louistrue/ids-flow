import type { GraphNode, GraphEdge } from "./graph-types"

export const initialNodes: GraphNode[] = [
  {
    id: "SP1",
    type: "spec",
    position: { x: 500, y: 100 },
    data: {
      name: "Walls-FireRating",
      ifcVersion: "IFC4X3_ADD2",
      description: "Fire rating requirements for walls",
    },
  },
  {
    id: "E1",
    type: "entity",
    position: { x: 100, y: 100 },
    data: {
      name: "IFCWALL",
      predefinedType: "",
    },
  },
  {
    id: "P1",
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
    id: "AP1",
    type: "property",
    position: { x: 100, y: 350 },
    data: {
      propertySet: "Pset_WallCommon",
      baseName: "IsExternal",
      dataType: "IFCBOOLEAN",
      value: "true",
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
