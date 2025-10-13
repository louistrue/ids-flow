// IFC Schema definitions and validation

export type IFCVersion = "IFC2X3" | "IFC4" | "IFC4X3_ADD2"

export interface IFCEntity {
  name: string
  predefinedTypes?: string[]
  description?: string
}

export interface IFCPropertySet {
  name: string
  properties: string[]
  applicableEntities: string[]
}

export interface IFCDataType {
  name: string
  description: string
}

// Common IFC Entities across versions
export const IFC_ENTITIES: Record<IFCVersion, IFCEntity[]> = {
  IFC2X3: [
    { name: "IFCWALL", predefinedTypes: ["STANDARD", "POLYGONAL", "ELEMENTEDWALL", "PLUMBINGWALL"] },
    { name: "IFCSLAB", predefinedTypes: ["FLOOR", "ROOF", "LANDING", "BASESLAB"] },
    { name: "IFCCOLUMN", predefinedTypes: ["COLUMN", "PILASTER"] },
    { name: "IFCBEAM", predefinedTypes: ["BEAM", "JOIST", "LINTEL"] },
    { name: "IFCDOOR", predefinedTypes: ["DOOR", "GATE", "TRAPDOOR"] },
    { name: "IFCWINDOW", predefinedTypes: ["WINDOW", "SKYLIGHT", "LIGHTDOME"] },
    { name: "IFCSPACE", predefinedTypes: ["INTERNAL", "EXTERNAL", "PARKING"] },
    { name: "IFCBUILDING" },
    { name: "IFCBUILDINGSTOREY" },
    { name: "IFCSITE" },
  ],
  IFC4: [
    { name: "IFCWALL", predefinedTypes: ["SOLIDWALL", "POLYGONAL", "ELEMENTEDWALL", "PLUMBINGWALL", "SHEAR"] },
    { name: "IFCSLAB", predefinedTypes: ["FLOOR", "ROOF", "LANDING", "BASESLAB", "APPROACH_SLAB"] },
    { name: "IFCCOLUMN", predefinedTypes: ["COLUMN", "PILASTER", "PIERSTEM"] },
    { name: "IFCBEAM", predefinedTypes: ["BEAM", "JOIST", "HOLLOWCORE", "LINTEL", "SPANDREL", "T_BEAM"] },
    { name: "IFCDOOR", predefinedTypes: ["DOOR", "GATE", "TRAPDOOR", "BOOM_BARRIER"] },
    { name: "IFCWINDOW", predefinedTypes: ["WINDOW", "SKYLIGHT", "LIGHTDOME"] },
    { name: "IFCSPACE", predefinedTypes: ["SPACE", "PARKING", "GFA", "INTERNAL", "EXTERNAL"] },
    { name: "IFCBUILDING" },
    { name: "IFCBUILDINGSTOREY" },
    { name: "IFCSITE" },
    { name: "IFCROOF" },
    { name: "IFCSTAIR" },
    { name: "IFCRAILING" },
  ],
  IFC4X3_ADD2: [
    {
      name: "IFCWALL",
      predefinedTypes: ["SOLIDWALL", "POLYGONAL", "ELEMENTEDWALL", "PLUMBINGWALL", "SHEAR", "RETAININGWALL"],
    },
    {
      name: "IFCSLAB",
      predefinedTypes: ["FLOOR", "ROOF", "LANDING", "BASESLAB", "APPROACH_SLAB", "PAVING", "WEARING"],
    },
    { name: "IFCCOLUMN", predefinedTypes: ["COLUMN", "PILASTER", "PIERSTEM", "STANDCOLUMN"] },
    {
      name: "IFCBEAM",
      predefinedTypes: ["BEAM", "JOIST", "HOLLOWCORE", "LINTEL", "SPANDREL", "T_BEAM", "GIRDER_SEGMENT"],
    },
    { name: "IFCDOOR", predefinedTypes: ["DOOR", "GATE", "TRAPDOOR", "BOOM_BARRIER", "TURNSTILE"] },
    { name: "IFCWINDOW", predefinedTypes: ["WINDOW", "SKYLIGHT", "LIGHTDOME"] },
    { name: "IFCSPACE", predefinedTypes: ["SPACE", "PARKING", "GFA", "INTERNAL", "EXTERNAL"] },
    { name: "IFCBUILDING" },
    { name: "IFCBUILDINGSTOREY" },
    { name: "IFCSITE" },
    { name: "IFCROOF" },
    { name: "IFCSTAIR" },
    { name: "IFCRAILING" },
    { name: "IFCBRIDGE" },
    { name: "IFCROAD" },
    { name: "IFCRAILWAY" },
  ],
}

