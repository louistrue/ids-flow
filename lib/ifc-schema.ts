// IFC Schema definitions and validation with lazy loading

// Browser-compatible imports
const isServer = typeof window === 'undefined'

export type IFCVersion = "IFC2X3" | "IFC4" | "IFC4X3_ADD2"

export interface IFCEntity {
  name: string
  predefinedTypes?: string[]
  description?: string
}

export interface IFCProperty {
  name: string
  dataType: string
}

export interface IFCPropertySet {
  name: string
  properties: IFCProperty[]
  applicableEntities: string[]
}

export interface IFCDataType {
  name: string
  description: string
}

// Generated schema interfaces
interface IFCEntityDefinition {
  name: string
  category: string
  predefinedTypes: string[]
  attributes: { name: string; type: string; optional: boolean }[]
  supertype?: string
  subtypes?: string[]
  description?: string
  deprecated?: boolean
  ifcVersion?: string[]
}

interface IFCSimpleType {
  name: string
  baseType: string
  description?: string
}

interface IFCPropertySetDefinition {
  name: string
  applicableEntities: string[]
  properties: { name: string; dataType: string }[]
}

interface SchemaIndex {
  versions: string[]
  lastGenerated: string
  entityCounts: Record<string, number>
  propertySetCounts: Record<string, number>
}

// Lazy loading cache
const schemaCache = new Map<string, any>()

// Browser-compatible schema loading
async function loadSchemaFile<T>(filename: string): Promise<T> {
  const cacheKey = filename
  if (schemaCache.has(cacheKey)) {
    return schemaCache.get(cacheKey)
  }

  try {
    // In browser, fetch from public directory
    const response = await fetch(`/generated/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}: ${response.status}`)
    }
    const data = await response.json()
    schemaCache.set(cacheKey, data)
    return data
  } catch (error) {
    console.warn(`Failed to load schema file ${filename}:`, error)
    return [] as T
  }
}

async function loadEntities(version: IFCVersion): Promise<IFCEntityDefinition[]> {
  const filename = `entities-${version.toLowerCase()}.json`
  return await loadSchemaFile<IFCEntityDefinition[]>(filename)
}

async function loadSimpleTypes(version: IFCVersion): Promise<IFCSimpleType[]> {
  const filename = `simple-types-${version.toLowerCase()}.json`
  return await loadSchemaFile<IFCSimpleType[]>(filename)
}

async function loadPropertySets(version: IFCVersion): Promise<IFCPropertySetDefinition[]> {
  const filename = `property-sets-${version.toLowerCase()}.json`
  return await loadSchemaFile<IFCPropertySetDefinition[]>(filename)
}

async function loadSchemaIndex(): Promise<SchemaIndex> {
  return await loadSchemaFile<SchemaIndex>('schema-index.json')
}

// Backward compatibility: Convert generated entities to legacy format
function convertEntities(entities: IFCEntityDefinition[]): IFCEntity[] {
  return entities.map(entity => ({
    name: entity.name,
    predefinedTypes: entity.predefinedTypes.length > 0 ? entity.predefinedTypes : undefined,
    description: entity.description
  }))
}

// Backward compatibility: Convert generated property sets to legacy format
function convertPropertySets(propertySets: IFCPropertySetDefinition[]): IFCPropertySet[] {
  return propertySets.map(pset => ({
    name: pset.name,
    properties: pset.properties.map(prop => ({
      name: prop.name,
      dataType: prop.dataType
    })),
    applicableEntities: pset.applicableEntities
  }))
}

// Backward compatibility: Convert generated simple types to legacy format
function convertSimpleTypes(simpleTypes: IFCSimpleType[]): IFCDataType[] {
  return simpleTypes.map(type => ({
    name: type.name,
    description: type.description || `${type.name} data type`
  }))
}

