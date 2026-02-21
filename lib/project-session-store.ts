/**
 * Project Session Store
 *
 * Persists project state (nodes, edges, ifcVersion) to sessionStorage so that
 * navigating away from the editor (e.g. to /docs) and back does not discard
 * the user's work. sessionStorage is scoped to the browser tab and cleared
 * when the tab is closed, which is the appropriate lifetime for unsaved work.
 */

import type { GraphNode, GraphEdge } from "./graph-types"

const STORAGE_KEY = "idsedit-project-state"

interface ProjectState {
  nodes: GraphNode[]
  edges: GraphEdge[]
  ifcVersion: string
}

let cache: ProjectState | null | undefined = undefined

/**
 * Load project state from sessionStorage.
 * Returns null if nothing is stored or the data is invalid.
 * The result is cached for the lifetime of the module so multiple
 * useState initialisers don't each parse JSON independently.
 */
export function loadProjectState(): ProjectState | null {
  if (cache !== undefined) return cache

  try {
    if (typeof window === "undefined") {
      cache = null
      return null
    }

    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      cache = null
      return null
    }

    const parsed = JSON.parse(raw)

    if (
      !Array.isArray(parsed.nodes) ||
      !Array.isArray(parsed.edges) ||
      typeof parsed.ifcVersion !== "string"
    ) {
      cache = null
      return null
    }

    cache = parsed as ProjectState
    return cache
  } catch {
    cache = null
    return null
  }
}

/**
 * Save project state to sessionStorage.
 */
export function saveProjectState(
  nodes: GraphNode[],
  edges: GraphEdge[],
  ifcVersion: string
): void {
  try {
    if (typeof window === "undefined") return

    const state: ProjectState = { nodes, edges, ifcVersion }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    // Keep cache in sync
    cache = state
  } catch (error) {
    console.warn("Failed to save project state to sessionStorage:", error)
  }
}
