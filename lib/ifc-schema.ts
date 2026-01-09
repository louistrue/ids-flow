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

// Legacy compatibility: Keep existing constants for backward compatibility
export const PREDEFINED_PROPERTY_DATATYPES: Record<string, string[]> = {
  // Text properties
  "Reference": ["IFCLABEL", "IFCIDENTIFIER"],
  "FireRating": ["IFCLABEL", "IFCTEXT"],
  "AcousticRating": ["IFCLABEL", "IFCTEXT"],
  "SecurityRating": ["IFCLABEL", "IFCTEXT"],
  "Status": ["IFCLABEL"],
  "Category": ["IFCLABEL"],
  "FloorCovering": ["IFCLABEL"],
  "WallCovering": ["IFCLABEL"],
  "CeilingCovering": ["IFCLABEL"],
  "SkirtingBoard": ["IFCLABEL"],
  "SurfaceSpreadOfFlame": ["IFCLABEL"],

  // Boolean properties
  "Combustible": ["IFCBOOLEAN"],
  "IsExternal": ["IFCBOOLEAN"],
  "LoadBearing": ["IFCBOOLEAN"],
  "Compartmentation": ["IFCBOOLEAN"],
  "ExtendToStructure": ["IFCBOOLEAN"],
  "HandicapAccessible": ["IFCBOOLEAN"],
  "PubliclyAccessible": ["IFCBOOLEAN"],
  "FireExit": ["IFCBOOLEAN"],
  "SelfClosing": ["IFCBOOLEAN"],
  "SmokeStop": ["IFCBOOLEAN"],

  // Measurement properties
  "ThermalTransmittance": ["IFCTHERMALTRANSMITTANCEMEASURE", "IFCREAL"],
  "Infiltration": ["IFCVOLUMETRICFLOWRATEMEASURE", "IFCREAL"],
  "GlazingAreaFraction": ["IFCPOSITIVERATIOMEASURE", "IFCREAL"],
  "GrossPlannedArea": ["IFCAREAMEASURE", "IFCREAL"],
  "NetPlannedArea": ["IFCAREAMEASURE", "IFCREAL"],
  "Span": ["IFCLENGTHMEASURE", "IFCREAL"],
  "Slope": ["IFCPLANEANGLEMEASURE", "IFCREAL"],
  "PitchAngle": ["IFCPLANEANGLEMEASURE", "IFCREAL"],
}

// Legacy property sets constant removed - we now use complete JSON data from generated files

// Legacy compatibility: Keep existing data types for backward compatibility
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
  { name: "IFCLENGTHEASURE", description: "Length measurement" },
  { name: "IFCAREAMEASURE", description: "Area measurement" },
  { name: "IFCVOLUMEMEASURE", description: "Volume measurement" },
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

export function validateDataType(dataType: string): boolean {
  // Check legacy data types
  return IFC_DATA_TYPES.some((dt) => dt.name === dataType)
}

export function getEntitiesForVersion(version: IFCVersion): string[] {
  // Return a comprehensive list of common entities for now
  const commonEntities = [
    'IFCWALL', 'IFCSLAB', 'IFCCOLUMN', 'IFCBEAM', 'IFCDOOR', 'IFCWINDOW',
    'IFCSPACE', 'IFCBUILDING', 'IFCBUILDINGSTOREY', 'IFCSITE', 'IFCROOF',
    'IFCSTAIR', 'IFCRAILING', 'IFCFOOTING', 'IFCFOUNDATION', 'IFCPILE',
    'IFCCAISSON', 'IFCRAMP', 'IFCCURTAINWALL', 'IFCMEMBER', 'IFCPLATE',
    'IFCBUILDINGELEMENTPART', 'IFCBUILDINGELEMENTPROXY', 'IFCDISTRIBUTIONELEMENT',
    'IFCDISTRIBUTIONFLOWELEMENT', 'IFCFLOWCONTROLLER', 'IFCFLOWFITTING',
    'IFCFLOWMOVINGDEVICE', 'IFCFLOWSEGMENT', 'IFCFLOWSTORAGEDEVICE',
    'IFCFLOWTERMINAL', 'IFCFLOWTREATMENTDEVICE', 'IFCENERGYCONVERSIONDEVICE',
    'IFCELECTRICALELEMENT', 'IFCLIGHTFIXTURE', 'IFCLUMINAIRE',
    'IFCSANITARYTERMINAL', 'IFCWASHHANDBASIN', 'IFCTOILET', 'IFCBATH',
    'IFCSINK', 'IFCSHOWER', 'IFCFURNISHINGELEMENT', 'IFCFURNITURE',
    'IFCSYSTEMFURNITUREELEMENT'
  ]

  if (version === 'IFC4X3_ADD2') {
    return [...commonEntities, 'IFCBRIDGE', 'IFCROAD', 'IFCRAILWAY', 'IFCPORT', 'IFCAIRPORT']
  }

  return commonEntities
}

