#!/usr/bin/env node
// Generate the valid-IDS-dataType allowlist per IFC schema version, directly
// from the official buildingSMART IDS specification table.
//
// Source of truth (committed alongside this script for provenance):
//   scripts/ids-datatypes.md
//   = buildingSMART/IDS · Documentation/ImplementersDocumentation/DataTypes.md
//     https://github.com/buildingSMART/IDS/blob/development/Documentation/ImplementersDocumentation/DataTypes.md
//
// Why this exists: IDS property `dataType` is OPTIONAL, but when present it must
// be one of the values in this table for the chosen schema version (uppercase).
// The IDS schema does NOT check that a dataType is the "right" one for a given
// property — only that it is a member of this list. Our previous hand-curated
// 64-type list omitted valid measure subtypes (e.g. IFCPOSITIVELENGTHMEASURE),
// which produced false "invalid datatype" results. See issues #48 / #52.
//
// Run with:  node scripts/generate-ids-datatypes.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

const SOURCE = join(__dirname, 'ids-datatypes.md')

// Spec column header -> our generated filename suffix.
const VERSIONS = [
  { col: 1, suffix: 'ifc2x3' },
  { col: 2, suffix: 'ifc4' },
  { col: 3, suffix: 'ifc4x3_add2' },
]

const OUT_DIRS = [
  join(repoRoot, 'lib', 'generated', 'ifc-schema'),
  join(repoRoot, 'public', 'generated'),
]

// Reference / object-value datatypes that the official DataTypes.md table does
// NOT list, but which the buildingSMART IDS-Audit-Tool nonetheless accepts as a
// property `dataType` — because standard IFC property-set templates declare
// properties of these types (e.g. Pset_ManufacturerTypeInformation.
// PerformanceCertificate is an IfcDocumentReference, OperationalDocument is an
// IfcExternalReference). These are the entity/reference value types carried by
// IfcPropertyReferenceValue et al., so they never appear in the "simple value"
// DataTypes table, yet a valid IDS may legitimately use them (see issue #58 —
// a BIMQ-exported, officially-valid IFC4X3 file was flagged with 81 false
// "Invalid IFC data type" errors solely because these were missing here).
//
// The set below was derived from the authoritative pset templates embedded in
// the IDS-Audit-Tool (ids-lib · SchemaInfo.Properties.g.cs): for each schema
// version it is exactly the datatypes referenced by that version's standard
// property templates that are absent from the general DataTypes.md list. They
// have no xs restriction base type (you cannot xs:restrict a reference value),
// so `baseType` is empty; `lib/ifc-schema.ts` classifies them in a dedicated
// "reference" value category so they never trigger a datatype recommendation.
const REFERENCE_DATA_TYPES = {
  ifc2x3: [],
  ifc4: [
    'IFCCOMPLEXNUMBER',
    'IFCEXTERNALREFERENCE',
    'IFCMATERIALDEFINITION',
    'IFCPERSON',
    'IFCTIMESERIES',
    'IFCVALUE',
  ],
  ifc4x3_add2: [
    'IFCCOMPLEXNUMBER',
    'IFCCOSTVALUE',
    'IFCDOCUMENTREFERENCE',
    'IFCEXTERNALREFERENCE',
    'IFCMATERIALDEFINITION',
    'IFCPERSON',
    'IFCTIMESERIES',
  ],
}

// Human descriptions for the reference datatypes above.
const REFERENCE_DATA_TYPE_DESCRIPTIONS = {
  IFCCOMPLEXNUMBER: 'Complex number (reference value)',
  IFCCOSTVALUE: 'Cost value reference',
  IFCDOCUMENTREFERENCE: 'Reference to an external document',
  IFCEXTERNALREFERENCE: 'Reference to an external source (classification, document or library)',
  IFCMATERIALDEFINITION: 'Reference to a material definition',
  IFCPERSON: 'Reference to a person',
  IFCTIMESERIES: 'Reference to a time series',
  IFCVALUE: 'Any IFC value (measure, simple or derived value)',
}

