# Specifications in IDSedit

A **Specification** defines a validation rule for IFC models. In IDSedit, specifications are represented as visual nodes in the flow editor.

## Structure of a Specification

Each specification has three main parts:

### 1. Description
Explain why this requirement exists. Good descriptions help model authors understand the purpose of the specification.

### 2. Applicability
Identifies **which elements** in the model this specification applies to. Use facets to filter:
- Entity Facet - by IFC class type
- Property Facet - by property values
- Classification Facet - by classification references
- Material Facet - by material assignments
- Attribute Facet - by IFC attribute values

### 3. Requirements
Defines **what information** the applicable elements must have. Use the same facet types to specify required data.

## Cardinality

Specifications can be set as:

| Type | Meaning |
|------|---------|
| **Required** | Matching elements must exist in the model |
| **Optional** | If matching elements exist, they must meet requirements |
| **Prohibited** | Matching elements must not exist in the model |

## Using IDSedit

In the visual editor:
1. Create a specification node
2. Connect applicability facets to the left
3. Connect requirement facets to the right
4. Configure each facet's parameters
5. Set the cardinality as needed

## Learn More

For complete specification details, see the [official IDS documentation](https://github.com/buildingSMART/IDS/blob/development/Documentation/UserManual/specifications.md).