// Common Property Sets
export const IFC_PROPERTY_SETS: IFCPropertySet[] = [
  {
    name: "Pset_WallCommon",
    properties: [
      "Reference",
      "AcousticRating",
      "FireRating",
      "Combustible",
      "SurfaceSpreadOfFlame",
      "ThermalTransmittance",
      "IsExternal",
      "ExtendToStructure",
      "LoadBearing",
      "Compartmentation",
    ],
    applicableEntities: ["IFCWALL"],
  },
  {
    name: "Pset_SlabCommon",
    properties: [
      "Reference",
      "AcousticRating",
      "FireRating",
      "Combustible",
      "SurfaceSpreadOfFlame",
      "ThermalTransmittance",
      "IsExternal",
      "LoadBearing",
      "PitchAngle",
    ],
    applicableEntities: ["IFCSLAB"],
  },
  {
    name: "Pset_ColumnCommon",
    properties: ["Reference", "FireRating", "IsExternal", "LoadBearing", "Status"],
    applicableEntities: ["IFCCOLUMN"],
  },
  {
    name: "Pset_BeamCommon",
    properties: ["Reference", "FireRating", "IsExternal", "LoadBearing", "Span", "Slope"],
    applicableEntities: ["IFCBEAM"],
  },
  {
    name: "Pset_DoorCommon",
    properties: [
      "Reference",
      "FireRating",
      "AcousticRating",
      "SecurityRating",
      "IsExternal",
      "Infiltration",
      "ThermalTransmittance",
      "GlazingAreaFraction",
      "HandicapAccessible",
      "FireExit",
      "SelfClosing",
    ],
    applicableEntities: ["IFCDOOR"],
  },
  {
    name: "Pset_WindowCommon",
    properties: [
      "Reference",
      "FireRating",
      "AcousticRating",
      "SecurityRating",
      "IsExternal",
      "Infiltration",
      "ThermalTransmittance",
      "GlazingAreaFraction",
      "SmokeStop",
    ],
    applicableEntities: ["IFCWINDOW"],
  },
  {
    name: "Pset_SpaceCommon",
    properties: [
      "Reference",
      "Category",
      "FloorCovering",
      "WallCovering",
      "CeilingCovering",
      "SkirtingBoard",
      "GrossPlannedArea",
      "NetPlannedArea",
      "PubliclyAccessible",
      "HandicapAccessible",
    ],
    applicableEntities: ["IFCSPACE"],
  },
]

// IFC Data Types
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

// Validation functions
export function validateEntityName(name: string, version: IFCVersion): boolean {
  return IFC_ENTITIES[version].some((entity) => entity.name === name)
}

export function validatePredefinedType(entityName: string, predefinedType: string, version: IFCVersion): boolean {
  const entity = IFC_ENTITIES[version].find((e) => e.name === entityName)
  if (!entity || !entity.predefinedTypes) return true // No validation if no predefined types
  return entity.predefinedTypes.includes(predefinedType)
}

export function validatePropertySet(propertySetName: string): boolean {
  return IFC_PROPERTY_SETS.some((pset) => pset.name === propertySetName)
}

export function validateProperty(propertySetName: string, propertyName: string): boolean {
  const pset = IFC_PROPERTY_SETS.find((p) => p.name === propertySetName)
  if (!pset) return true // No validation if property set not found
  return pset.properties.includes(propertyName)
}

export function validateDataType(dataType: string): boolean {
  return IFC_DATA_TYPES.some((dt) => dt.name === dataType)
}

export function getEntitiesForVersion(version: IFCVersion): string[] {
  return IFC_ENTITIES[version].map((e) => e.name)
}

export function getPredefinedTypesForEntity(entityName: string, version: IFCVersion): string[] {
  const entity = IFC_ENTITIES[version].find((e) => e.name === entityName)
  return entity?.predefinedTypes || []
}

export function getPropertySetsForEntity(entityName: string): string[] {
  return IFC_PROPERTY_SETS.filter((pset) => pset.applicableEntities.includes(entityName)).map((pset) => pset.name)
}

export function getPropertiesForPropertySet(propertySetName: string): string[] {
  const pset = IFC_PROPERTY_SETS.find((p) => p.name === propertySetName)
  return pset?.properties || []
}
