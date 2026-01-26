# Entity Facet

The **Entity Facet** filters or requires elements based on their IFC class type. This is typically the starting point for most specifications as it defines what kind of elements you're targeting.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| **IFC Class** | Yes | The IFC entity type (e.g., `IfcWall`, `IfcDoor`) |
| **Predefined Type** | No | Optional subtype (e.g., `SHEAR`, `PARTITIONING`) |

## Using in IDSedit

### As Applicability
Use the Entity Facet to specify which elements your specification applies to:

1. Add an Entity Facet node to the Applicability section
2. Select the IFC Class from the dropdown
3. Optionally set a Predefined Type for more specific filtering

**Example:** To target all walls, set IFC Class to `IfcWall`

### As Requirement
Use the Entity Facet to require elements be a specific type:

1. Add an Entity Facet node to the Requirements section
2. Configure the required entity type

## IFC Class Hierarchy

IFC classes follow an inheritance hierarchy. Understanding this helps you target the right elements:

### Building Elements
| Class | Description | Common Predefined Types |
|-------|-------------|------------------------|
| `IfcWall` | Vertical constructions | `SOLIDWALL`, `PARTITIONING`, `SHEAR` |
| `IfcDoor` | Door elements | `DOOR`, `GATE`, `TRAPDOOR` |
| `IfcWindow` | Window elements | `WINDOW`, `SKYLIGHT`, `LIGHTDOME` |
| `IfcSlab` | Horizontal constructions | `FLOOR`, `ROOF`, `BASESLAB` |
| `IfcBeam` | Linear structural members (horizontal) | `BEAM`, `HOLLOWCORE`, `LINTEL` |
| `IfcColumn` | Vertical structural members | `COLUMN`, `PILASTER` |
| `IfcStair` | Vertical circulation | `STRAIGHT_RUN_STAIR`, `SPIRAL_STAIR` |
| `IfcRamp` | Inclined circulation | `STRAIGHT_RUN_RAMP`, `SPIRAL_RAMP` |
| `IfcRoof` | Roof structures | `FLAT_ROOF`, `SHED_ROOF`, `GABLE_ROOF` |

### Spatial Elements
| Class | Description | Usage |
|-------|-------------|-------|
| `IfcSite` | Project site | One per project typically |
| `IfcBuilding` | Building structure | Contains building storeys |
| `IfcBuildingStorey` | Floor level | Contains elements on that level |
| `IfcSpace` | Rooms and areas | Used for room data requirements |
| `IfcZone` | Groups of spaces | HVAC zones, fire zones, etc. |

### MEP Elements
| Class | Description | Examples |
|-------|-------------|----------|
| `IfcPipeSegment` | Pipe runs | Water, gas, drainage |
| `IfcDuctSegment` | Duct runs | HVAC distribution |
| `IfcCableSegment` | Cable runs | Electrical distribution |
| `IfcFlowTerminal` | End devices | Outlets, fixtures, diffusers |
| `IfcFlowController` | Control devices | Valves, dampers, switches |

### Type Objects
Every element can have a corresponding Type object that defines shared properties:

| Element | Type |
|---------|------|
| `IfcWall` | `IfcWallType` |
| `IfcDoor` | `IfcDoorType` |
| `IfcWindow` | `IfcWindowType` |

**Tip:** Use Type objects when you want to specify requirements for wall types, door types, etc., rather than individual instances.

## Predefined Types

Predefined types allow more specific targeting. They can be:

1. **Standard values** - Defined in the IFC schema (e.g., `SOLIDWALL`, `PARTITIONING`)
2. **User-defined** - Custom values set by the model author (matched when `USERDEFINED` is set)

### Using Restrictions with Predefined Types

You can use pattern matching for predefined types:
- `EXT.*` - Matches any type starting with "EXT"
- `.*WALL` - Matches any type ending with "WALL"

## Common Use Cases

| Use Case | IFC Class | Predefined Type |
|----------|-----------|-----------------|
| All walls | `IfcWall` | (none) |
| Structural walls only | `IfcWall` | `SHEAR` |
| All doors and gates | `IfcDoor` | (none) |
| External doors only | `IfcDoor` | Pattern: `.*EXTERNAL.*` |
| All rooms | `IfcSpace` | (none) |
| Only parking spaces | `IfcSpace` | `PARKING` |
| Load-bearing columns | `IfcColumn` | `COLUMN` |

## Technical Notes

- IFC Class names are **case-insensitive** in IDS
- Predefined Types are matched **case-insensitively**
- When no Predefined Type is specified, all subtypes match
- Entity Facet checks both the element class and its inheritance chain

## IFC Class Reference

For complete lists of IFC classes and predefined types:
- [IFC4x3 Entity Index](https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/annex-b1.html)
- [IFC4 Entity Index](https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/annex/annex-b/alphabeticalorder_entities.htm)

## Learn More

For detailed specification information, see the [official Entity Facet documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/entity-facet.md) from buildingSMART.
