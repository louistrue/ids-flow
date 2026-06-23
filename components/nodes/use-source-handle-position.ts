import { Position } from "@xyflow/react"

/**
 * Pick which side of a facet card its source handle should attach to.
 *
 * Default: right side (the original grouped-layout behaviour where facets
 * sit to the left of the spec card and connect rightwards into it).
 *
 * In stacked arrange mode, applicability facets are repositioned to the
 * right of the spec card and connect leftwards into the spec's right-side
 * applicability port — so their source handle needs to be on the *left*
 * for the edge to render as a clean straight line between the two cards.
 * Requirements facets continue to live below the spec and source from the
 * right, taking a U-shaped smoothstep path through the right gutter.
 */
export function getFacetSourcePosition(data: {
    arrangeMode?: "grouped" | "stacked"
    isInRequirements?: boolean
}): Position {
    if (data.arrangeMode === "stacked" && data.isInRequirements !== true) {
        return Position.Left
    }
    return Position.Right
}
