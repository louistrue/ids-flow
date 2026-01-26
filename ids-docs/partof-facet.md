Filter or require elements based on their relationship to other elements in the model hierarchy. Useful for spatial containment, system membership, and assembly structures.

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

The PartOf Facet can check six types of IFC relationships:

### IfcRelAggregates

Describes how objects are composed of smaller parts:

| Parent | Children | Example |
|--------|----------|---------|
| `IfcBuilding` | `IfcBuildingStorey` | Building contains storeys |
| `IfcBuildingStorey` | `IfcSpace` | Storey contains spaces |
| `IfcElementAssembly` | `IfcBeam`, `IfcColumn` | Steel assembly contains members |
| `IfcCurtainWall` | `IfcPlate`, `IfcMember` | Curtain wall contains panels |

### IfcRelContainedInSpatialStructure

Describes spatial location of elements:

| Container | Elements | Example |
|-----------|----------|---------|
| `IfcBuildingStorey` | `IfcWall`, `IfcDoor` | Elements on a floor level |
| `IfcSpace` | `IfcFurniture` | Furniture in a room |
| `IfcSite` | `IfcBuilding` | Buildings on a site |

### IfcRelAssignsToGroup

Groups elements by function or system:

| Group | Members | Example |
|-------|---------|---------|
| `IfcSystem` | `IfcDistributionElement` | HVAC system components |
| `IfcZone` | `IfcSpace` | Thermal zones |
| `IfcGroup` | Any element | Custom groupings |

### IfcRelNests

Physical attachment to a host:

| Host | Nested | Example |
|------|--------|---------|
| `IfcDistributionPort` | `IfcSensor` | Sensor attached to port |
| `IfcElement` | `IfcDiscreteAccessory` | Bracket attached to beam |

### IfcRelVoidsElement

Void/opening relationships:

| Element | Void | Example |
|---------|------|---------|
| `IfcWall` | `IfcOpeningElement` | Door opening in wall |
| `IfcSlab` | `IfcOpeningElement` | Stair opening in floor |

### IfcRelFillsElement

Elements that fill voids:

| Void | Filling | Example |
|------|---------|---------|
| `IfcOpeningElement` | `IfcDoor` | Door in opening |
| `IfcOpeningElement` | `IfcWindow` | Window in opening |

## Recursive Traversal

The PartOf Facet traverses relationships **recursively**. This means:

```text
IfcSite
  └── IfcBuilding (via IfcRelAggregates)
        └── IfcBuildingStorey (via IfcRelAggregates)
              └── IfcWall (via IfcRelContainedInSpatialStructure)
```

If you query for elements that are part of `IfcSite`, the wall will match because the relationship chain leads back to the site.

## Common Use Cases

### Require Spatial Assignment

Ensure all elements are assigned to a building storey:

```text
Entity Facet: IfcBuildingElement (applicability)
PartOf Facet: Entity = IfcBuildingStorey (requirement)
```

### Filter by System Membership

Target elements in a specific system type:

```text
PartOf Facet: Entity = IfcSystem, Relation = IfcRelAssignsToGroup
```

### Validate Space Containment

Require furniture to be in spaces:

```text
Entity Facet: IfcFurniture
PartOf Facet: Entity = IfcSpace, Relation = IfcRelContainedInSpatialStructure
```

### Assembly Validation

Target elements that are part of curtain walls:

```text
PartOf Facet: Entity = IfcCurtainWall, Relation = IfcRelAggregates
```

### Zone Assignment

Require spaces to be in thermal zones:

```text
Entity Facet: IfcSpace
PartOf Facet: Entity = IfcZone, Relation = IfcRelAssignsToGroup
```

## Technical Notes

- When **Relation is not specified**, all 6 relationship types are checked
- Relationships are traversed **recursively** up the hierarchy
- Entity names are **case-insensitive**
- Relation names must match exactly (uppercase)
- **Prohibited** cardinality means elements must NOT be part of the specified entity

## IFC Documentation

- [IfcRelAggregates](https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/lexical/IfcRelAggregates.htm)
- [IfcRelContainedInSpatialStructure](https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/lexical/IfcRelContainedInSpatialStructure.htm)
- [IfcRelAssignsToGroup](https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/lexical/IfcRelAssignsToGroup.htm)

## Learn More

For detailed specification information, see the [official PartOf Facet documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/partof-facet.md) from buildingSMART.
