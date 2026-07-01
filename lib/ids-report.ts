// Human-readable IDS report (#60).
//
// Turns an IDS XML document (the canonical output of convertGraphToIdsXml) into
// a self-contained, print-ready HTML document: a cover with the general
// information, then one page per specification describing its applicability and
// requirements in plain language. Intended to be opened in a new tab and saved
// to PDF (via the browser's print dialog) so it can be attached to EIRs / BEPs,
// the way IfcTester produces a readable report.
//
// It parses the exported XML rather than the editor graph so the report always
// matches exactly what gets validated and shared.

import { XMLParser } from "fast-xml-parser"

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
})

function toArray<T>(x: unknown): T[] {
  if (x === undefined || x === null) return []
  return Array.isArray(x) ? (x as T[]) : [x as T]
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// ---- Value-constraint description (simpleValue | xs:restriction) ----

interface Restriction {
  base?: string
  enumeration?: unknown
  pattern?: unknown
  minInclusive?: { value?: string }
  maxInclusive?: { value?: string }
  minExclusive?: { value?: string }
  maxExclusive?: { value?: string }
  minLength?: { value?: string }
  maxLength?: { value?: string }
  length?: { value?: string }
}

function describeRestriction(r: Restriction): string {
  const parts: string[] = []

  const enums = toArray<{ value?: string }>(r.enumeration)
    .map((e) => e?.value)
    .filter((v): v is string => v != null)
  if (enums.length) {
    parts.push(enums.length === 1 ? `“${enums[0]}”` : `one of: ${enums.join(", ")}`)
  }

  const patterns = toArray<{ value?: string }>(r.pattern)
    .map((p) => p?.value)
    .filter((v): v is string => v != null)
  for (const p of patterns) {
    // The converter emits ".+" as the "match any non-empty value" sentinel.
    parts.push(p === ".+" ? "any value" : `matching pattern <code>${esc(p)}</code>`)
  }

  const min = r.minInclusive?.value ?? r.minExclusive?.value
  const max = r.maxInclusive?.value ?? r.maxExclusive?.value
  if (min != null && max != null) parts.push(`between ${esc(min)} and ${esc(max)}`)
  else if (min != null) parts.push(`≥ ${esc(min)}`)
  else if (max != null) parts.push(`≤ ${esc(max)}`)

  const minLen = r.minLength?.value
  const maxLen = r.maxLength?.value
  const exactLen = r.length?.value
  if (exactLen != null) parts.push(`exactly ${esc(exactLen)} characters`)
  else if (minLen != null && maxLen != null) parts.push(`${esc(minLen)}–${esc(maxLen)} characters`)
  else if (minLen != null) parts.push(`at least ${esc(minLen)} characters`)
  else if (maxLen != null) parts.push(`at most ${esc(maxLen)} characters`)

  return parts.length ? parts.join(", ") : "any value"
}

// A "value slot" is an element like <ids:name>/<ids:value>/<ids:system> that
// holds either an <ids:simpleValue> or an <xs:restriction>.
function describeSlot(slot: unknown): string {
  if (slot == null) return "any"
  if (typeof slot === "string") return slot === "" ? "any" : esc(slot)
  const s = slot as { simpleValue?: unknown; restriction?: Restriction }
  if (s.simpleValue != null && s.simpleValue !== "") return esc(s.simpleValue)
  if (s.restriction) return describeRestriction(s.restriction)
  return "any"
}

// Whether a slot carries any content at all.
function slotIsConstrained(slot: unknown): boolean {
  if (slot == null) return false
  if (typeof slot === "string") return slot !== ""
  const s = slot as { simpleValue?: unknown; restriction?: unknown }
  return (s.simpleValue != null && s.simpleValue !== "") || s.restriction != null
}

// The converter emits a lone ".+" pattern as the "match anything" sentinel
// (e.g. a required-but-unconstrained classification system). Treat such a slot
// as "any" so the prose doesn't read "in system any value".
function isWildcardSlot(slot: unknown): boolean {
  if (slot == null || typeof slot === "string") return false
  const r = (slot as { restriction?: Restriction }).restriction
  if (!r) return false
  const patterns = toArray<{ value?: string }>(r.pattern).map((p) => p?.value)
  const onlyDotPlus = patterns.length > 0 && patterns.every((v) => v === ".+")
  const nothingElse =
    !r.enumeration &&
    !r.minInclusive &&
    !r.maxInclusive &&
    !r.minExclusive &&
    !r.maxExclusive &&
    !r.minLength &&
    !r.maxLength &&
    !r.length
  return onlyDotPlus && nothingElse
}

// A slot that pins down a real value (has content and isn't the ".+" wildcard).
function slotHasValue(slot: unknown): boolean {
  return slotIsConstrained(slot) && !isWildcardSlot(slot)
}

// ---- Facet descriptions ----

type FacetKind = "entity" | "attribute" | "property" | "classification" | "material" | "partOf"

interface DescribedFacet {
  kind: FacetKind
  label: string
  text: string
  cardinality?: string
  instructions?: string
}

const FACET_LABEL: Record<FacetKind, string> = {
  entity: "Entity",
  attribute: "Attribute",
  property: "Property",
  classification: "Classification",
  material: "Material",
  partOf: "Part of",
}

function describeEntityFacet(f: any): string {
  const name = describeSlot(f?.name)
  if (f?.predefinedType && slotHasValue(f.predefinedType)) {
    return `<strong>${name}</strong> · predefined type ${describeSlot(f.predefinedType)}`
  }
  return `<strong>${name}</strong>`
}

function describeFacet(kind: FacetKind, f: any): DescribedFacet {
  let text = ""
  switch (kind) {
    case "entity":
      text = describeEntityFacet(f)
      break
    case "attribute": {
      const name = describeSlot(f?.name)
      text = slotHasValue(f?.value)
        ? `<strong>${name}</strong> = ${describeSlot(f.value)}`
        : `<strong>${name}</strong> is present`
      break
    }
    case "property": {
      const base = describeSlot(f?.baseName)
      const pset = describeSlot(f?.propertySet)
      const bits = [`<strong>${base}</strong> in property set <strong>${pset}</strong>`]
      if (f?.dataType) bits.push(`type ${esc(f.dataType)}`)
      if (slotHasValue(f?.value)) bits.push(`value ${describeSlot(f.value)}`)
      text = bits.join(" · ")
      break
    }
    case "classification": {
      const value = slotHasValue(f?.value) ? describeSlot(f.value) : null
      const system = slotHasValue(f?.system) ? describeSlot(f.system) : null
      if (value && system) text = `reference <strong>${value}</strong> in system <strong>${system}</strong>`
      else if (value) text = `reference <strong>${value}</strong> (any system)`
      else if (system) text = `any reference in system <strong>${system}</strong>`
      else text = "any classification reference"
      break
    }
    case "material":
      text = slotHasValue(f?.value)
        ? `<strong>${describeSlot(f.value)}</strong>`
        : "any material"
      break
    case "partOf": {
      const entName = describeSlot(f?.entity?.name)
      text = `<strong>${entName}</strong>`
      if (f?.relation) text += ` · via ${esc(f.relation)}`
      break
    }
  }
  return {
    kind,
    label: FACET_LABEL[kind],
    text,
    cardinality: f?.cardinality,
    instructions: f?.instructions,
  }
}

const FACET_KINDS: FacetKind[] = [
  "entity",
  "attribute",
  "property",
  "classification",
  "material",
  "partOf",
]

function describeFacetContainer(container: any): DescribedFacet[] {
  if (!container) return []
  const out: DescribedFacet[] = []
  for (const kind of FACET_KINDS) {
    for (const f of toArray<any>(container[kind])) {
      out.push(describeFacet(kind, f))
    }
  }
  return out
}

// ---- Cardinality badge ----

function cardinalityBadge(c?: string): string {
  const value = (c || "required").toLowerCase()
  const cls =
    value === "prohibited" ? "prohibited" : value === "optional" ? "optional" : "required"
  return `<span class="card card-${cls}">${esc(value)}</span>`
}

// ---- HTML building ----

function facetRow(f: DescribedFacet, showCardinality: boolean): string {
  return `
    <li class="facet facet-${f.kind}">
      <span class="facet-kind">${esc(f.label)}</span>
      <span class="facet-text">${f.text}</span>
      ${showCardinality ? cardinalityBadge(f.cardinality) : ""}
      ${f.instructions ? `<div class="facet-instructions">${esc(f.instructions)}</div>` : ""}
    </li>`
}

function facetList(facets: DescribedFacet[], showCardinality: boolean, empty: string): string {
  if (facets.length === 0) return `<p class="muted">${esc(empty)}</p>`
  return `<ul class="facets">${facets.map((f) => facetRow(f, showCardinality)).join("")}</ul>`
}

function metaRow(label: string, value?: string): string {
  if (!value) return ""
  return `<div class="meta-row"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`
}

function ifcVersionLabel(v?: string): string {
  if (!v) return ""
  return v.replace(/_/g, " ")
}

function specSection(spec: any, index: number): string {
  const name = spec?.name || `Specification ${index + 1}`
  const appl = describeFacetContainer(spec?.applicability)
  const reqs = describeFacetContainer(spec?.requirements)
  const applEmptyNote = "Applies to every element in the model."
  const reqDescription = spec?.requirements?.description

  return `
  <section class="spec">
    <header class="spec-header">
      <div class="spec-index">Specification ${index + 1}</div>
      <h2>${esc(name)}</h2>
      <dl class="meta">
        ${metaRow("Identifier", spec?.identifier)}
        ${metaRow("IFC version", ifcVersionLabel(spec?.ifcVersion))}
        ${metaRow("Instructions", spec?.instructions)}
      </dl>
    </header>

    <div class="block">
      <h3>Applicability</h3>
      <p class="lead">This specification applies to elements that match:</p>
      ${facetList(appl, false, applEmptyNote)}
    </div>

    <div class="block">
      <h3>Requirements</h3>
      <p class="lead">Matching elements must satisfy:</p>
      ${reqDescription ? `<p class="muted">${esc(reqDescription)}</p>` : ""}
      ${facetList(reqs, true, "No requirements defined.")}
    </div>
  </section>`
}

const STYLES = `
  :root {
    --ink: #1a1d21; --muted: #667085; --line: #e4e7ec; --bg: #ffffff;
    --accent: #6d5ae6; --req: #16a34a; --opt: #d97706; --pro: #dc2626;
    --chip: #f2f4f7;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--ink); background: #f5f6f8; line-height: 1.5; font-size: 14px;
  }
  .toolbar {
    position: sticky; top: 0; z-index: 10; display: flex; gap: 8px; align-items: center;
    justify-content: flex-end; padding: 10px 16px; background: #fff; border-bottom: 1px solid var(--line);
  }
  .toolbar .title { margin-right: auto; font-weight: 600; }
  .btn {
    font: inherit; font-weight: 600; cursor: pointer; border: 1px solid var(--line);
    background: var(--accent); color: #fff; border-color: var(--accent);
    border-radius: 8px; padding: 8px 14px;
  }
  .btn.secondary { background: #fff; color: var(--ink); }
  .page {
    max-width: 820px; margin: 24px auto; background: var(--bg);
    box-shadow: 0 1px 3px rgba(16,24,40,.1); border: 1px solid var(--line);
    border-radius: 12px; overflow: hidden;
  }
  .cover { padding: 48px 56px; }
  .cover .eyebrow { color: var(--accent); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; font-size: 11px; }
  .cover h1 { font-size: 28px; margin: 8px 0 4px; line-height: 1.2; }
  .cover .subtitle { color: var(--muted); margin: 0 0 24px; }
  dl.meta { display: grid; grid-template-columns: max-content 1fr; gap: 4px 20px; margin: 0; }
  .meta-row { display: contents; }
  dl.meta dt { color: var(--muted); font-weight: 500; }
  dl.meta dd { margin: 0; }
  .summary { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--line); color: var(--muted); }
  .spec { padding: 40px 56px; }
  .spec + .spec { border-top: 1px solid var(--line); }
  .spec-header { margin-bottom: 20px; }
  .spec-index { color: var(--accent); font-weight: 700; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
  .spec-header h2 { margin: 4px 0 12px; font-size: 20px; }
  .block { margin: 22px 0; }
  .block h3 { font-size: 13px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin: 0 0 6px; }
  .lead { margin: 0 0 10px; }
  .muted { color: var(--muted); }
  ul.facets { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
  li.facet {
    display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
    padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; background: #fcfcfd;
  }
  .facet-kind {
    flex: 0 0 auto; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
    color: var(--muted); min-width: 84px;
  }
  .facet-text { flex: 1 1 auto; min-width: 200px; }
  .facet-text code { background: var(--chip); padding: 1px 5px; border-radius: 4px; font-size: 12px; }
  .facet-instructions { flex-basis: 100%; color: var(--muted); font-size: 12.5px; font-style: italic; margin-top: 2px; }
  .card { flex: 0 0 auto; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; }
  .card-required { color: var(--req); background: rgba(22,163,74,.1); }
  .card-optional { color: var(--opt); background: rgba(217,119,6,.1); }
  .card-prohibited { color: var(--pro); background: rgba(220,38,38,.1); }
  .doc-footer { color: var(--muted); font-size: 12px; text-align: center; margin: 24px auto 48px; }
  @media print {
    body { background: #fff; font-size: 11.5px; }
    .toolbar { display: none; }
    .page { box-shadow: none; border: none; border-radius: 0; margin: 0; max-width: none; }
    .spec { break-before: page; page-break-before: always; }
    .cover { padding: 0 0 24px; }
    .spec { padding: 24px 0; }
    .spec + .spec { border-top: none; }
    li.facet { break-inside: avoid; page-break-inside: avoid; }
    .doc-footer { margin: 12px 0; }
    @page { margin: 18mm 16mm; }
  }
`

export interface IdsReportOptions {
  /** ISO timestamp for the "generated" line; pass from the caller (Date is fine there). */
  generatedAt?: string
}

/**
 * Build a standalone, print-ready HTML report from an IDS XML string.
 * The returned string is a full HTML document (open it in a new tab / save as PDF).
 */
export function generateIdsReportHtml(xml: string, options: IdsReportOptions = {}): string {
  const parsed = parser.parse(xml)
  const ids = parsed?.ids ?? {}
  const info = ids.info ?? {}
  const specs = toArray<any>(ids.specifications?.specification)

  const title = info.title || specs[0]?.name || "IDS Specification"
  const facetTotal = specs.reduce((sum, s) => {
    return (
      sum +
      describeFacetContainer(s?.applicability).length +
      describeFacetContainer(s?.requirements).length
    )
  }, 0)

  const generatedLine = options.generatedAt
    ? `Generated ${esc(options.generatedAt)}`
    : "Generated with IDSedit"

  const cover = `
  <div class="page">
    <div class="cover">
      <div class="eyebrow">Information Delivery Specification</div>
      <h1>${esc(title)}</h1>
      ${info.description ? `<p class="subtitle">${esc(info.description)}</p>` : ""}
      <dl class="meta">
        ${metaRow("Version", info.version)}
        ${metaRow("Author", info.author)}
        ${metaRow("Date", info.date)}
        ${metaRow("Purpose", info.purpose)}
        ${metaRow("Milestone", info.milestone)}
        ${metaRow("Copyright", info.copyright)}
      </dl>
      <div class="summary">
        ${specs.length} specification${specs.length === 1 ? "" : "s"} · ${facetTotal} facet${facetTotal === 1 ? "" : "s"}
      </div>
    </div>
  </div>`

  const specPages = specs
    .map((spec, i) => `<div class="page">${specSection(spec, i)}</div>`)
    .join("\n")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)} — IDS report</title>
  <style>${STYLES}</style>
</head>
<body>
  <div class="toolbar">
    <span class="title">${esc(title)}</span>
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  ${cover}
  ${specPages}
  <div class="doc-footer">${generatedLine} · buildingSMART IDS · ${esc(specs.length)} specification${specs.length === 1 ? "" : "s"}</div>
</body>
</html>`
}