// Legacy data types used as synchronous fallback before schema is loaded
export const IFC_DATA_TYPES: IFCDataType[] = [
  { name: "IFCLABEL", description: "Short text string (max 255 characters)" },
  { name: "IFCTEXT", description: "Long text string" },
  { name: "IFCBOOLEAN", description: "True or False value" },
  { name: "IFCINTEGER", description: "Whole number" },
  { name: "IFCREAL", description: "Decimal number" },
  { name: "IFCIDENTIFIER", description: "Unique identifier string" },
  { name: "IFCLOGICAL", description: "True, False, or Unknown" },
  { name: "IFCDATETIME", description: "Date and time value" },
  { name: "IFCDATE", description: "Date value" },
  { name: "IFCTIME", description: "Time value" },
  { name: "IFCDURATION", description: "Time duration" },
  { name: "IFCLENGTHMEASURE", description: "Length measurement" },
  { name: "IFCAREAMEASURE", description: "Area measurement" },
  { name: "IFCVOLUMEMEASURE", description: "Volume measurement" },
  { name: "IFCPLANEANGLEMEASURE", description: "Plane angle measurement" },
  { name: "IFCMASSMEASURE", description: "Mass measurement" },
  { name: "IFCPOWERMEASURE", description: "Power measurement" },
  { name: "IFCPRESSUREMEASURE", description: "Pressure measurement" },
  { name: "IFCTHERMALTRANSMITTANCEMEASURE", description: "Thermal transmittance (U-value) measurement" },
  { name: "IFCVOLUMETRICFLOWRATEMEASURE", description: "Volumetric flow rate measurement" },
  { name: "IFCTHERMODYNAMICTEMPERATUREMEASURE", description: "Thermodynamic temperature measurement" },
  { name: "IFCPOSITIVERATIOMEASURE", description: "Positive ratio measurement" },
  { name: "IFCCOUNTMEASURE", description: "Count measurement" },
  { name: "IFCILLUMINANCEMEASURE", description: "Illuminance measurement" },
  { name: "IFCLUMINOUSFLUXMEASURE", description: "Luminous flux measurement" },
  { name: "IFCLUMINOUSINTENSITYMEASURE", description: "Luminous intensity measurement" },
  { name: "IFCELECTRICVOLTAGEMEASURE", description: "Electric voltage measurement" },
  { name: "IFCELECTRICCURRENTMEASURE", description: "Electric current measurement" },
  { name: "IFCFREQUENCYMEASURE", description: "Frequency measurement" },
  { name: "IFCFORCEMEASURE", description: "Force measurement" },
  { name: "IFCMOMENTOFINERTIAMEASURE", description: "Moment of inertia measurement" },
  { name: "IFCMONETARYMEASURE", description: "Monetary measurement" },
  { name: "IFCTIMEMEASURE", description: "Time measurement" },
  { name: "IFCPOSITIVELENGTHMEASURE", description: "Positive length measurement" },
]

// Synchronous validation functions for backward compatibility
// These use the legacy data for immediate validation
export function validateEntityName(name: string, version: IFCVersion): boolean {
  // For now, use legacy validation. Async version available as validateEntityNameAsync
  return true // Allow all entities for now
}

export function validatePredefinedType(entityName: string, predefinedType: string, version: IFCVersion): boolean {
  // For now, use legacy validation. Async version available as validatePredefinedTypeAsync
  return true // Allow all predefined types for now
}

export function validatePropertySet(propertySetName: string): boolean {
  // Validation now happens asynchronously with loaded data
  // For synchronous validation, accept all property sets
  return true
}

export function validateProperty(propertySetName: string, propertyName: string): boolean {
  // Validation now happens asynchronously with loaded data
  // For synchronous validation, accept all properties
  return true
}

// Data type validation cache - populated from generated schema.
// The list of valid IDS datatypes differs per IFC schema version (e.g.
// IFCNONNEGATIVELENGTHMEASURE and the date/time types are IFC4+ only), so the
// cache is rebuilt whenever the requested version changes.
const validDataTypeCache = new Set<string>()
// Datatype name (UPPERCASE) -> xs: restriction base type (e.g. "xs:double").
// Used to group datatypes into coarse value categories for compatibility hints.
const dataTypeBaseTypeCache = new Map<string, string>()
let simpleTypesCacheVersion: IFCVersion | null = null

async function ensureSimpleTypeCaches(version: IFCVersion): Promise<void> {
  if (simpleTypesCacheVersion === version && validDataTypeCache.size > 0) return
  try {
    const simpleTypes = await loadSimpleTypes(version)
    if (simpleTypes.length === 0) return // keep any existing cache / legacy fallback
    validDataTypeCache.clear()
    dataTypeBaseTypeCache.clear()
    for (const t of simpleTypes) {
      const upper = t.name.toUpperCase()
      validDataTypeCache.add(upper)
      dataTypeBaseTypeCache.set(upper, (t.baseType || '').trim())
    }
    simpleTypesCacheVersion = version
  } catch (error) {
    console.warn('Failed to build data type cache:', error)
  }
}

