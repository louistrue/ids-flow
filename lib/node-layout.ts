import type { GraphNode, GraphEdge } from "./graph-types"

/**
 * Layout mode for arranging the canvas.
 *
 * - "grouped"  (default) — facets stacked in a single left-side column, the
 *   spec node sits to the right of them, and multiple specs are stacked
 *   vertically. This is the original layout produced by `relayoutNodes`.
 * - "stacked"  — each specification gets its own vertical column: spec on
 *   top, applicability facets stacked directly below it, a gap, then the
 *   requirements facets stacked below that. Multiple specs are placed
 *   side-by-side horizontally. Toggled via the "Arrange Mode" control in
 *   the editor header.
 */
export type ArrangeMode = "grouped" | "stacked"

export interface LayoutConfig {
    specPosition: { x: number; y: number }
    baseX: number // Left side X position for facet nodes
    baseY: number // Top Y position
    verticalSpacing: number // Spacing between nodes in same group
    groupGap: number // Gap between applicability and requirements groups
    horizontalGap: number // Space between multiple specs
    nodeHeight: number // Average node height for collision detection
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
    specPosition: { x: 600, y: 150 },
    baseX: 100,
    baseY: 100,
    verticalSpacing: 150, // Increased from 130 to 150 for better spacing
    groupGap: 200,
    horizontalGap: 600,
    nodeHeight: 100,
}

// Width of one specification column in "stacked" arrange mode. Roughly the
// spec card width (280px) plus a comfortable horizontal gutter so neighboring
// columns don't visually collide with restriction nodes that sit to the right.
const STACKED_COLUMN_WIDTH = 560
// Vertical pitch between cards within a stacked column. Generous enough that
// the orthogonal edges in the right-side gutter don't run into one another
// and every facet card has clear breathing room.
const STACKED_VERTICAL_SPACING = 190
// Vertical gap inserted between the applicability and requirements sections.
const STACKED_SECTION_GAP = 60
// Horizontal offset of a restriction relative to its parent facet's column.
const STACKED_RESTRICTION_OFFSET = 280

// Node type priority for ordering within groups
const NODE_TYPE_PRIORITY: Record<string, number> = {
    entity: 1,
    property: 2,
    attribute: 3,
    classification: 4,
    material: 5,
    partOf: 6,
    restriction: 7,
}

export function calculateNodePosition(
    nodeType: string,
    targetHandle: 'applicability' | 'requirements',
    existingNodes: GraphNode[],
    allEdges: GraphEdge[],
    currentSpecId: string,
    config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): { x: number; y: number } {
    console.log(`🎯 Calculating position for ${nodeType} node (${targetHandle}) in spec ${currentSpecId}`)

    // Count existing nodes connected to THIS specific spec by target handle
    const applicabilityNodesInCurrentSpec = existingNodes.filter(node =>
        node.type !== 'spec' && isNodeConnectedToHandle(node, allEdges, currentSpecId, 'applicability')
    )
    const requirementsNodesInCurrentSpec = existingNodes.filter(node =>
        node.type !== 'spec' && isNodeConnectedToHandle(node, allEdges, currentSpecId, 'requirements')
    )

    console.log(`📊 Node counts for current spec:`, {
        applicability: applicabilityNodesInCurrentSpec.length,
        requirements: requirementsNodesInCurrentSpec.length,
        total: existingNodes.length
    })

    let yPosition: number
    let nodesInGroup: GraphNode[]

    if (targetHandle === 'applicability') {
        nodesInGroup = applicabilityNodesInCurrentSpec
        yPosition = config.baseY

        // For applicability, entities go first, then other facets
        if (nodeType === 'entity') {
            yPosition = config.baseY
        } else {
            const entityCount = nodesInGroup.filter(n => n.type === 'entity').length
            const facetCount = nodesInGroup.filter(n => n.type !== 'entity').length
            yPosition = config.baseY + (entityCount * config.verticalSpacing) + (facetCount * config.verticalSpacing)
        }
    } else {
        nodesInGroup = requirementsNodesInCurrentSpec
        // Requirements start after applicability group + gap
        const applicabilityCount = applicabilityNodesInCurrentSpec.length
        yPosition = config.baseY + (applicabilityCount * config.verticalSpacing) + config.groupGap + (nodesInGroup.length * config.verticalSpacing)

        // Special positioning for restriction nodes - place them between facets and spec
        if (nodeType === 'restriction') {
            // Find the facet node this restriction is connected to
            const facetEdge = allEdges.find(e => e.target === 'temp-spec' || e.target === currentSpecId)
            if (facetEdge) {
                const facetNode = existingNodes.find(n => n.id === facetEdge.source)
                if (facetNode) {
                    // Position restriction midway between facet and spec
                    const specNode = existingNodes.find(n => n.id === currentSpecId)
                    if (specNode) {
                        const facetX = facetNode.position.x
                        const specX = specNode.position.x
                        const midX = (facetX + specX) / 2
                        yPosition = facetNode.position.y // Same Y as facet

                        // Override the base X position
                        config.baseX = midX
                    }
                }
            }
        }
    }

    console.log(`📐 Initial position calculation:`, {
        nodeType,
        targetHandle,
        baseY: config.baseY,
        verticalSpacing: config.verticalSpacing,
        groupGap: config.groupGap,
        calculatedY: yPosition
    })

    // Check for collisions and adjust position (using ALL nodes for global collision detection)
    const finalPosition = findNonOverlappingPosition(
        { x: config.baseX, y: yPosition },
        existingNodes,
        config.nodeHeight
    )

    console.log(`🎯 Final calculated position:`, finalPosition)

    return finalPosition
}

