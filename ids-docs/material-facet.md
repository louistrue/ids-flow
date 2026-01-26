# Material Facet

The **Material Facet** filters or requires elements based on their material assignments.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| **Value** | No | Material name or category |

## Using in IDSedit

### As Applicability
Filter elements by their material:

1. Add a Material Facet to the Applicability section
2. Enter the material name (e.g., `Concrete`, `Steel`)
3. Leave Value empty to match any material

**Example:** Target all concrete elements by setting Value to `Concrete`

### As Requirement
Require elements to have a material assigned:

1. Add a Material Facet to the Requirements section
2. Optionally specify the required material name

## Material Types in IFC

Elements can have materials assigned in several ways:
- **Single material** - One material for the whole element
- **Layered materials** - Multiple layers (walls, slabs)
- **Profiled materials** - For structural members
- **Constituent materials** - For composite elements

The Material Facet matches any of these material assignment types.

## Common Material Categories

IFC recommends these standard categories:
- `concrete`, `steel`, `aluminium`
- `block`, `brick`, `stone`
- `wood`, `glass`, `gypsum`
- `plastic`, `earth`

## Learn More

For detailed specification information, see the [official Material Facet documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/material-facet.md) from buildingSMART.
