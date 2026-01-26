Define flexible value matching using patterns, ranges, enumerations, and length constraints. Restrictions extend simple value matching for more complex requirements.

## Restriction Types

### Enumeration

Allow a value to match any item from a predefined list.

**Use case:** Limiting allowed values to a specific set.

| Example | Allowed Values |
|---------|----------------|
| Fire ratings | `"1HR"`, `"2HR"`, `"3HR"` |
| Material types | `"concrete"`, `"steel"`, `"wood"` |
| Status codes | `"APPROVED"`, `"PENDING"`, `"REJECTED"` |

In IDSedit, use the enumeration editor to add multiple allowed values.

### Pattern (Regex)

Define naming conventions or value formats using regular expressions.

**Use case:** Enforcing naming standards, validating formats.

#### Basic Pattern Syntax

| Symbol | Meaning | Example |
|--------|---------|---------|
| `.` | Any single character | `A.C` matches "ABC", "A1C" |
| `*` | Zero or more of previous | `AB*C` matches "AC", "ABC", "ABBC" |
| `+` | One or more of previous | `AB+C` matches "ABC", "ABBC" (not "AC") |
| `?` | Zero or one of previous | `AB?C` matches "AC", "ABC" |
| `^` | Start of string | `^Wall` matches "Wall-01" |
| `$` | End of string | `Wall$` matches "External Wall" |
| `\|` | OR operator | `(cat\|dog)` matches "cat" or "dog" |

#### Character Classes

| Pattern | Matches |
|---------|---------|
| `[0-9]` | Any digit (0-9) |
| `[A-Z]` | Any uppercase letter |
| `[a-z]` | Any lowercase letter |
| `[A-Za-z]` | Any letter |
| `[A-Za-z0-9]` | Any alphanumeric |
| `[^0-9]` | Anything except digits |

#### Quantifiers

| Pattern | Meaning |
|---------|---------|
| `{n}` | Exactly n times |
| `{n,}` | At least n times |
| `{n,m}` | Between n and m times |

#### Common Patterns for BIM

| Use Case | Pattern | Matches |
|----------|---------|---------|
| Element naming | `[A-Z]{2}-[0-9]{4}` | "WL-0001", "DR-1234" |
| Room numbers | `[0-9]{3}[A-Z]?` | "101", "102A" |
| Fire ratings | `[0-9]+HR` | "1HR", "2HR", "120HR" |
| Version numbers | `[0-9]+\.[0-9]+` | "1.0", "2.5" |
| Revision codes | `REV[A-Z]` | "REVA", "REVB" |
| Asset tags | `ASSET-[0-9]{6}` | "ASSET-000001" |
| Contains text | `.*Wall.*` | "External Wall", "WallType" |
| Starts with | `^EXT-.*` | "EXT-001", "EXT-WALL" |
| Ends with | `.*-FINAL$` | "DWG-001-FINAL" |
| Uniclass codes | `EF_[0-9]{2}_[0-9]{2}.*` | "EF_25_10", "EF_25_10_25" |

### Bounds (Numeric Ranges)

Specify minimum and/or maximum values for numeric parameters.

**Use case:** Validating measurements, quantities, performance values.

| Bound Type | Symbol | Meaning |
|------------|--------|---------|
| **Min Inclusive** | `>=` | Value must be greater than or equal |
| **Min Exclusive** | `>` | Value must be greater than |
| **Max Inclusive** | `<=` | Value must be less than or equal |
| **Max Exclusive** | `<` | Value must be less than |

**Examples:**

| Requirement | Configuration |
|-------------|---------------|
| Area >= 10 m² | Min Inclusive: 10 |
| Temperature < 100°C | Max Exclusive: 100 |
| Width between 0.9m and 1.2m | Min: 0.9, Max: 1.2 |
| Height > 2.4m | Min Exclusive: 2.4 |

### Length (String Length)

Constrain the length of text values.

**Use case:** Ensuring descriptions aren't empty, limiting field lengths.

| Constraint | Meaning |
|------------|---------|
| **Min Length** | Minimum characters required |
| **Max Length** | Maximum characters allowed |

**Examples:**

| Requirement | Configuration |
|-------------|---------------|
| Description not empty | Min Length: 1 |
| Name max 50 chars | Max Length: 50 |
| Code exactly 6 chars | Min: 6, Max: 6 |

## Combining Restrictions

Some facet parameters support combining restrictions:

```text
Property: FireRating
Restrictions:
  - Pattern: [0-9]+HR
  - Enumeration: ["1HR", "2HR", "3HR", "4HR"]
```

The value must satisfy ALL specified restrictions (AND logic).

## Using Restrictions in IDSedit

1. Select a facet parameter field
2. Click the restriction toggle to switch from simple value mode
3. Choose the restriction type from the dropdown
4. Configure the restriction parameters
5. For multiple values, use the add button

## Restriction Examples by Facet

### Entity Facet - Predefined Type

```text
Pattern: .*EXTERNAL.*
Matches: EXTERNALWALL, EXTERNAL, DOOREXTERNAL
```

### Property Facet - Value

```text
Enumeration: ["TRUE", "FALSE"]
For boolean-like properties
```

### Attribute Facet - Name Value

```text
Pattern: [A-Z]{2}-[0-9]{4}
For enforcing naming convention like "WL-0001"
```

### Classification Facet - Code

```text
Pattern: EF_25_.*
Matches all Uniclass wall-related codes
```

## Technical Notes

### Regex Engine

IDS uses XSD-compatible regular expressions, which are slightly different from common regex flavors:

| Feature | XSD Regex | Notes |
|---------|-----------|-------|
| Word boundary `\b` | Not supported | Use explicit patterns |
| Lookahead `(?=)` | Not supported | Restructure pattern |
| Global flag | Always on | Matches anywhere in string |
| Case sensitivity | Case-sensitive by default | Use `[Aa]` for case-insensitive |

### Numeric Precision

For floating-point comparisons, IDS uses a tolerance:

- Values within `1e-6` relative tolerance are considered equal
- Example: `10.0000001` equals `10` for comparison purposes

### Empty Values

- **Empty enumeration** = any value allowed
- **Empty pattern** = any value allowed
- **No min bound** = no lower limit
- **No max bound** = no upper limit

## Testing Patterns

Before deploying, test your patterns:

- [Regex101](https://regex101.com/) - Interactive regex tester (use PCRE or ECMAScript mode)
- [RegExr](https://regexr.com/) - Visual regex editor

**Note:** Some advanced regex features may not work in IDS. Test with simple patterns first.

## Learn More

For detailed restriction specifications, see the [official restrictions documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/restrictions.md) from buildingSMART.
