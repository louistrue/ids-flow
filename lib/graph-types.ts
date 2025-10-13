export interface GraphNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: any
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  targetHandle?: string
}
