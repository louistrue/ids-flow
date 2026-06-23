"use client"

import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react"

/**
 * Pixels of horizontal gap between adjacent lanes. Wide enough that two
 * neighbouring trunks are visually distinct at typical zoom levels, narrow
 * enough that four-five lanes still fit in the gap between a facet column
 * and the spec card in grouped mode.
 */
const LANE_SPACING = 28

/**
 * Minimum horizontal distance the trunk for lane 0 keeps from the target.
 * This is the "closest" lane (top-most source in the sort order).
 */
const TRUNK_MARGIN = 30

/**
 * Custom orthogonal edge that routes each connection through its own vertical
 * "lane" trunk based on a per-edge index supplied via `data.lane`. Lanes are
 * staggered horizontally so that when multiple facets converge on the same
 * spec port, each edge gets a distinct visible vertical run instead of all of
 * them collapsing onto the same bezier curve. The trunk side and direction
 * are inferred from the source/target X so the same component works whether
 * the source is left of the target (grouped mode: facets → spec on the left
 * port) or right of the target (stacked applicability: facets → spec right
 * port from the right side of the canvas).
 */
export function LaneEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const lane = (data as { lane?: number } | undefined)?.lane ?? 0

  const isSourceLeftOfTarget = sourceX < targetX
  let centerX: number
  if (isSourceLeftOfTarget) {
    // Trunk lives in the gap to the LEFT of the target. Lane 0 hugs the
    // target; higher lanes stack outward toward the source.
    centerX = targetX - TRUNK_MARGIN - lane * LANE_SPACING
    // Don't let the trunk cross past the source — keeps the path from
    // doubling back on itself when the gap is too narrow for all lanes.
    centerX = Math.max(centerX, sourceX + 20)
  } else {
    centerX = targetX + TRUNK_MARGIN + lane * LANE_SPACING
    centerX = Math.min(centerX, sourceX - 20)
  }

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    centerX,
    borderRadius: 8,
  })

  return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
}