function isNodeConnectedToHandle(
    node: GraphNode,
    allEdges: GraphEdge[],
    specId: string,
    targetHandle: 'applicability' | 'requirements'
): boolean {
    // Find edge connecting this node to the spec
    const directEdge = allEdges.find(e =>
        e.source === node.id &&
        e.target === specId &&
        e.targetHandle === targetHandle
    )

    if (directEdge) {
        return true
    }

    // Check for restriction chain: facet -> restriction -> spec
    if (node.type === 'restriction') {
        // Restriction nodes connect directly to spec
        const restrictionEdge = allEdges.find(e =>
            e.source === node.id &&
            e.target === specId &&
            e.targetHandle === targetHandle
        )
        return !!restrictionEdge
    } else {
        // For facet nodes, check if they connect through a restriction
        const facetToRestrictionEdge = allEdges.find(e => e.source === node.id)
        if (facetToRestrictionEdge) {
            const restrictionToSpecEdge = allEdges.find(e =>
                e.source === facetToRestrictionEdge.target &&
                e.target === specId &&
                e.targetHandle === targetHandle
            )
            return !!restrictionToSpecEdge
        }
    }

    return false
}

export function findAvailableSpace(
    nodes: GraphNode[],
    preferredPosition: { x: number; y: number },
    nodeWidth: number = 250,
    nodeHeight: number = 100
): { x: number; y: number } {
    const padding = 20
    const searchRadius = 400

    // Try positions in a spiral pattern around the preferred position
    for (let radius = 0; radius <= searchRadius; radius += 50) {
        for (let angle = 0; angle < 360; angle += 45) {
            const x = preferredPosition.x + Math.cos(angle * Math.PI / 180) * radius
            const y = preferredPosition.y + Math.sin(angle * Math.PI / 180) * radius

            const candidatePosition = { x, y }

            if (!hasCollision(nodes, candidatePosition, nodeWidth, nodeHeight, padding)) {
                return candidatePosition
            }
        }
    }

    // If no space found, place far to the right
    const rightmostX = Math.max(...nodes.map(n => n.position.x), 0)
    return {
        x: rightmostX + nodeWidth + padding,
        y: preferredPosition.y,
    }
}

function hasCollision(
    nodes: GraphNode[],
    position: { x: number; y: number },
    width: number,
    height: number,
    padding: number
): boolean {
    return nodes.some(node => {
        const nodeWidth = 250 // Average node width
        const nodeHeight = 100 // Average node height

        return !(
            position.x + width + padding < node.position.x ||
            position.x > node.position.x + nodeWidth + padding ||
            position.y + height + padding < node.position.y ||
            position.y > node.position.y + nodeHeight + padding
        )
    })
}

