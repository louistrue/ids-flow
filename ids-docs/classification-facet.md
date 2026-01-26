# Classification Facet

The **Classification Facet** filters or requires elements based on classification system references like Uniclass, OmniClass, or custom systems.

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

## Common Classification Systems

- **Uniclass 2015** - UK standard
- **OmniClass** - North American standard
- **CCI** - Construction Classification International
- **ETIM** - Technical product information

## Learn More

For detailed specification information, see the [official Classification Facet documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/classification-facet.md) from buildingSMART.

For classification URIs, visit the [buildingSMART Data Dictionary (bSDD)](https://search.bsdd.buildingsmart.org/).
