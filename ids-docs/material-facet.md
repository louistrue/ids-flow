Filter or require elements based on their material assignments. IFC supports single materials, layered sets, profiles, and constituent sets.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| **Value** | No | Material name or category to match |

## Using in IDSedit

### As Applicability

Filter elements by their material:

1. Add a Material Facet to the Applicability section
2. Enter a material name or leave empty for any material
3. Use patterns for flexible matching

**Example:** Target all concrete elements by setting Value to `Concrete`

### As Requirement

Require elements to have a material assigned:

1. Add a Material Facet to the Requirements section
2. Optionally specify the required material name

## Material Assignment Types in IFC

IFC supports several ways to assign materials to elements:

### Single Material (`IfcMaterial`)

One material for the entire element:

```text
IfcWall → IfcMaterial "Concrete"
```

### Material Layer Set (`IfcMaterialLayerSet`)

Multiple layers for walls, slabs, etc.:

```text
IfcWall → IfcMaterialLayerSet
           ├── Layer 1: "Plasterboard" (12mm)
           ├── Layer 2: "Insulation" (100mm)
           └── Layer 3: "Brick" (100mm)
```

### Material Profile Set (`IfcMaterialProfileSet`)

For structural members with cross-sections:

```text
IfcBeam → IfcMaterialProfileSet
           └── Profile: "Steel" (I-Section)
```

### Material Constituent Set (`IfcMaterialConstituentSet`)

For composite elements with named parts:

```text
IfcWindow → IfcMaterialConstituentSet
             ├── "Frame": "Aluminium"
             └── "Glazing": "Glass"
```

**Important:** The Material Facet matches materials from ALL these assignment types.

## Standard Material Categories

IFC recommends these standard category names for consistency:

| Category | Description | Common Uses |
|----------|-------------|-------------|
| `concrete` | Site concrete, precast | Walls, slabs, foundations |
| `steel` | Structural steel | Beams, columns, connections |
| `aluminium` | Aluminium profiles | Windows, curtain walls |
| `block` | Concrete/masonry blocks | Walls |
| `brick` | Clay/concrete bricks | Walls, facades |
| `stone` | Natural stone | Cladding, flooring |
| `wood` | Timber, engineered wood | Framing, finishes |
| `glass` | Glazing materials | Windows, curtain walls |
| `gypsum` | Plasterboard, gypsum board | Partitions, ceilings |
| `plastic` | PVC, polymers | Pipes, membranes |
| `earth` | Soil, clay | Site works |

**Tip:** Use these standard names when possible for better interoperability.

## Value Matching

### Exact Match

```text
Value: Concrete
```

Matches only materials named exactly "Concrete"

### Pattern Matching

Use regular expressions for flexible matching:

| Pattern | Matches |
|---------|---------|
| `.*concrete.*` | "Concrete", "Reinforced Concrete", "Precast Concrete" |
| `[Ss]teel` | "Steel", "steel" |
| `(wood\|timber)` | "wood" or "timber" |
| `C[0-9]+/[0-9]+` | Concrete grades like "C30/37", "C40/50" |

### Any Material

Leave Value empty to match any element that has a material assigned:

```text
Value: (empty)
```

This is useful for requiring elements have material data without specifying which material.

## Common Use Cases

### Structural Material Verification

Require structural elements have material assigned:

```text
Entity Facet: IfcBeam
Material Facet: Value = (empty) - any material required
```

### Fire-Rated Assemblies

Filter non-combustible elements:

```text
Material Facet: Value = Pattern "(concrete|steel|masonry|brick)"
```

### Sustainability Tracking

Target timber elements for embodied carbon:

```text
Material Facet: Value = Pattern ".*wood.*|.*timber.*|.*CLT.*"
```

### Glazing Requirements

Find all glass elements:

```text
Material Facet: Value = Pattern ".*glass.*|.*glazing.*"
```

### Material Consistency

Require specific material naming:

```text
Material Facet: Value = Pattern "[A-Z]+-[0-9]+" (e.g., "MAT-001")
```

## Technical Notes

### Matching Behavior

- Matches material names **case-insensitively** by default
- Checks ALL materials in layered/composite assignments
- Matches if ANY layer/constituent matches (OR logic)
- Material descriptions are NOT matched, only names

### Layered Materials

For walls and slabs with multiple layers:

- A match occurs if ANY layer's material matches
- To require ALL layers match, create multiple specifications

### Material vs Material Category

Some IFC files use:

- `IfcMaterial.Name` - The specific material name
- `IfcMaterial.Category` - The standard category (concrete, steel, etc.)

The Material Facet checks the **Name** field. Some checking tools may also check Category.

## How Materials Work in IFC

Materials are associated via `IfcRelAssociatesMaterial`:

```text
IfcWall
  └── IfcRelAssociatesMaterial
        └── IfcMaterialLayerSetUsage
              └── IfcMaterialLayerSet
                    ├── IfcMaterialLayer (LayerThickness: 0.012)
                    │     └── IfcMaterial (Name: "Plasterboard")
                    └── IfcMaterialLayer (LayerThickness: 0.100)
                          └── IfcMaterial (Name: "Concrete")
```

## IFC Documentation

- [IfcMaterial](https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/lexical/IfcMaterial.htm)
- [IfcMaterialLayerSet](https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/lexical/IfcMaterialLayerSet.htm)
- [IfcRelAssociatesMaterial](https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/lexical/IfcRelAssociatesMaterial.htm)

## Learn More

For detailed specification information, see the [official Material Facet documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/material-facet.md) from buildingSMART.
