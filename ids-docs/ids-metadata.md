# IDS Metadata

IDS files include metadata to help users understand the purpose and scope of the specifications. IDSedit makes it easy to configure both file-level and specification-level metadata.

## File Metadata

Configure these fields in IDSedit's IDS settings panel:

| Field | Description |
|-------|-------------|
| **Title** | The document title (e.g., "Fire Safety Requirements") |
| **Description** | Detailed explanation of the IDS purpose |
| **Version** | Version number (recommended: semantic versioning like 1.0, 2.1) |
| **Author** | Contact email for questions |
| **Date** | Publication date |
| **Copyright** | Copyright holder |
| **Purpose** | Why the information is needed (e.g., "cost estimation", "coordination") |
| **Milestone** | When the information is needed (e.g., "Schematic Design", "Construction") |

## Specification Metadata

Each specification in your IDS can have:

| Field | Description |
|-------|-------------|
| **Name** | Short descriptive name |
| **Identifier** | Unique ID for tracking (e.g., "SP01", "FIRE-001") |
| **Description** | Why this requirement is important |
| **Instructions** | How to fulfill the requirement |
| **IFC Version** | Target IFC schema (IFC2X3, IFC4, IFC4X3_ADD2) |

## Best Practices

1. **Write clear descriptions** - Explain the business value of each requirement
2. **Include instructions** - Guide model authors on how to comply
3. **Use meaningful identifiers** - Make specifications easy to reference
4. **Specify IFC versions** - Ensure compatibility with target workflows

## Learn More

For detailed metadata guidelines, see the [official IDS metadata documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/ids-metadata.md) from buildingSMART.
