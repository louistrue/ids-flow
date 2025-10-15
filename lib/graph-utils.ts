import type { GraphNode, GraphEdge, EntityNodeData } from "./graph-types"

/**
 * Find the specification node that a facet node is connected to
 */
export function getConnectedSpec(
  facetNodeId: string,
  edges: GraphEdge[]
): string | null {
  // Find edge where facet is source and spec is target
  const facetEdge = edges.find(e => e.source === facetNodeId)
  if (!facetEdge) return null

  return facetEdge.target
}

/**
 * Find the entity node connected to the same specification as the given facet node
 */
export function getConnectedEntity(
  facetNodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[]
): string | null {
  // 1. Find the spec node this facet is connected to
  const specNodeId = getConnectedSpec(facetNodeId, edges)
  if (!specNodeId) return null

  // 2. Find entity node connected to the same spec
  const entityEdge = edges.find(
    e => e.source !== facetNodeId &&
      e.target === specNodeId &&
      nodes.find(n => n.id === e.source && n.type === 'entity')
  )

  if (!entityEdge) return null

  // 3. Get entity node data
  const entityNode = nodes.find(n => n.id === entityEdge.source)
  return (entityNode?.data as EntityNodeData)?.name || null
}

/**
 * Get all facet nodes connected to the same specification as the given facet node
 */
export function getConnectedFacets(
  facetNodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphNode[] {
  const specNodeId = getConnectedSpec(facetNodeId, edges)
  if (!specNodeId) return []

  // Find all nodes connected to the same spec (excluding the source facet)
  const connectedNodeIds = edges
    .filter(e => e.target === specNodeId && e.source !== facetNodeId)
    .map(e => e.source)

  return nodes.filter(n => connectedNodeIds.includes(n.id))
}

/**
 * Check if a facet node is connected to a specification that has an entity
 */
export function hasConnectedEntity(
  facetNodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[]
): boolean {
  return getConnectedEntity(facetNodeId, nodes, edges) !== null
}

/**
 * Get the entity context for a facet node (entity name or null)
 */
export function getEntityContext(
  facetNodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[]
): { entityName: string | null; specNodeId: string | null } {
  const specNodeId = getConnectedSpec(facetNodeId, edges)
  const entityName = specNodeId ? getConnectedEntity(facetNodeId, nodes, edges) : null

  return { entityName, specNodeId }
}