export function findNonOverlappingPosition(
    preferredPosition: { x: number; y: number },
    existingNodes: GraphNode[],
    nodeHeight: number = 100
): { x: number; y: number } {
    const padding = 30 // Increased from 20 to 30 for better spacing
    const nodeWidth = 250

    console.log(`🔍 Finding non-overlapping position for:`, preferredPosition)

    // Filter nodes that are on the same X position (left side)
    const leftSideNodes = existingNodes.filter(node =>
        Math.abs(node.position.x - preferredPosition.x) < 50 // Within 50px of target X
    )

    console.log(`📊 Found ${leftSideNodes.length} nodes on left side:`, leftSideNodes.map(n => ({ id: n.id, pos: n.position })))

    // Sort by Y position
    leftSideNodes.sort((a, b) => a.position.y - b.position.y)

    // Find the first available Y position
    let yPosition = preferredPosition.y

    for (const node of leftSideNodes) {
        const nodeBottom = node.position.y + nodeHeight + padding
        const nodeTop = node.position.y - padding

        console.log(`🔍 Checking collision with node ${node.id}:`, {
            nodePos: node.position,
            nodeTop,
            nodeBottom,
            preferredY: yPosition,
            overlaps: yPosition >= nodeTop && yPosition <= nodeBottom
        })

        // Check if our preferred position overlaps with this node
        if (yPosition >= nodeTop && yPosition <= nodeBottom) {
            // Move below this node
            yPosition = nodeBottom + padding
            console.log(`⚠️ Collision detected! Moving to:`, yPosition)
        }
    }

    const finalPosition = {
        x: preferredPosition.x,
        y: yPosition,
    }

    console.log(`✅ Final position:`, finalPosition)

    return finalPosition
}

export function findTemplateOffset(
    existingNodes: GraphNode[],
    preferredPosition: { x: number; y: number }
): { x: number; y: number } {
    console.log(`📋 Finding template offset for new spec node`)

    const specNodes = existingNodes.filter(n => n.type === 'spec')
    console.log(`📊 Existing spec nodes:`, specNodes.map(n => ({ id: n.id, pos: n.position })))

    if (specNodes.length === 0) {
        console.log(`✅ No existing specs, using preferred position:`, preferredPosition)
        return preferredPosition
    }

    // Stack vertically instead of horizontally
    const lowestSpec = Math.max(...specNodes.map(n => n.position.y))
    const offset = {
        x: preferredPosition.x,
        y: lowestSpec + DEFAULT_LAYOUT_CONFIG.verticalSpacing * 3, // Stack below with gap
    }

    console.log(`📐 Template offset calculation:`, {
        lowestSpec,
        verticalSpacing: DEFAULT_LAYOUT_CONFIG.verticalSpacing,
        gap: DEFAULT_LAYOUT_CONFIG.verticalSpacing * 3,
        finalOffset: offset
    })

    return offset
}

export function relayoutNodes(
    nodes: GraphNode[],
    edges: GraphEdge[],
    mode: ArrangeMode = "grouped"
): GraphNode[] {
    if (mode === "stacked") {
        return relayoutNodesStacked(nodes, edges)
    }

    const specNodes = nodes.filter(node => node.type === 'spec')
    if (specNodes.length === 0) return nodes

    const updatedNodes = [...nodes]

    specNodes.forEach((specNode, specIndex) => {
        // Find nodes connected to this spec
        const connectedEdges = edges.filter(edge => edge.target === specNode.id)
        const connectedNodeIds = new Set(connectedEdges.map(edge => edge.source))
        const connectedNodes = nodes.filter(node => connectedNodeIds.has(node.id))

        // Group connected nodes by target handle
        const applicabilityNodes: GraphNode[] = []
        const requirementsNodes: GraphNode[] = []

        connectedNodes.forEach(node => {
            const edge = connectedEdges.find(e => e.source === node.id)
            if (edge?.targetHandle === 'applicability') {
                applicabilityNodes.push(node)
            } else if (edge?.targetHandle === 'requirements') {
                requirementsNodes.push(node)
            }
        })

        // Sort nodes within each group by type priority
        const sortByPriority = (a: GraphNode, b: GraphNode) => {
            const priorityA = NODE_TYPE_PRIORITY[a.type] || 999
            const priorityB = NODE_TYPE_PRIORITY[b.type] || 999
            return priorityA - priorityB
        }

        applicabilityNodes.sort(sortByPriority)
        requirementsNodes.sort(sortByPriority)

        // Calculate positions for this spec group
        const specOffset = {
            x: DEFAULT_LAYOUT_CONFIG.specPosition.x,
            y: DEFAULT_LAYOUT_CONFIG.specPosition.y + (specIndex * DEFAULT_LAYOUT_CONFIG.verticalSpacing * 4), // Stack vertically
        }

        const config: LayoutConfig = {
            ...DEFAULT_LAYOUT_CONFIG,
            specPosition: specOffset,
            baseX: specOffset.x - 500,
        }

        // Update applicability nodes with collision detection
        applicabilityNodes.forEach((node, index) => {
            const nodeIndex = updatedNodes.findIndex(n => n.id === node.id)
            if (nodeIndex !== -1) {
                const preferredPosition = {
                    x: config.baseX,
                    y: config.baseY + (index * config.verticalSpacing),
                }

                const finalPosition = findNonOverlappingPosition(
                    preferredPosition,
                    updatedNodes.filter(n => n.id !== node.id), // Exclude current node
                    config.nodeHeight
                )

                updatedNodes[nodeIndex] = {
                    ...updatedNodes[nodeIndex],
                    position: finalPosition,
                }
            }
        })

        // Update requirements nodes with collision detection
        requirementsNodes.forEach((node, index) => {
            const nodeIndex = updatedNodes.findIndex(n => n.id === node.id)
            if (nodeIndex !== -1) {
                const preferredPosition = {
                    x: config.baseX,
                    y: config.baseY + (applicabilityNodes.length * config.verticalSpacing) + config.groupGap + (index * config.verticalSpacing),
                }

                const finalPosition = findNonOverlappingPosition(
                    preferredPosition,
                    updatedNodes.filter(n => n.id !== node.id), // Exclude current node
                    config.nodeHeight
                )

                updatedNodes[nodeIndex] = {
                    ...updatedNodes[nodeIndex],
                    position: finalPosition,
                }
            }
        })

        // Update spec node position
        const specIndexInNodes = updatedNodes.findIndex(n => n.id === specNode.id)
        if (specIndexInNodes !== -1) {
            updatedNodes[specIndexInNodes] = {
                ...updatedNodes[specIndexInNodes],
                position: specOffset,
            }
        }
    })

    return updatedNodes
}

