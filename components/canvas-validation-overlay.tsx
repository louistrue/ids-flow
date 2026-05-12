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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ValidationState } from "@/lib/use-ids-validation"
import type { ValidationIssue } from "@/lib/ids-client-validation"

interface CanvasValidationOverlayProps {
  validationState: ValidationState
  isValidating: boolean
  isDisabled: boolean
  onValidateNow?: () => void
}

type OverlayStatus = "idle" | "loading" | "valid" | "warning" | "error"

interface DisplayIssue {
  severity: "error" | "warning"
  message: string
  detail?: string
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
  }))

  // Surface server / parser failures as errors
  if (validationState.status === "error") {
    issues.unshift({
      severity: "error",
      message: validationState.error || "Validation failed",
    })
  } else if (
    validationState.result &&
    validationState.result.status !== 0
  ) {
    issues.unshift({
      severity: "error",
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
    label: "Validating…",
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

export function CanvasValidationOverlay({
  validationState,
  isValidating,
  isDisabled,
  onValidateNow,
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

  const summary = (() => {
    if (status === "loading") return "Validating…"
    if (status === "idle" && !validationState.lastValidated)
      return "Waiting for content"
    if (status === "valid") return "IDS is valid"
    if (status === "warning")
      return `${warningCount} warning${warningCount === 1 ? "" : "s"}`
    if (status === "error") {
      const parts: string[] = []
      if (errorCount) parts.push(`${errorCount} error${errorCount === 1 ? "" : "s"}`)
      if (warningCount)
        parts.push(`${warningCount} warning${warningCount === 1 ? "" : "s"}`)
      return parts.join(" · ")
    }
    return meta.label
  })()

  return (
    <Panel position="top-right" className="!m-3 !p-0">
      <div
        className={cn(
          "min-w-[180px] max-w-[340px] rounded-lg border shadow-lg backdrop-blur",
          "transition-colors duration-200",
          meta.pillClass
        )}
      >
        <button
          type="button"
          onClick={() => issues.length > 0 && setExpanded((v) => !v)}
          disabled={issues.length === 0}
          className={cn(
            "flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg",
            "text-left",
            issues.length > 0 && "hover:bg-foreground/5 cursor-pointer",
            issues.length === 0 && "cursor-default"
          )}
          aria-expanded={expanded}
          aria-label={`IDS validation: ${summary}`}
          title={summary}
        >
          <span
            className={cn(
              "relative inline-flex h-2.5 w-2.5 rounded-full ring-4",
              meta.dotClass,
              meta.ringClass
            )}
          >
            {status === "loading" && (
              <span className="absolute inset-0 inline-flex h-full w-full animate-ping rounded-full bg-blue-500/70" />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground leading-tight truncate">
              {meta.label}
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight truncate">
              {summary}
              {lastValidatedLabel && status !== "loading" ? (
                <> · {lastValidatedLabel}</>
              ) : null}
            </div>
          </div>
          {issues.length > 0 ? (
            expanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )
          ) : null}
        </button>

        {expanded && issues.length > 0 ? (
          <div className="border-t border-border/60 max-h-[280px] overflow-y-auto">
            <ul className="py-1">
              {issues.map((issue, idx) => (
                <li
                  key={idx}
                  className={cn(
                    "flex items-start gap-2 px-2.5 py-1.5 text-[11px] leading-snug",
                    "border-b border-border/30 last:border-b-0"
                  )}
                >
                  {issue.severity === "error" ? (
                    <XCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-500" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        issue.severity === "error"
                          ? "text-red-600 dark:text-red-400"
                          : "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {issue.message}
                    </div>
                    {issue.detail ? (
                      <div className="mt-0.5 text-muted-foreground font-mono text-[10px] break-words">
                        {issue.detail}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            {onValidateNow ? (
              <div className="border-t border-border/40 p-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onValidateNow}
                  disabled={isValidating || isDisabled}
                  className="h-6 w-full justify-center gap-1.5 text-[11px]"
                >
                  {isValidating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  Re-validate
                </Button>
              </div>
            ) : null}
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
