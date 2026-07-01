"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Panel } from "@xyflow/react"
import Fuse from "fuse.js"
import {
  Search,
  X,
  FileText,
  Box,
  Tag,
  Database,
  Layers,
  Package,
  GitBranch,
  Filter,
  CornerDownLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FACET_COLORS, type FacetType } from "@/lib/facet-colors"
import type { GraphNode } from "@/lib/graph-types"

interface CanvasSearchProps {
  nodes: GraphNode[]
  /** Select the node and fly the canvas to it. */
  onLocate: (nodeId: string) => void
}

// Per-node-type presentation for the results list: icon + human label,
// matching the node palette so results read the same as the canvas.
const TYPE_META: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  spec: { label: "Specification", Icon: FileText },
  entity: { label: "Entity", Icon: Box },
  property: { label: "Property", Icon: Tag },
  attribute: { label: "Attribute", Icon: Database },
  classification: { label: "Classification", Icon: Layers },
  material: { label: "Material", Icon: Package },
  partOf: { label: "Part Of", Icon: GitBranch },
  restriction: { label: "Restriction", Icon: Filter },
}

interface SearchItem {
  id: string
  type: string
  primary: string
  detail: string
  haystack: string
}

function str(v: unknown): string {
  return typeof v === "string" ? v : ""
}

// Reduce a node to the fields worth searching + the labels worth showing.
function toSearchItem(node: GraphNode): SearchItem {
  const d = node.data as Record<string, unknown>
  let primary = ""
  let detail = ""
  const extra: string[] = []

  switch (node.type) {
    case "spec":
      primary = str(d.name) || "Untitled specification"
      detail = str(d.description) || str(d.identifier)
      extra.push(str(d.identifier), str(d.instructions))
      break
    case "entity":
      primary = str(d.name) || "Entity"
      detail = str(d.predefinedType)
      break
    case "property":
      primary = str(d.baseName) || "Property"
      detail = [str(d.propertySet), str(d.dataType)].filter(Boolean).join(" · ")
      extra.push(str(d.value))
      break
    case "attribute":
      primary = str(d.name) || "Attribute"
      detail = str(d.value)
      break
    case "classification":
      primary = str(d.value) || str(d.system) || "Classification"
      detail = str(d.system)
      extra.push(str(d.uri))
      break
    case "material":
      primary = str(d.value) || "Any material"
      detail = str(d.uri)
      break
    case "partOf":
      primary = str(d.entity) || "Part Of"
      detail = str(d.relation)
      break
    case "restriction": {
      const values = Array.isArray(d.values) ? (d.values as unknown[]).map(String) : []
      primary = str(d.restrictionType) || "Restriction"
      detail = values.join(", ") || str(d.pattern)
      extra.push(...values)
      break
    }
    default:
      primary = node.type
  }

  const haystack = [primary, detail, ...extra].filter(Boolean).join(" ")
  return { id: node.id, type: node.type, primary, detail, haystack }
}

const MAX_RESULTS = 40