/**
 * Vertical-stack layout: every specification becomes its own column.
 *
 * Within a column we stack:
 *   1. the spec node at the top,
 *   2. its applicability facets directly below (in priority order),
 *   3. a gap,
 *   4. its requirements facets below the gap.
 *
 * Restrictions are placed in the same column as their parent facet, offset
 * to the right so the facet → restriction → spec chain stays readable.
 *
 * Multiple specifications are laid out side-by-side, left-to-right, in the
 * order they appear in `nodes` so the user's mental ordering is preserved.
 *
 * Any nodes that are not connected to a spec (orphans) are appended in an
 * extra column on the right so they don't visually overlap arranged content.
 */
function relayoutNodesStacked(
    nodes: GraphNode[],
    edges: GraphEdge[]
): GraphNode[] {
    const specNodes = nodes.filter(node => node.type === 'spec')
    if (specNodes.length === 0) return nodes

    const updatedNodes = [...nodes]
    const positioned = new Set<string>()

    const baseX = DEFAULT_LAYOUT_CONFIG.specPosition.x
    const baseY = DEFAULT_LAYOUT_CONFIG.baseY

    const updatePosition = (id: string, position: { x: number; y: number }) => {
        const idx = updatedNodes.findIndex(n => n.id === id)
        if (idx === -1) return
        updatedNodes[idx] = { ...updatedNodes[idx], position }
        positioned.add(id)
    }

    const sortByPriority = (a: GraphNode, b: GraphNode) => {
        const priorityA = NODE_TYPE_PRIORITY[a.type] || 999
        const priorityB = NODE_TYPE_PRIORITY[b.type] || 999
        return priorityA - priorityB
    }

    specNodes.forEach((specNode, specIndex) => {
        const columnX = baseX + specIndex * STACKED_COLUMN_WIDTH

        // Place the spec node at the top of its column.
        updatePosition(specNode.id, { x: columnX, y: baseY })

        // Collect facets connected to this spec, separated by handle. A facet
        // may be wired either directly to the spec or via a restriction node;
        // both cases need to be detected so the column ends up complete.
        const applicabilityFacets: GraphNode[] = []
        const requirementsFacets: GraphNode[] = []
        // Map of facet id -> restriction node sitting on the wire to the spec.
        const restrictionForFacet = new Map<string, GraphNode>()

        nodes.forEach(node => {
            if (node.type === 'spec' || node.type === 'restriction') return

            // Direct connection: facet -> spec
            const directEdge = edges.find(e =>
                e.source === node.id && e.target === specNode.id,
            )
            if (directEdge) {
                if (directEdge.targetHandle === 'applicability') applicabilityFacets.push(node)
                else if (directEdge.targetHandle === 'requirements') requirementsFacets.push(node)
                return
            }

            // Indirect connection: facet -> restriction -> spec
            const toRestriction = edges.find(e => e.source === node.id)
            if (!toRestriction) return
            const maybeRestriction = nodes.find(n => n.id === toRestriction.target)
            if (!maybeRestriction || maybeRestriction.type !== 'restriction') return
            const restrictionEdge = edges.find(e =>
                e.source === maybeRestriction.id && e.target === specNode.id,
            )
            if (!restrictionEdge) return
            if (restrictionEdge.targetHandle === 'applicability') applicabilityFacets.push(node)
            else if (restrictionEdge.targetHandle === 'requirements') requirementsFacets.push(node)
            restrictionForFacet.set(node.id, maybeRestriction)
        })

        applicabilityFacets.sort(sortByPriority)
        requirementsFacets.sort(sortByPriority)

        // Stack applicability facets directly below the spec.
        let cursorY = baseY + STACKED_VERTICAL_SPACING
        applicabilityFacets.forEach(facet => {
            updatePosition(facet.id, { x: columnX, y: cursorY })
            const restriction = restrictionForFacet.get(facet.id)
            if (restriction) {
                updatePosition(restriction.id, {
                    x: columnX + STACKED_RESTRICTION_OFFSET,
                    y: cursorY,
                })
            }
            cursorY += STACKED_VERTICAL_SPACING
        })

        // Group gap before requirements, so the two sections read as distinct.
        if (requirementsFacets.length > 0) {
            cursorY += STACKED_SECTION_GAP
        }

        requirementsFacets.forEach(facet => {
            updatePosition(facet.id, { x: columnX, y: cursorY })
            const restriction = restrictionForFacet.get(facet.id)
            if (restriction) {
                updatePosition(restriction.id, {
                    x: columnX + STACKED_RESTRICTION_OFFSET,
                    y: cursorY,
                })
            }
            cursorY += STACKED_VERTICAL_SPACING
        })
    })

    // Park anything that wasn't touched (orphan nodes, dangling restrictions)
    // in an additional column to the right of the last spec, so the canvas
    // doesn't end up with overlapping clusters of stale content.
    const orphanX = baseX + specNodes.length * STACKED_COLUMN_WIDTH
    let orphanY = baseY
    updatedNodes.forEach((node, idx) => {
        if (positioned.has(node.id)) return
        updatedNodes[idx] = { ...node, position: { x: orphanX, y: orphanY } }
        orphanY += STACKED_VERTICAL_SPACING
    })

    return updatedNodes
}

