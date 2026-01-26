# Property Facet

The **Property Facet** specifies requirements for IFC properties - the most common way to attach custom data to model elements. Properties are organized into Property Sets (Psets) and can contain various data types.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| **Property Set** | Yes | The property set name (e.g., `Pset_WallCommon`) |
| **Property Name** | Yes | The property name (e.g., `FireRating`) |
| **Value** | No | Optional value constraint |
| **Data Type** | No | Expected IFC data type (e.g., `IfcLabel`) |

## Using in IDSedit

### As Applicability
Filter elements that have specific properties:

1. Add a Property Facet to the Applicability section
2. Enter the Property Set and Property Name
3. Optionally specify a Value to filter by

**Example:** Target load-bearing walls by filtering for `Pset_WallCommon` / `LoadBearing` = `TRUE`

### As Requirement
Require elements to have specific properties:

1. Add a Property Facet to the Requirements section
2. Configure the required property set and name
3. Optionally constrain the value or data type

## Standard Property Sets

buildingSMART provides standardized property sets that follow naming conventions:

### Pset_ (Property Sets)
Common properties for element types:

| Property Set | Applies To | Common Properties |
|--------------|------------|-------------------|
| `Pset_WallCommon` | IfcWall | `LoadBearing`, `IsExternal`, `FireRating`, `AcousticRating` |
| `Pset_DoorCommon` | IfcDoor | `FireRating`, `IsExternal`, `SecurityRating` |
| `Pset_WindowCommon` | IfcWindow | `IsExternal`, `ThermalTransmittance`, `GlazingAreaFraction` |
| `Pset_SlabCommon` | IfcSlab | `LoadBearing`, `IsExternal`, `FireRating` |
| `Pset_BeamCommon` | IfcBeam | `LoadBearing`, `Span`, `Slope` |
| `Pset_ColumnCommon` | IfcColumn | `LoadBearing`, `Slope` |
| `Pset_SpaceCommon` | IfcSpace | `IsExternal`, `GrossPlannedArea`, `NetPlannedArea` |

### Qto_ (Quantity Sets)
Measurement quantities for elements:

| Quantity Set | Applies To | Common Quantities |
|--------------|------------|-------------------|
| `Qto_WallBaseQuantities` | IfcWall | `Length`, `Height`, `Width`, `GrossVolume`, `NetVolume` |
| `Qto_DoorBaseQuantities` | IfcDoor | `Width`, `Height`, `Area` |
| `Qto_SlabBaseQuantities` | IfcSlab | `Width`, `Length`, `Depth`, `GrossArea`, `NetArea` |
| `Qto_SpaceBaseQuantities` | IfcSpace | `GrossFloorArea`, `NetFloorArea`, `GrossVolume`, `Height` |

### Custom Property Sets
You can specify any custom property set name. Common conventions:
- `CPset_` prefix for company-specific properties
- Project-specific prefixes (e.g., `PRJ_`, `ACME_`)

## IFC Data Types

When specifying a data type requirement, use these IFC types:

### Text Types
| Type | Description | Example |
|------|-------------|---------|
| `IfcLabel` | Short text (up to 255 chars) | "Type A" |
| `IfcText` | Long text (unlimited) | Full descriptions |
| `IfcIdentifier` | Reference identifier | "W-001" |

### Numeric Types
| Type | Description | Example |
|------|-------------|---------|
| `IfcInteger` | Whole numbers | `42` |
| `IfcReal` | Decimal numbers | `3.14159` |
| `IfcBoolean` | True/False | `TRUE`, `FALSE` |
| `IfcLogical` | True/False/Unknown | `TRUE`, `FALSE`, `UNKNOWN` |

### Measure Types (with units)
| Type | Description | Default Unit |
|------|-------------|--------------|
| `IfcLengthMeasure` | Linear dimensions | meters |
| `IfcAreaMeasure` | Area values | square meters |
| `IfcVolumeMeasure` | Volume values | cubic meters |
| `IfcMassMeasure` | Weight/mass | kilograms |
| `IfcTimeMeasure` | Duration | seconds |
| `IfcThermodynamicTemperatureMeasure` | Temperature | Kelvin |
| `IfcPressureMeasure` | Pressure | Pascals |

### Special Types
| Type | Description | Example |
|------|-------------|---------|
| `IfcDate` | Date value | "2024-01-15" |
| `IfcDateTime` | Date and time | "2024-01-15T10:30:00" |
| `IfcDuration` | ISO 8601 duration | "P1Y2M3D" |

## Value Constraints

### Simple Values
Exact match: `"Concrete"`, `100`, `TRUE`

### Using Restrictions
For flexible matching, use restrictions:

| Restriction | Use Case | Example |
|-------------|----------|---------|
| **Enumeration** | One of several values | `["1HR", "2HR", "3HR"]` |
| **Pattern** | Naming conventions | `FR-[0-9]+HR` |
| **Bounds** | Numeric ranges | `>= 10 and <= 100` |

## Common Use Cases

### Fire Safety
```
Property Set: Pset_WallCommon
Property: FireRating
Value: Pattern matching ".*HR" or enumeration ["1HR", "2HR", "3HR"]
```

### Thermal Performance
```
Property Set: Pset_WindowCommon
Property: ThermalTransmittance
Value: Bounds <= 1.4 (W/m²K)
Data Type: IfcThermalTransmittanceMeasure
```

### Area Requirements
```
Property Set: Qto_SpaceBaseQuantities
Property: NetFloorArea
Value: Bounds >= 10 (minimum room size)
Data Type: IfcAreaMeasure
```

### Custom Project Properties
```
Property Set: CPset_ProjectTracking
Property: CostCenter
Data Type: IfcLabel
```

## Technical Notes

- Property names are **case-sensitive** in IFC files
- Property set names are **case-sensitive**
- When Data Type is unspecified, any type is accepted
- Values are validated against the specified data type
- Unit conversion is handled automatically for measure types

## Property Set Reference

For complete property set definitions:
- [IFC4x3 Property Sets](https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/annex-b3.html)
- [IFC4 Property Sets](https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/annex/annex-b/alphabeticalorder_psets.htm)

## Learn More

For detailed specification information, see the [official Property Facet documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/property-facet.md) from buildingSMART.
