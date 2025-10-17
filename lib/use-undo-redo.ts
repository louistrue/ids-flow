import { useState, useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { GraphNode, GraphEdge } from './graph-types'

interface HistoryState {
    nodes: GraphNode[]
    edges: GraphEdge[]
}

interface UseUndoRedoReturn {
    undo: () => void
    redo: () => void
    takeSnapshot: () => void
    canUndo: boolean
    canRedo: boolean
}

export function useUndoRedo(
    nodes: GraphNode[],
    edges: GraphEdge[],
    setNodes: Dispatch<SetStateAction<GraphNode[]>>,
    setEdges: Dispatch<SetStateAction<GraphEdge[]>>
): UseUndoRedoReturn {
    const [past, setPast] = useState<HistoryState[]>([])
    const [future, setFuture] = useState<HistoryState[]>([])

    const takeSnapshot = useCallback(() => {
        setPast((past) => [
            ...past.slice(-49), // Keep last 50 states
            {
                nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
                edges: JSON.parse(JSON.stringify(edges))  // Deep clone
            }
        ])
        setFuture([]) // Clear redo on new action
    }, [nodes, edges])

    const undo = useCallback(() => {
        const pastState = past[past.length - 1]
        if (!pastState) return

        setPast((past) => past.slice(0, -1))
        setFuture((future) => [{
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges))
        }, ...future])
        setNodes(pastState.nodes)
        setEdges(pastState.edges)
    }, [past, nodes, edges, setNodes, setEdges])

    const redo = useCallback(() => {
        const futureState = future[0]
        if (!futureState) return

        setFuture((future) => future.slice(1))
        setPast((past) => [...past, {
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges))
        }])
        setNodes(futureState.nodes)
        setEdges(futureState.edges)
    }, [future, nodes, edges, setNodes, setEdges])

    return {
        undo,
        redo,
        takeSnapshot,
        canUndo: past.length > 0,
        canRedo: future.length > 0
    }
}