export function validateDataType(dataType: string): boolean {
  const upperType = dataType.toUpperCase()
  // Use cache from generated schema if available
  if (validDataTypeCache.size > 0) {
    return validDataTypeCache.has(upperType)
  }
  // Fallback to legacy list before cache is built
  return IFC_DATA_TYPES.some((dt) => dt.name.toUpperCase() === upperType)
}

export async function validateDataTypeAsync(dataType: string, version: IFCVersion): Promise<boolean> {
  await ensureSimpleTypeCaches(version)
  return validDataTypeCache.has(dataType.toUpperCase())
}

// Coarse value categories. Two datatypes in the SAME category are considered
// interchangeable enough that swapping one for the other (e.g. a measure
// subtype like IFCPOSITIVELENGTHMEASURE for its base IFCLENGTHMEASURE) is never
// flagged. Per the IDS spec, ANY valid datatype is acceptable for a property —
// the standard IFC pset template type is only a recommendation — so we only hint
// when the chosen datatype is a fundamentally different *kind* of value.
export type DataTypeCategory =
  | 'numeric'
  | 'string'
  | 'boolean'
  | 'datetime'
  | 'binary'
  | 'unknown'

function baseTypeToCategory(base: string): DataTypeCategory {
  switch (base) {
    case 'xs:double':
    case 'xs:integer':
    case 'xs:decimal':
      return 'numeric'
    case 'xs:boolean':
      return 'boolean'
    case 'xs:date':
    case 'xs:dateTime':
    case 'xs:time':
    case 'xs:duration':
      return 'datetime'
    case 'xs:string':
    case 'xs:anyURI':
      return 'string'
    case '':
      return 'binary'
    default:
      return 'unknown'
  }
}

export function getDataTypeCategory(dataType: string): DataTypeCategory {
  const base = dataTypeBaseTypeCache.get(dataType.toUpperCase())
  if (base === undefined) return 'unknown'
  return baseTypeToCategory(base)
}

/**
 * Whether two IDS datatypes represent the same kind of value. Same exact type,
 * or same coarse category (e.g. both numeric measures) → compatible. If either
 * type is unknown to the loaded schema, we err on the side of NOT warning.
 */
export function areDataTypesCompatible(a: string, b: string): boolean {
  if (a.toUpperCase() === b.toUpperCase()) return true
  const ca = getDataTypeCategory(a)
  const cb = getDataTypeCategory(b)
  if (ca === 'unknown' || cb === 'unknown') return true
  return ca === cb
}

export function getEntitiesForVersion(version: IFCVersion): string[] {
  // Legacy synchronous fallback - use getAllEntities() for complete data from schema
  return []
}

export function getPredefinedTypesForEntity(entityName: string, version: IFCVersion): string[] {
  // Legacy synchronous fallback - use getPredefinedTypesForEntityAsync for complete data
  return []
}

export async function getPredefinedTypesForEntityAsync(entityName: string, version: IFCVersion): Promise<string[]> {
  const entities = await loadEntities(version)
  const normalizedName = entityName.toUpperCase()

  // Find entity by case-insensitive name match
  const entity = entities.find(e => e.name.toUpperCase() === normalizedName)
  if (entity?.predefinedTypes && entity.predefinedTypes.length > 0) {
    return entity.predefinedTypes
  }

  // Also check the corresponding Type entity (e.g., IfcWallType for IfcWall)
  // In some IFC versions, predefined types are only on the Type entity
  const typeName = normalizedName.endsWith('TYPE') ? normalizedName : normalizedName + 'TYPE'
  if (typeName !== normalizedName) {
    const typeEntity = entities.find(e => e.name.toUpperCase() === typeName)
    if (typeEntity?.predefinedTypes && typeEntity.predefinedTypes.length > 0) {
      return typeEntity.predefinedTypes
    }
  }

  return []
}

export function getPropertySetsForEntity(entityName: string): string[] {
  // Legacy synchronous fallback - use getPropertySetsForEntityAsync() for complete data from schema
  return []
}

export function getPropertiesForPropertySet(propertySetName: string): string[] {
  // This is a legacy synchronous function
  // Properties are now loaded asynchronously from JSON files
  // Return empty array - callers should use async version or loaded property sets
  return []
}

// Async functions for comprehensive schema access
export async function getAllSimpleTypes(version: IFCVersion): Promise<IFCDataType[]> {
  const simpleTypes = await loadSimpleTypes(version)
  // Populate the (version-aware) data type validation + category caches.
  await ensureSimpleTypeCaches(version)
  return convertSimpleTypes(simpleTypes)
}

export async function getAllEntities(version: IFCVersion): Promise<IFCEntityDefinition[]> {
  const entities = await loadEntities(version)
  return entities
}

