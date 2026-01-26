# Property Facet

The **Property Facet** specifies requirements for IFC properties - the most common way to attach data to model elements.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| **Property Set** | Yes | The property set name (e.g., `Pset_WallCommon`) |
| **Property Name** | Yes | The property name (e.g., `FireRating`) |
| **Value** | No | Optional value constraint |
| **Data Type** | No | Expected data type (e.g., `IfcLabel`) |

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

buildingSMART provides standardized property sets:
- `Pset_*` - Standard property sets
- `Qto_*` - Quantity sets for measurements

For property set references:
- [IFC4x3 Property Sets](https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/annex-b3.html)
- [IFC4 Property Sets](https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/alphabeticalorder-property-sets.htm)

## Learn More

For detailed specification information, see the [official Property Facet documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/property-facet.md) from buildingSMART.
