# Classification Facet

The **Classification Facet** filters or requires elements based on classification system references. Classifications provide standardized ways to categorize building elements across projects and organizations.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| **System** | Yes | Classification system name (e.g., `Uniclass 2015`) |
| **Value** | No | Classification code (e.g., `EF_25_10_25`) |

## Using in IDSedit

### As Applicability

Filter elements by their classification:

1. Add a Classification Facet to the Applicability section
2. Enter the classification System name
3. Optionally specify a Value (classification code)

**Example:** Target elements classified as external walls in Uniclass by setting System to `Uniclass 2015` and Value to `EF_25_10_25`

### As Requirement

Require elements to have a classification:

1. Add a Classification Facet to the Requirements section
2. Specify the required classification system
3. Optionally require a specific code or code pattern

## Major Classification Systems

### Uniclass 2015 (UK)

The UK standard for construction classification:

| Table | Prefix | Description | Example |
|-------|--------|-------------|---------|
| **EF** | EF_ | Elements/Functions | `EF_25_10` (Walls) |
| **Ss** | Ss_ | Systems | `Ss_25_10_30` (External wall systems) |
| **Pr** | Pr_ | Products | `Pr_25_71_14` (Concrete blocks) |
| **Ac** | Ac_ | Activities | `Ac_35_10` (Assembling) |
| **En** | En_ | Entities | `En_10` (Sites) |

**Pattern example:** `EF_25.*` matches all Uniclass wall elements

### OmniClass (North America)

US/Canadian construction classification:

| Table | Number | Description | Example |
|-------|--------|-------------|---------|
| **21** | 21- | Elements | `21-02 20 10` (Exterior Walls) |
| **22** | 22- | Work Results | `22-04 21 13` (Brick Masonry) |
| **23** | 23- | Products | `23-13 21 11` (Concrete Block) |

### CCI (Nordic)

Construction Classification International:

| Code | Description |
|------|-------------|
| `QAA` | Wall systems |
| `QBA` | Floor systems |
| `QCA` | Roof systems |

### NL-SfB (Netherlands)

Dutch construction classification based on SfB:

| Code | Description |
|------|-------------|
| `21` | External walls |
| `22` | Internal walls |
| `23` | Floors |

### Custom Systems

You can use any classification system name. Common patterns:

- Company-specific systems: `ACME Classification`
- Project-specific systems: `Project XYZ Categories`

## Value Patterns

### Exact Match

```text
System: Uniclass 2015
Value: EF_25_10_25
```

### Hierarchical Matching

Match all codes in a branch using patterns:

| Pattern | Matches |
|---------|---------|
| `EF_25.*` | All Uniclass wall elements |
| `21-02.*` | All OmniClass exterior enclosure elements |
| `EF_25_10.*` | All external wall sub-classifications |

### Multiple Values

Use enumeration restrictions to allow several codes:

```text
System: Uniclass 2015
Value: ["EF_25_10_25", "EF_25_10_30", "EF_25_10_35"]
```

## Common Use Cases

### Require Classification

Ensure all elements are classified:

```text
System: Uniclass 2015
Value: (empty - any code accepted)
```

### Discipline-Specific Classification

Target structural elements:

```text
System: Uniclass 2015
Value: Pattern "Ss_25.*" (structural systems)
```

### Product Specifications

Require product-level classification:

```text
System: Uniclass 2015
Value: Pattern "Pr_.*" (any product code)
```

### Cost Code Assignment

For cost estimation workflows:

```text
System: Cost Codes
Value: Pattern "[0-9]{4}" (4-digit cost code)
```

### Multiple System Support

Elements can have multiple classifications. You can require multiple systems:

- Specification 1: Uniclass 2015 classification
- Specification 2: OmniClass classification

## How Classifications Work in IFC

Classifications are attached to elements via `IfcRelAssociatesClassification`:

```text
Element (IfcWall)
  └── IfcRelAssociatesClassification
        └── IfcClassificationReference
              ├── Identification: "EF_25_10_25"
              └── ReferencedSource
                    └── IfcClassification
                          └── Name: "Uniclass 2015"
```

The Classification Facet checks this entire chain to match your criteria.

## Technical Notes

- System names are matched **case-insensitively**
- Classification values/codes are matched **case-sensitively** by default
- Elements can have multiple classifications from different systems
- Classification can be applied to instances or types (or both)
- Empty Value means "must have any classification in this system"

## Classification Resources

### Official Sources

- [Uniclass 2015](https://uniclass.thenbs.com/) - NBS maintained
- [OmniClass](https://www.csiresources.org/standards/omniclass) - CSI maintained
- [buildingSMART Data Dictionary](https://search.bsdd.buildingsmart.org/) - Classification URIs

### IFC Documentation

- [IfcClassification](https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/lexical/IfcClassification.htm)
- [IfcClassificationReference](https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/lexical/IfcClassificationReference.htm)

## Learn More

For detailed specification information, see the [official Classification Facet documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/classification-facet.md) from buildingSMART.
