IDSedit is a visual editor for creating **Information Delivery Specifications (IDS)** - a [buildingSMART standard](https://www.buildingsmart.org/standards/bsi-standards/information-delivery-specification-ids/) for specifying and validating information requirements in IFC models.

## What is IDS?

IDS is an open standard developed by [buildingSMART International](https://www.buildingsmart.org/) that allows you to define what information should be present in a BIM model. For complete details about the IDS standard, please refer to the [official IDS documentation](https://github.com/buildingSMART/IDS/tree/development/Documentation).

Key concepts:
- **Specifications** define requirements for model elements
- **Applicability** identifies which elements a specification applies to
- **Requirements** define what information those elements must have
- **Facets** are the building blocks (Entity, Property, Classification, Material, Attribute, PartOf)

## Getting Started with IDSedit

1. **Create a new specification** - Use the visual flow editor to define applicability and requirements
2. **Add facets** - Drag and drop facets to build your specification
3. **Configure parameters** - Set entity types, properties, classifications, etc.
4. **Export your IDS** - Save as a standard `.ids` file compatible with any IDS-supporting software

## Learn More

- [Quick Start Guide](quick-start.md) - Get up and running with IDSedit
- [Integration Guide](integration-guide.md) - IDS file format and workflow integration

### Official IDS Resources

For detailed information about the IDS standard, facets, and specifications, please visit:

- [IDS Specification (buildingSMART)](https://github.com/buildingSMART/IDS) - Official IDS repository
- [IDS Documentation](https://github.com/buildingSMART/IDS/tree/development/Documentation) - Complete specification documentation
- [IDS Software Implementations](https://technical.buildingsmart.org/ids-software-implementations/) - Tools supporting IDS
- [buildingSMART Forums](https://forums.buildingsmart.org/) - Community support

## Attribution

IDS is a standard developed and maintained by [buildingSMART International](https://www.buildingsmart.org/). IDSedit is an independent tool that implements this standard.

The IDS specification and official documentation are licensed under [CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/) by buildingSMART International Ltd.
