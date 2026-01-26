# Developer Guide

Technical information for developers working with IDSedit or integrating IDS files into workflows.

## IDS File Format

IDS files are XML documents validated against an XSD schema. You can inspect any `.ids` file with a text editor to understand its structure.

## Validating IDS Files

Ensure your IDS files are valid using:

- [buildingSMART IDS Audit Tool](https://github.com/buildingSMART/IDS-Audit-tool/) - Official validation tool
- [Xbim IDS Validator](https://www.xbim.it/ids) - Browser-based validation (runs locally)

## IDSedit Export

IDSedit exports standard-compliant IDS files that work with any IDS-compatible software. The exported files:

- Conform to the official IDS XSD schema
- Support IFC2X3, IFC4, and IFC4X3_ADD2
- Include all configured metadata and specifications

## IFC Checking Workflow

1. Create specifications in IDSedit
2. Export as `.ids` file
3. Use an IDS-compatible checker to validate IFC models
4. Review compliance reports

## Resources

### Official buildingSMART Resources
- [IDS Specification Repository](https://github.com/buildingSMART/IDS)
- [IDS XSD Schema](https://github.com/buildingSMART/IDS/tree/development/Schema)
- [IDS Test Cases](https://github.com/buildingSMART/IDS/tree/development/Documentation/ImplementersDocumentation/TestCases)
- [IDS Software Implementations](https://technical.buildingsmart.org/ids-software-implementations/)

### IFC Documentation
- [IFC4x3 Documentation](https://ifc43-docs.standards.buildingsmart.org/)
- [IFC4 Documentation](https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/)
- [IFC2x3 Documentation](https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/TC1/HTML/)

### Community
- [buildingSMART Forums](https://forums.buildingsmart.org/)
- [IDS GitHub Issues](https://github.com/buildingSMART/IDS/issues)

## Contributing to IDSedit

IDSedit is open source. Visit the [GitHub repository](https://github.com/louistrue/ids-flow) to report issues or contribute.
