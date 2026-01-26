# Entity Facet

The **Entity Facet** filters or requires elements based on their IFC class type.

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

## Common Use Cases

- Filter specifications to apply only to walls, doors, or windows
- Require elements to be modeled as specific IFC types
- Target building storeys, spaces, or zones

## IFC Class Reference

For complete lists of IFC classes and predefined types:
- [IFC4x3 Classes](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/annex-b1.html)
- [IFC4 Classes](https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/alphabeticalorder-entities.htm)

## Learn More

For detailed specification information, see the [official Entity Facet documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/entity-facet.md) from buildingSMART.
