# Attribute Facet

The **Attribute Facet** filters or requires elements based on their IFC attributes - the fundamental data fields defined by the IFC standard.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| **Name** | Yes | The attribute name (e.g., `Name`, `Description`) |
| **Value** | No | Optional value constraint |

## Using in IDSedit

### As Applicability
Filter elements by their attribute values:

1. Add an Attribute Facet to the Applicability section
2. Select the Attribute Name
3. Optionally specify a Value to match

**Example:** Target elements with a specific name by setting Name to `Name` and Value to `W01`

### As Requirement
Require elements to have specific attribute values:

1. Add an Attribute Facet to the Requirements section
2. Configure the required attribute and value

## Common IFC Attributes

| Attribute | Description |
|-----------|-------------|
| **GlobalId** | Unique identifier |
| **Name** | Short label for the element |
| **Description** | Human-readable description |
| **Tag** | Instance identifier (e.g., serial number) |
| **ObjectType** | User-defined type name |

## Attributes vs Properties

- **Attributes** are fixed by the IFC standard (limited set per class)
- **Properties** are extensible and customizable

Use the [Property Facet](property-facet.md) for custom or extended data requirements.

## Learn More

For detailed specification information, see the [official Attribute Facet documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/attribute-facet.md) from buildingSMART.

For attribute lists by IFC class, see the [IFC4x3 Documentation](https://ifc43-docs.standards.buildingsmart.org/).