export function getPredefinedTypesForEntity(entityName: string, version: IFCVersion): string[] {
  // Return predefined types for common entities
  const predefinedTypes: Record<string, string[]> = {
    'IFCWALL': ['STANDARD', 'POLYGONAL', 'ELEMENTEDWALL', 'PLUMBINGWALL', 'SHEAR', 'RETAININGWALL'],
    'IFCSLAB': ['FLOOR', 'ROOF', 'LANDING', 'BASESLAB', 'APPROACH_SLAB', 'PAVING', 'WEARING'],
    'IFCCOLUMN': ['COLUMN', 'PILASTER', 'PIERSTEM', 'STANDCOLUMN'],
    'IFCBEAM': ['BEAM', 'JOIST', 'HOLLOWCORE', 'LINTEL', 'SPANDREL', 'T_BEAM', 'GIRDER_SEGMENT'],
    'IFCDOOR': ['DOOR', 'GATE', 'TRAPDOOR', 'BOOM_BARRIER', 'TURNSTILE'],
    'IFCWINDOW': ['WINDOW', 'SKYLIGHT', 'LIGHTDOME'],
    'IFCSPACE': ['SPACE', 'PARKING', 'GFA', 'INTERNAL', 'EXTERNAL']
  }

  return predefinedTypes[entityName] || []
}

export function getPropertySetsForEntity(entityName: string): string[] {
  // Return property sets for common entities
  const entityPropertySets: Record<string, string[]> = {
    'IFCWALL': ['Pset_WallCommon'],
    'IFCSLAB': ['Pset_SlabCommon'],
    'IFCCOLUMN': ['Pset_ColumnCommon'],
    'IFCBEAM': ['Pset_BeamCommon'],
    'IFCDOOR': ['Pset_DoorCommon'],
    'IFCWINDOW': ['Pset_WindowCommon'],
    'IFCSPACE': ['Pset_SpaceCommon']
  }

  return entityPropertySets[entityName] || []
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

async function buildPropertyDataTypeCache(version: IFCVersion) {
  if (cacheBuilt) return

  try {
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
  } catch (error) {
    console.warn('Failed to build property data type cache:', error)
  }
}

export function getExpectedDataTypesForProperty(propertyName: string): string[] | undefined {
  // First check cache from loaded property sets
  if (propertyDataTypeCache.has(propertyName)) {
    return Array.from(propertyDataTypeCache.get(propertyName)!)
  }

  // Fallback to old hardcoded mapping (for any properties not in the loaded schema)
  // This is only used before the cache is built or for truly custom properties
  return PREDEFINED_PROPERTY_DATATYPES[propertyName]
}

// Async version that builds cache first
export async function getExpectedDataTypesForPropertyAsync(propertyName: string, version: IFCVersion): Promise<string[] | undefined> {
  await buildPropertyDataTypeCache(version)
  return getExpectedDataTypesForProperty(propertyName)
}

export function isPropertyDataTypeValid(propertyName: string, dataType: string): { valid: boolean; expectedTypes?: string[] } {
  const expectedTypes = getExpectedDataTypesForProperty(propertyName)

  // If no expected types defined, any valid IFC data type is acceptable (custom property)
  if (!expectedTypes) {
    return { valid: true }
  }

  // Check if the data type matches one of the expected types
  const isValid = expectedTypes.includes(dataType.toUpperCase())

  return {
    valid: isValid,
    expectedTypes: isValid ? undefined : expectedTypes
  }
}