export function CanvasSearch({ nodes, onLocate }: CanvasSearchProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const items = useMemo(() => nodes.map(toSearchItem), [nodes])

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: "primary", weight: 0.7 },
          { name: "haystack", weight: 0.3 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    [items]
  )

  // Empty query → all specifications (the common "jump to a spec" case for big
  // files). Non-empty → fuzzy across everything, specs ranked first.
  const results = useMemo(() => {
    const q = query.trim()
    if (!q) {
      return items.filter((i) => i.type === "spec").slice(0, MAX_RESULTS)
    }
    const matched = fuse.search(q).map((r) => r.item)
    const specs = matched.filter((i) => i.type === "spec")
    const rest = matched.filter((i) => i.type !== "spec")
    return [...specs, ...rest].slice(0, MAX_RESULTS)
  }, [query, items, fuse])

  const specCount = useMemo(() => items.filter((i) => i.type === "spec").length, [items])

  // Keep the highlighted row valid + in view as results change.
  useEffect(() => {
    setHighlight(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${highlight}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [highlight, open])

  // Global shortcut: Cmd/Ctrl+K or "/" focuses the search (unless already typing
  // somewhere). Escape blurs. "/" is ignored while an input/textarea is focused.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(true)
        inputRef.current?.focus()
        inputRef.current?.select()
      } else if (e.key === "/" && !typing) {
        e.preventDefault()
        setOpen(true)
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const locate = useCallback(
    (id: string) => {
      onLocate(id)
      // Drop focus after jumping so canvas shortcuts (delete, etc.) work again;
      // the onBlur handler then collapses the results so they don't cover the
      // node we just flew to. The search field itself stays put.
      inputRef.current?.blur()
    },
    [onLocate]
  )

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlight((h) => Math.min(h + 1, results.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlight((h) => Math.max(h - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const item = results[highlight]
        if (item) locate(item.id)
      } else if (e.key === "Escape") {
        e.preventDefault()
        if (query) {
          setQuery("")
        } else {
          setOpen(false)
          inputRef.current?.blur()
        }
      }
      // Don't let navigation keys reach React Flow (node deletion, pan, etc.).
      e.stopPropagation()
    },
    [results, highlight, locate, query]
  )

  const showResults = open && results.length > 0
  const showEmpty = open && query.trim().length > 0 && results.length === 0

  return (
    <Panel position="top-left" className="!m-3 !p-0">
      <div
        className={cn(
          "w-[260px] overflow-hidden rounded-xl border border-border bg-card/90 shadow-lg backdrop-blur",
          "nodrag nopan"
        )}
      >
        <div className="flex items-center gap-2 px-2.5 py-2">
          <Search className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            // Collapse the results shortly after focus leaves. The delay lets a
            // result's onClick land before the list unmounts.
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={onInputKeyDown}
            placeholder="Search the canvas…"
            aria-label="Search specifications and facets on the canvas"
            className="min-w-0 flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                inputRef.current?.focus()
              }}
              aria-label="Clear search"
              className="flex-shrink-0 rounded p-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="pointer-events-none hidden flex-shrink-0 select-none rounded border border-border bg-muted px-1 font-mono text-[9px] text-muted-foreground sm:inline">
              /
            </kbd>
          )}
        </div>

        {(showResults || showEmpty) && (
          <div className="border-t border-border/60 bg-popover/95">
            <div className="flex items-center justify-between px-2.5 py-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
                {query.trim() ? "Results" : `Specifications (${specCount})`}
              </span>
              {results.length >= MAX_RESULTS && (
                <span className="text-[9px] text-muted-foreground">first {MAX_RESULTS}</span>
              )}
            </div>
            <div ref={listRef} className="max-h-[320px] overflow-y-auto px-1 pb-1.5">
              {showEmpty ? (
                <div className="px-2 py-3 text-center text-[11px] text-muted-foreground">
                  No matches for “{query.trim()}”
                </div>
              ) : (
                results.map((item, idx) => {
                  const meta = TYPE_META[item.type] ?? TYPE_META.spec
                  const facet = FACET_COLORS[item.type as FacetType]
                  const Icon = meta.Icon
                  const active = idx === highlight
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-idx={idx}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => locate(item.id)}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                        active ? "bg-foreground/[0.07]" : "hover:bg-foreground/[0.05]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded",
                          facet?.iconBg ?? "bg-primary/10"
                        )}
                      >
                        <Icon className={cn("h-3 w-3", facet?.text ?? "text-primary")} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs leading-tight text-foreground">
                          {item.primary}
                        </div>
                        {item.detail ? (
                          <div className="truncate text-[10px] leading-tight text-muted-foreground">
                            {item.detail}
                          </div>
                        ) : null}
                      </div>
                      {item.type !== "spec" && (
                        <span className="flex-shrink-0 text-[9px] uppercase tracking-wide text-muted-foreground/70">
                          {meta.label}
                        </span>
                      )}
                      {active && (
                        <CornerDownLeft className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