export async function getAllPropertySets(version: IFCVersion): Promise<IFCPropertySet[]> {
  const propertySets = await loadPropertySets(version)
  return convertPropertySets(propertySets)
}

export async function getPropertySetsForEntityAsync(entityName: string, version: IFCVersion): Promise<IFCPropertySet[]> {
  const allPropertySets = await getAllPropertySets(version)
  const normalizedEntityName = entityName.toUpperCase()
  return allPropertySets.filter(pset =>
    pset.applicableEntities.some(e => e.toUpperCase() === normalizedEntityName)
  )
}

export async function searchPropertySets(query: string, version: IFCVersion): Promise<IFCPropertySet[]> {
  const allPropertySets = await getAllPropertySets(version)
  const lowercaseQuery = query.toLowerCase()

  return allPropertySets.filter(pset =>
    pset.name.toLowerCase().includes(lowercaseQuery) ||
    pset.properties.some(prop =>
      prop.name.toLowerCase().includes(lowercaseQuery)
    )
  )
}

export async function getAttributesForEntity(entityName: string, version: IFCVersion): Promise<{ name: string; type: string; optional: boolean }[]> {
  const entities = await loadEntities(version)
  const normalizedEntityName = entityName.toUpperCase()
  const entity = entities.find((e) => e.name.toUpperCase() === normalizedEntityName)
  return entity?.attributes || []
}

export async function getClassificationSystemsForEntity(entityName: string, version: IFCVersion): Promise<string[]> {
  // For now, return common classification systems
  // In a full implementation, this would filter based on entity applicability
  // Note: entityName is normalized to uppercase for consistency
  const normalizedEntityName = entityName.toUpperCase()
  return [
    "OmniClass",
    "Uniclass",
    "MasterFormat",
    "Uniformat",
    "ISO 12006-2",
    "ISO 81346",
    "ETIM",
    "eCl@ss"
  ]
}

export async function getMaterialTypesForEntity(entityName: string, version: IFCVersion): Promise<string[]> {
  // For now, return common material types
  // In a full implementation, this would filter based on entity applicability
  // Note: entityName is normalized to uppercase for consistency
  const normalizedEntityName = entityName.toUpperCase()
  return [
    "Concrete",
    "Steel",
    "Wood",
    "Glass",
    "Aluminum",
    "Masonry",
    "Plastic",
    "Composite",
    "Ceramic",
    "Natural Stone"
  ]
}

export async function getSpatialRelationsForEntity(entityName: string, version: IFCVersion): Promise<string[]> {
  // Return valid IDS PartOf relation types per IDS XSD schema
  // All 6 relations are valid regardless of entity - they represent different IFC relationship types
  // Note: entityName parameter is kept for API compatibility but not used for filtering
  return [
    "IFCRELAGGREGATES",
    "IFCRELASSIGNSTOGROUP",
    "IFCRELCONTAINEDINSPATIALSTRUCTURE",
    "IFCRELNESTS",
    "IFCRELVOIDSELEMENT",
    "IFCRELFILLSELEMENT"
  ]
}

export async function getEntityAttributes(entityName: string, version: IFCVersion): Promise<{ name: string; type: string; optional: boolean }[]> {
  const entities = await loadEntities(version)
  const entity = entities.find((e) => e.name === entityName)
  return entity?.attributes || []
}

export async function searchEntities(query: string, version: IFCVersion): Promise<IFCEntity[]> {
  const entities = await loadEntities(version)
  const filtered = entities.filter((entity) =>
    entity.name.toLowerCase().includes(query.toLowerCase()) ||
    entity.description?.toLowerCase().includes(query.toLowerCase())
  )
  return convertEntities(filtered)
}

export async function getSchemaStats(): Promise<{ version: string; entityCount: number; propertySetCount: number }[]> {
  const index = await loadSchemaIndex()
  return index.versions.map(version => ({
    version,
    entityCount: index.entityCounts[version] || 0,
    propertySetCount: index.propertySetCounts[version] || 0
  }))
}

// Build a cache of property name to data types from loaded property sets
const propertyDataTypeCache = new Map<string, Set<string>>()
let cacheBuilt = false
let cacheVersion: IFCVersion | null = null