/** Parse the markdown dataType table into rows. */
function parseTable(md) {
  const rows = []
  for (const line of md.split('\n')) {
    // Only the dataType table rows: "| IFCSOMETHING | ✓ | | ✓ | xs:double |"
    const m = line.match(/^\|\s*(IFC[A-Z0-9]+)\s*\|(.*)\|\s*$/)
    if (!m) continue
    const name = m[1].trim()
    const cells = m[2].split('|').map((c) => c.trim())
    if (cells.length < 4) continue
    const valid = cells.slice(0, 3).map((c) => c.includes('✓'))
    // Guard against accidentally matching a different table: version cells must
    // be either a checkmark or empty.
    const versionCellsClean = cells
      .slice(0, 3)
      .every((c) => c === '' || c.includes('✓'))
    if (!versionCellsClean) continue
    if (!valid.some(Boolean)) continue
    const baseType = (cells[3] || '').trim()
    rows.push({ name, valid, baseType })
  }
  return rows
}

/** Harvest curated human descriptions from the existing generated files. */
function harvestDescriptions() {
  const map = new Map()
  for (const dir of OUT_DIRS) {
    for (const { suffix } of VERSIONS) {
      const file = join(dir, `simple-types-${suffix}.json`)
      if (!existsSync(file)) continue
      try {
        const arr = JSON.parse(readFileSync(file, 'utf8'))
        for (const t of arr) {
          if (t?.name && t?.description && !map.has(t.name)) {
            map.set(t.name.toUpperCase(), t.description)
          }
        }
      } catch {
        /* ignore malformed pre-existing file */
      }
    }
  }
  return map
}

function fallbackDescription(name, baseType) {
  if (name.endsWith('ENUM')) return 'Enumeration value'
  switch (baseType) {
    case 'xs:double':
      return name.endsWith('MEASURE') ? 'Measure value (decimal)' : 'Decimal value'
    case 'xs:integer':
      return 'Integer value'
    case 'xs:boolean':
      return 'Boolean value'
    case 'xs:date':
    case 'xs:dateTime':
    case 'xs:time':
    case 'xs:duration':
      return 'Date/time value'
    case 'xs:string':
      return 'Text or identifier value'
    case '':
    case undefined:
      return 'Binary value'
    default:
      return `${baseType} value`
  }
}

function main() {
  const md = readFileSync(SOURCE, 'utf8')
  const rows = parseTable(md)
  if (rows.length < 100) {
    throw new Error(`Parsed only ${rows.length} dataType rows — source table looks wrong`)
  }
  const descriptions = harvestDescriptions()

  for (const { col, suffix } of VERSIONS) {
    const idx = col - 1
    const list = rows
      .filter((r) => r.valid[idx])
      .map((r) => ({
        name: r.name,
        baseType: r.baseType,
        description: descriptions.get(r.name) || fallbackDescription(r.name, r.baseType),
      }))

    // Union in the reference/object-value datatypes for this schema version
    // (see REFERENCE_DATA_TYPES above). Skip any that the table already lists.
    const existing = new Set(list.map((t) => t.name))
    let refAdded = 0
    for (const name of REFERENCE_DATA_TYPES[suffix] || []) {
      if (existing.has(name)) continue
      list.push({
        name,
        baseType: '',
        description:
          descriptions.get(name) ||
          REFERENCE_DATA_TYPE_DESCRIPTIONS[name] ||
          'Reference value',
        // Marks a value carried by reference (IfcPropertyReferenceValue et al.),
        // not a restrictable simple value. Consumed by lib/ifc-schema.ts to keep
        // these out of the numeric/string/… compatibility categories.
        category: 'reference',
      })
      existing.add(name)
      refAdded++
    }
    // Keep the file stably sorted by name so diffs stay minimal on regen.
    list.sort((a, b) => a.name.localeCompare(b.name))

    const json = JSON.stringify(list, null, 2) + '\n'
    for (const dir of OUT_DIRS) {
      writeFileSync(join(dir, `simple-types-${suffix}.json`), json)
    }
    const hasPos = list.some((t) => t.name === 'IFCPOSITIVELENGTHMEASURE')
    console.log(
      `  ${suffix}: ${list.length} datatypes (${refAdded} reference types added; IFCPOSITIVELENGTHMEASURE: ${hasPos ? 'yes' : 'NO'})`,
    )
  }
  console.log(`Done. Parsed ${rows.length} rows from ${SOURCE}`)
}

main()
