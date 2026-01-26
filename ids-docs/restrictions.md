# Value Restrictions

When configuring facet parameters in IDSedit, you can specify exact values or use **restrictions** for more flexible matching.

## Restriction Types

### Enumeration
Allow a value to match any item from a list.

**Example:** Material must be one of "concrete", "steel", or "wood"

In IDSedit, use the enumeration editor to add multiple allowed values.

### Pattern (Regex)
Define naming conventions using regular expressions.

**Common patterns:**

| Pattern | Matches | Example |
|---------|---------|---------|
| `DT[0-9]{2}` | DT + 2 digits | DT01, DT99 |
| `.*Wall.*` | Contains "Wall" | ExternalWall, WallType1 |
| `[A-Z]{2}-[0-9]+` | 2 letters, dash, numbers | AB-123, XY-1 |

**Pattern symbols:**
- `.` - Any single character
- `*` - Zero or more of the previous
- `[0-9]` - Any digit
- `[A-Z]` - Any uppercase letter
- `{n}` - Exactly n occurrences

### Bounds
Specify numeric ranges with minimum/maximum values.

**Options:**
- Minimum (inclusive or exclusive)
- Maximum (inclusive or exclusive)

**Example:** Area must be >= 10 and <= 100

### Length
Constrain the length of text values.

**Example:** Name must be between 3 and 20 characters

## Using Restrictions in IDSedit

1. Select a facet parameter field
2. Click the restriction icon to switch from simple value to restriction mode
3. Choose the restriction type
4. Configure the restriction parameters

## Learn More

For detailed restriction specifications, see the [official restrictions documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/restrictions.md) from buildingSMART.

For regex learning resources:
- [Regex Tutorial](https://regexone.com/)
- [Regex Tester](https://regex101.com/)