async function buildPropertyDataTypeCache(version: IFCVersion) {
  // Rebuild if version changed
  if (cacheBuilt && cacheVersion === version) return

  try {
    // Clear previous cache if version changed
    if (cacheVersion !== version) {
      propertyDataTypeCache.clear()
      cacheBuilt = false
    }

    const allPropertySets = await getAllPropertySets(version)

    for (const pset of allPropertySets) {
      for (const prop of pset.properties) {
        if (!propertyDataTypeCache.has(prop.name)) {
          propertyDataTypeCache.set(prop.name, new Set())
        }
        propertyDataTypeCache.get(prop.name)!.add(prop.dataType)
      }
    }

    cacheBuilt = true
    cacheVersion = version
  } catch (error) {
    console.warn('Failed to build property data type cache:', error)
  }
}

/**
 * Ensures the property data type cache is built for the given IFC version.
 * Must be called before using synchronous isPropertyDataTypeValid().
 */
export async function ensurePropertyDataTypeCache(version: IFCVersion): Promise<void> {
  await buildPropertyDataTypeCache(version)
}

/**
 * Normalize a property baseName for cache lookup.
 * IDS files may use various formats for property names:
 *  - "Load Bearing [LoadBearing]"  (display name with technical name in brackets)
 *  - "Load Bearing (LoadBearing)"  (display name with technical name in parentheses)
 *  - "  LoadBearing  "             (whitespace padding)
 * This extracts / cleans the technical name so it matches the property-set cache.
 */
export function normalizePropertyName(baseName: string): string {
  const trimmed = baseName.trim()

  // Try to extract technical name from brackets: "Display Name [TechnicalName]"
  const bracketMatch = trimmed.match(/\[(\w+)\]/)
  if (bracketMatch) {
    return bracketMatch[1]
  }

  // Try to extract technical name from parentheses: "Display Name (TechnicalName)"
  const parenMatch = trimmed.match(/\((\w+)\)/)
  if (parenMatch) {
    return parenMatch[1]
  }

  return trimmed
}

export function getExpectedDataTypesForProperty(propertyName: string): string[] | undefined {
  // Check cache from loaded property sets (populated via getExpectedDataTypesForPropertyAsync)
  if (propertyDataTypeCache.has(propertyName)) {
    return Array.from(propertyDataTypeCache.get(propertyName)!)
  }

  // Try normalized name (e.g. "Load Bearing [LoadBearing]" → "LoadBearing")
  const normalized = normalizePropertyName(propertyName)
  if (normalized !== propertyName && propertyDataTypeCache.has(normalized)) {
    return Array.from(propertyDataTypeCache.get(normalized)!)
  }

  // If cache is built but property not found, it's a custom property - any type is acceptable
  if (cacheBuilt) {
    return undefined
  }

  // Before cache is built, accept any type to avoid false positives
  return undefined
}

// Async version that builds cache first
export async function getExpectedDataTypesForPropertyAsync(propertyName: string, version: IFCVersion): Promise<string[] | undefined> {
  await buildPropertyDataTypeCache(version)
  return getExpectedDataTypesForProperty(propertyName)
}

/**
 * Compares a property's chosen datatype against the datatype(s) used for that
 * property name in the standard IFC property-set templates.
 *
 * IMPORTANT (issues #48 / #52): per the IDS specification, a property `dataType`
 * is OPTIONAL and, when present, only needs to be a valid datatype for the
 * schema version — it does NOT have to match the IFC pset template's exact type.
 * So this is a *recommendation* helper, not an IDS rule:
 *   - exact match, or same value category (e.g. IFCPOSITIVELENGTHMEASURE vs its
 *     base IFCLENGTHMEASURE) → `valid: true`, no hint.
 *   - a fundamentally different kind of value (e.g. a text type where the pset
 *     uses a measure) → `valid: false` + `expectedTypes`, surfaced by callers as
 *     a non-blocking recommendation.
 * Custom / unknown properties carry no template opinion and are always valid.
 */
export function isPropertyDataTypeValid(propertyName: string, dataType: string): { valid: boolean; expectedTypes?: string[] } {
  const expectedTypes = getExpectedDataTypesForProperty(propertyName)

  // If no expected types defined, any valid IFC data type is acceptable (custom property)
  if (!expectedTypes) {
    return { valid: true }
  }

  const userUpper = dataType.toUpperCase()

  // Exact match against any template datatype.
  if (expectedTypes.some((t) => t.toUpperCase() === userUpper)) {
    return { valid: true }
  }

  // Subtype / same-category compatibility (measure subtypes, IFCLABEL↔IFCTEXT, …).
  if (expectedTypes.some((t) => areDataTypesCompatible(userUpper, t))) {
    return { valid: true }
  }

  return { valid: false, expectedTypes }
}
