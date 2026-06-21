"use client"

import { useMemo, useState } from "react"
import { Panel } from "@xyflow/react"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Locate,
  Download,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ValidationState } from "@/lib/use-ids-validation"
import type { ValidationIssue, ValidationCategory } from "@/lib/ids-client-validation"
import type { IFCVersion } from "@/lib/ifc-schema"

interface CanvasValidationOverlayProps {
  validationState: ValidationState
  isValidating: boolean
  isDisabled: boolean
  ifcVersion?: IFCVersion
  onValidateNow?: () => void
  /** Jump to + select the node a validation issue points at. */
  onIssueSelect?: (nodeId: string, field?: string) => void
}

type OverlayStatus = "idle" | "loading" | "valid" | "warning" | "error"

interface DisplayIssue {
  severity: "error" | "warning"
  message: string
  category: ValidationCategory
  detail?: string
  // Carried through from the client-side ValidationIssue so each row can link
  // back to its node. Absent for parser/structure errors that aren't mapped.
  nodeId?: string
  field?: string
}

// The report is split the same way the official buildingSMART IDS Audit Tool
// splits it: IDS-schema conformance vs IFC-schema conformance, plus our own
// non-binding hints. See #50.
const CATEGORY_ORDER: ValidationCategory[] = ["ids-schema", "ifc-audit", "recommendation"]
const CATEGORY_LABELS: Record<ValidationCategory, string> = {
  "ids-schema": "IDS schema validation",
  "ifc-audit": "IFC schema audit",
  recommendation: "Recommendations",
}

function ifcVersionLabel(v?: IFCVersion): string {
  switch (v) {
    case "IFC4X3_ADD2":
      return "IFC4X3 ADD2"
    case "IFC4":
      return "IFC4"
    case "IFC2X3":
      return "IFC2X3"
    default:
      return "unknown"
  }
}

function deriveStatus(
  validationState: ValidationState,
  isValidating: boolean,
  isDisabled: boolean
): { status: OverlayStatus; issues: DisplayIssue[] } {
  if (isDisabled) return { status: "idle", issues: [] }
  if (isValidating) return { status: "loading", issues: [] }

  const clientIssues = (validationState.clientIssues ?? []) as ValidationIssue[]
  const issues: DisplayIssue[] = clientIssues.map((i) => ({
    severity: i.severity,
    message: i.message,
    category: i.category,
    nodeId: i.nodeId,
    field: i.field,
  }))

  // Surface server / parser failures as errors, but only when they aren't
  // already itemized as client issues. On client-side failure, validationState
  // .error is just those same issues joined into a string, so unshifting it
  // would duplicate every row. Parser / structure failures are IDS-schema issues.
  const hasClientErrors = clientIssues.some((i) => i.severity === "error")
  if (validationState.status === "error" && !hasClientErrors) {
    issues.unshift({
      severity: "error",
      category: "ids-schema",
      message: validationState.error || "Validation failed",
    })
  } else if (validationState.result && validationState.result.status !== 0) {
    issues.unshift({
      severity: "error",
      category: "ids-schema",
      message: validationState.result.message,
      detail: validationState.result.details,
    })
  }

  if (validationState.status === "idle" && issues.length === 0) {
    return { status: "idle", issues }
  }

  const hasErrors = issues.some((i) => i.severity === "error")
  const hasWarnings = issues.some((i) => i.severity === "warning")
  if (hasErrors) return { status: "error", issues }
  if (hasWarnings) return { status: "warning", issues }
  return { status: "valid", issues }
}

