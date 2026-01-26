Filter or require elements based on IFC attributes - the fundamental data fields defined directly on IFC entities. Unlike properties, attributes are fixed for each IFC class.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| **Name** | Yes | The attribute name (e.g., `Name`, `Description`) |
| **Value** | No | Optional value constraint |

## Using in IDSedit

### As Applicability

Filter elements by their attribute values:

1. Add an Attribute Facet to the Applicability section
2. Select the Attribute Name from the dropdown
3. Optionally specify a Value to match

**Example:** Target elements named "W01" by setting Name to `Name` and Value to `W01`

### As Requirement

Require elements to have specific attribute values:

1. Add an Attribute Facet to the Requirements section
2. Configure the required attribute and value

## Common IFC Attributes

These attributes are available on most IFC elements (inherited from `IfcRoot`):

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `GlobalId` | IfcGloballyUniqueId | 22-character unique identifier | `3cUkl32yn9qRSPvBJhiKDP` |
| `Name` | IfcLabel | Short identifier/label | `W-001`, `Door-A` |
| `Description` | IfcText | Human-readable description | `External load-bearing wall` |
| `ObjectType` | IfcLabel | User-defined type classification | `200mm Concrete Wall` |

### Element-Specific Attributes

Additional attributes available on `IfcObject` and subtypes:

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `Tag` | IfcIdentifier | Instance identifier (serial/asset number) | `SN-12345` |
| `PredefinedType` | Enum | Standard subtype classification | `SHEAR`, `DOOR` |

### Spatial Element Attributes

Available on `IfcSpatialElement` (spaces, storeys, etc.):

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `LongName` | IfcLabel | Full descriptive name | `Conference Room A` |

### Type Object Attributes

Available on `IfcTypeObject`:

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `ApplicableOccurrence` | IfcIdentifier | Entity types this type applies to | `IfcWall` |
| `ElementType` | IfcLabel | Manufacturer type designation | `STC-45 Acoustic` |

## Attributes vs Properties

Understanding when to use each:

| Aspect | Attributes | Properties |
|--------|------------|------------|
| **Definition** | Fixed by IFC schema | User-extensible |
| **Availability** | Limited set per class | Unlimited custom properties |
| **Location in IFC** | Direct entity fields | In IfcPropertySet relations |
| **Performance** | Faster to query | Requires relation traversal |
| **Use case** | Core identification | Extended data requirements |

**Rule of thumb:** Use Attribute Facet for `Name`, `Description`, `Tag`, and `ObjectType`. Use Property Facet for everything else.

## Value Matching

### Exact Match

```text
Attribute: Name
Value: W-001
```

### Pattern Matching

Use restrictions for flexible matching:

| Pattern | Matches |
|---------|---------|
| `W-[0-9]+` | W-001, W-123, W-9999 |
| `.*Wall.*` | ExternalWall, WallType_A |
| `[A-Z]{2}-[0-9]{3}` | AB-001, XY-999 |

### Empty Value Check

To require an attribute exists but allow any value, leave Value empty.

## Common Use Cases

### Naming Conventions

Enforce element naming standards:

```text
Attribute: Name
Value: Pattern "[A-Z]{2}-[0-9]{4}" (e.g., DR-0001, WL-0042)
```

### Description Requirements

Require meaningful descriptions:

```text
Attribute: Description
Value: Pattern ".{10,}" (minimum 10 characters)
```

### Object Type Classification

Require user-defined types:

```text
Attribute: ObjectType
Value: Not empty (any value required)
```

### Asset Tagging

Require asset tags for facility management:

```text
Attribute: Tag
Value: Pattern "ASSET-[0-9]{6}"
```

### Space Naming

Require full room names:

```text
Attribute: LongName
Value: Not empty
```

## Attributes by IFC Class

### IfcWall / IfcWallType

- `Name`, `Description`, `Tag`, `ObjectType`, `PredefinedType`

### IfcDoor / IfcDoorType

- `Name`, `Description`, `Tag`, `ObjectType`, `PredefinedType`, `OperationType`

### IfcSpace

- `Name`, `Description`, `LongName`, `ObjectType`, `PredefinedType`

### IfcBuildingStorey

- `Name`, `Description`, `LongName`, `ObjectType`, `Elevation`

## Technical Notes

- Attribute names are **case-sensitive** (use exact IFC schema names)
- `GlobalId` is always auto-generated - avoid requiring specific values
- `Name` and `Description` can be null in IFC - use requirements to enforce
- Inheritance means child classes have all parent attributes

## IFC Schema Reference

For complete attribute definitions by class:

- [IFC4x3 Entity Definitions](https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/lexical/IfcRoot.htm)
- [IFC4 Entity Definitions](https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/schema/ifckernel/lexical/ifcroot.htm)

## Learn More

For detailed specification information, see the [official Attribute Facet documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/attribute-facet.md) from buildingSMART.
