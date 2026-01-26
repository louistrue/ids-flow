# PartOf Facet

The **PartOf Facet** filters or requires elements based on their relationship to other elements in the model hierarchy.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| **Entity** | Yes | The IFC class of the parent element |
| **Relation** | No | Specific relationship type to check |

## Using in IDSedit

### As Applicability
Filter elements that are part of another element:

1. Add a PartOf Facet to the Applicability section
2. Select the parent Entity type
3. Optionally specify the Relation type

**Example:** Target all elements contained in spaces by setting Entity to `IfcSpace`

### As Requirement
Require elements to be part of a larger element:

1. Add a PartOf Facet to the Requirements section
2. Configure the required parent entity type

## Supported Relationships

| Relation | Description |
|----------|-------------|
| `IfcRelAggregates` | Part of an assembly |
| `IfcRelContainedInSpatialStructure` | Located in a space/storey |
| `IfcRelAssignsToGroup` | Member of a group or system |
| `IfcRelNests` | Physically connected to host |
| `IfcRelVoidsElement` | Void in an element |
| `IfcRelFillsElement` | Fills a void |

When no relation is specified, all relationship types are checked.

## Common Use Cases

- Require elements to be assigned to a building storey
- Filter elements that belong to a specific system
- Ensure elements are contained within spaces

## Learn More

For detailed specification information, see the [official PartOf Facet documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/partof-facet.md) from buildingSMART.