function toCsv(issues: DisplayIssue[]): string {
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`
  const header = ["Severity", "Category", "Message", "Node", "Field"]
  const rows = issues.map((i) =>
    [i.severity, CATEGORY_LABELS[i.category], i.message, i.nodeId || "", i.field || ""]
      .map((c) => esc(String(c)))
      .join(",")
  )
  return [header.map(esc).join(","), ...rows].join("\r\n")
}

function downloadCsv(issues: DisplayIssue[]) {
  const blob = new Blob([toCsv(issues)], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "ids-validation-report.csv"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const STATUS_META: Record<
  OverlayStatus,
  {
    label: string
    dotClass: string
    ringClass: string
    pillClass: string
    Icon: React.ComponentType<{ className?: string }>
  }
> = {
  idle: {
    label: "Add a specification",
    dotClass: "bg-muted-foreground",
    ringClass: "ring-muted-foreground/20",
    pillClass: "border-border bg-card/90",
    Icon: Sparkles,
  },
  loading: {
    label: "Validating",
    dotClass: "bg-blue-500",
    ringClass: "ring-blue-500/30",
    pillClass: "border-blue-500/40 bg-blue-500/10",
    Icon: Loader2,
  },
  valid: {
    label: "Valid IDS",
    dotClass: "bg-green-500",
    ringClass: "ring-green-500/30",
    pillClass: "border-green-500/40 bg-green-500/10",
    Icon: CheckCircle2,
  },
  warning: {
    label: "Warnings",
    dotClass: "bg-amber-500",
    ringClass: "ring-amber-500/30",
    pillClass: "border-amber-500/40 bg-amber-500/10",
    Icon: AlertCircle,
  },
  error: {
    label: "Invalid IDS",
    dotClass: "bg-red-500",
    ringClass: "ring-red-500/30",
    pillClass: "border-red-500/40 bg-red-500/10",
    Icon: XCircle,
  },
}

// Count chip tint by the worst severity in a section.
function chipClass(hasError: boolean, hasWarning: boolean): string {
  if (hasError) return "bg-red-500/12 text-red-600 dark:text-red-400"
  if (hasWarning) return "bg-amber-500/12 text-amber-600 dark:text-amber-400"
  return "bg-foreground/8 text-muted-foreground"
}

export function CanvasValidationOverlay({
  validationState,
  isValidating,
  isDisabled,
  ifcVersion,
  onValidateNow,
  onIssueSelect,
}: CanvasValidationOverlayProps) {
  const [expanded, setExpanded] = useState(false)

  const { status, issues } = useMemo(
    () => deriveStatus(validationState, isValidating, isDisabled),
    [validationState, isValidating, isDisabled]
  )

  const meta = STATUS_META[status]
  const errorCount = issues.filter((i) => i.severity === "error").length
  const warningCount = issues.filter((i) => i.severity === "warning").length
  const lastValidatedLabel = validationState.lastValidated
    ? formatRelativeTime(validationState.lastValidated)
    : null

  // The panel is expandable whenever a validation has run, so the engine info
  // and CSV export stay reachable even when the file is valid. See #49.
  const hasRun = status !== "idle" && status !== "loading"

  const summary = (() => {
    if (status === "loading") return "Validating"
    if (status === "idle" && !validationState.lastValidated) return "Waiting for content"
    if (status === "valid") return "IDS is valid"
    if (status === "warning")
      return `${warningCount} warning${warningCount === 1 ? "" : "s"}`
    if (status === "error") {
      const parts: string[] = []
      if (errorCount) parts.push(`${errorCount} error${errorCount === 1 ? "" : "s"}`)
      if (warningCount) parts.push(`${warningCount} warning${warningCount === 1 ? "" : "s"}`)
      return parts.join(" · ")
    }
    return meta.label
  })()

  return (
    <Panel position="top-right" className="!m-3 !p-0">
      <div
        className={cn(
          "min-w-[200px] max-w-[360px] overflow-hidden rounded-xl border shadow-lg backdrop-blur",
          "transition-colors duration-200",
          meta.pillClass
        )}
      >
        <button
          type="button"
          onClick={() => hasRun && setExpanded((v) => !v)}
          disabled={!hasRun}
          className={cn(
            "flex w-full items-center gap-2.5 px-3 py-2 text-left",
            hasRun && "cursor-pointer hover:bg-foreground/5",
            !hasRun && "cursor-default"
          )}
          aria-expanded={expanded}
          aria-label={`IDS validation: ${summary}`}
          title={summary}
        >
          <span
            className={cn(
              "relative inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full ring-4",
              meta.dotClass,
              meta.ringClass
            )}
          >
            {status === "loading" && (
              <span className="absolute inset-0 inline-flex h-full w-full animate-ping rounded-full bg-blue-500/70" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold leading-tight text-foreground">
              {meta.label}
            </div>
            <div className="truncate text-[10px] leading-tight text-muted-foreground">
              {summary}
              {lastValidatedLabel && status !== "loading" ? <> · {lastValidatedLabel}</> : null}
            </div>
          </div>
          {hasRun ? (
            expanded ? (
              <ChevronUp className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            )
          ) : null}
        </button>

        {expanded && hasRun ? (
          // Neutral surface so severity accents read clearly against the tinted header.
          <div className="border-t border-border/60 bg-popover/95">
            <div className="max-h-[300px] overflow-y-auto px-1.5 py-1.5">
              {issues.length === 0 ? (
                <div className="flex items-center gap-2 px-2 py-2 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                  Nothing to fix. Everything checks out.
                </div>
              ) : (
                CATEGORY_ORDER.map((category) => {
                  const sectionIssues = issues.filter((i) => i.category === category)
                  if (sectionIssues.length === 0) return null
                  const secHasError = sectionIssues.some((i) => i.severity === "error")
                  const secHasWarning = sectionIssues.some((i) => i.severity === "warning")
                  return (
                    <div key={category} className="mb-2 last:mb-0.5">
                      <div className="flex items-center gap-2 px-2 pb-1 pt-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
                          {CATEGORY_LABELS[category]}
                        </span>
                        <span
                          className={cn(
                            "ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
                            chipClass(secHasError, secHasWarning)
                          )}
                        >
                          {sectionIssues.length}
                        </span>
                      </div>
                      <ul className="space-y-0.5">
                        {sectionIssues.map((issue, idx) => {
                          const linkable = Boolean(issue.nodeId && onIssueSelect)
                          const isError = issue.severity === "error"
                          const body = (
                            <>
                              <span
                                aria-hidden
                                className={cn(
                                  "mt-0.5 w-0.5 self-stretch rounded-full",
                                  isError ? "bg-red-500/70" : "bg-amber-500/70"
                                )}
                              />
                              {isError ? (
                                <XCircle className="mt-px h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                              ) : (
                                <AlertCircle className="mt-px h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="text-foreground/90">{issue.message}</div>
                                {issue.detail ? (
                                  <div className="mt-0.5 break-words font-mono text-[10px] text-muted-foreground">
                                    {issue.detail}
                                  </div>
                                ) : null}
                              </div>
                              {linkable ? (
                                <Locate className="mt-px h-3.5 w-3.5 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                              ) : null}
                            </>
                          )
                          return (
                            <li key={idx}>
                              {linkable ? (
                                <button
                                  type="button"
                                  onClick={() => onIssueSelect!(issue.nodeId!, issue.field)}
                                  title="Go to node"
                                  aria-label={`Go to node: ${issue.message}`}
                                  className="group flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-[11px] leading-snug transition-colors hover:bg-foreground/[0.06]"
                                >
                                  {body}
                                </button>
                              ) : (
                                <div className="flex items-start gap-2 rounded-md px-2 py-1.5 text-[11px] leading-snug">
                                  {body}
                                </div>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center gap-1 border-t border-border/40 p-1.5">
              {onValidateNow ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onValidateNow}
                  disabled={isValidating || isDisabled}
                  className="h-7 flex-1 justify-center gap-1.5 text-[11px]"
                >
                  {isValidating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  Re-validate
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadCsv(issues)}
                disabled={issues.length === 0}
                className="h-7 flex-1 justify-center gap-1.5 text-[11px]"
                title="Export the report as CSV"
              >
                <Download className="h-3 w-3" />
                Export CSV
              </Button>

              {/* Transparency: what actually ran. Hover for details. See #49. */}
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="How this file is checked"
                      className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end" className="max-w-[260px] p-0">
                    <div className="space-y-1.5 p-2.5 text-[11px] leading-snug">
                      <p className="font-semibold text-foreground">How this file is checked</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>
                          <span className="font-medium text-foreground/80">IDS schema:</span>{" "}
                          structure parsed with <span className="font-mono">@ifc-lite/ids</span>.
                        </li>
                        <li>
                          <span className="font-medium text-foreground/80">IFC schema audit:</span>{" "}
                          IDSedit&apos;s own checks against the IFC schema.
                        </li>
                        <li>
                          <span className="font-medium text-foreground/80">Recommendations:</span>{" "}
                          hints only, not required by the standard.
                        </li>
                      </ul>
                      <p className="text-muted-foreground">
                        The official buildingSMART IDS Audit Tool is .NET, so it does not run in
                        the browser and is not used here.
                      </p>
                      <p className="border-t border-border/60 pt-1.5 font-mono text-[10px] text-muted-foreground">
                        IDS schema 1.0 · IFC {ifcVersionLabel(ifcVersion)}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  )
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 5) return "just now"
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleTimeString()
}