export function calculateSmartPositionForNewNode(
    nodeType: string,
    existingNodes: GraphNode[],
    edges: GraphEdge[],
    preferredPosition?: { x: number; y: number }
): { x: number; y: number } {
    const position = preferredPosition || { x: 400, y: 200 }

    // For spec nodes, find a clear horizontal position
    if (nodeType === 'spec') {
        return findTemplateOffset(existingNodes, position)
    }

    // For other nodes, find available space
    return findAvailableSpace(existingNodes, position)
}

export function findExistingNode(
    existingNodes: GraphNode[],
    nodeType: string,
    nodeData: any
): GraphNode | null {
    // Look for existing nodes of the same type with matching data
    return existingNodes.find(node => {
        if (node.type !== nodeType) return false

        // Match based on node type and key data fields
        switch (nodeType) {
            case 'entity':
                return node.data.name === nodeData.name
            case 'property':
                return node.data.propertySet === nodeData.propertySet &&
                    node.data.baseName === nodeData.baseName
            case 'attribute':
                return node.data.name === nodeData.name
            case 'classification':
                return node.data.system === nodeData.system &&
                    node.data.value === nodeData.value
            case 'material':
                return node.data.value === nodeData.value
            case 'partOf':
                return node.data.entity === nodeData.entity
            case 'restriction':
                return node.data.restrictionType === nodeData.restrictionType &&
                    node.data.pattern === nodeData.pattern &&
                    node.data.minValue === nodeData.minValue &&
                    node.data.maxValue === nodeData.maxValue &&
                    node.data.minLength === nodeData.minLength &&
                    node.data.maxLength === nodeData.maxLength &&
                    JSON.stringify(node.data.values) === JSON.stringify(nodeData.values)
            default:
                return false
        }
    }) || null
}
