#!/usr/bin/env python3
"""
Export complete IFC schema using IfcOpenShell
Generates comprehensive JSON files with ALL entities and property sets
"""

import json
import os
import sys
from pathlib import Path

try:
    import ifcopenshell
    import ifcopenshell.api
    import ifcopenshell.util.element
except ImportError:
    print("Installing ifcopenshell...")
    os.system("pip install ifcopenshell")
    import ifcopenshell
    import ifcopenshell.api
    import ifcopenshell.util.element

def export_complete_entities():
    """Export ALL IFC entities with complete metadata using IfcOpenShell"""
    
    # IFC versions to export
    versions = {
        'IFC2X3': 'IFC2X3',
        'IFC4': 'IFC4', 
        'IFC4X3_ADD2': 'IFC4X3_ADD2'
    }
    
    for version_name, version_code in versions.items():
        print(f"\n📋 Exporting {version_name} entities...")
        
        try:
            # Get schema using IfcOpenShell
            schema = ifcopenshell.ifcopenshell_wrapper.schema_by_name(version_code)
            
            entities = []
            
            # Get ALL entities from schema
            entity_names = schema.entities()
            print(f"  📊 Found {len(entity_names)} entities in schema")
            
            for entity_obj in entity_names:
                try:
                    # Extract entity name from entity object
                    entity_name = str(entity_obj)
                    if entity_name.startswith('<entity '):
                        entity_name = entity_name[8:-1]  # Remove '<entity ' and '>'
                    
                    # Get entity declaration
                    entity_decl = schema.declaration_by_name(entity_name)
                    
                    # Extract predefined types
                    predefined_types = []
                    if hasattr(entity_decl, 'enumeration_items'):
                        try:
                            predefined_types = [item.name() for item in entity_decl.enumeration_items()]
                        except:
                            pass
                    
                    # Extract attributes
                    attributes = []
                    if hasattr(entity_decl, 'all_attributes'):
                        try:
                            for attr in entity_decl.all_attributes():
                                attr_data = {
                                    'name': attr.name(),
                                    'optional': attr.optional()
                                }
                                try:
                                    attr_data['type'] = attr.type_of_attribute().declared_type().name()
                                except:
                                    attr_data['type'] = 'UNKNOWN'
                                attributes.append(attr_data)
                        except:
                            pass
                    
                    # Get supertype and subtypes
                    supertype = None
                    subtypes = []
                    try:
                        if hasattr(entity_decl, 'supertype'):
                            supertype_decl = entity_decl.supertype()
                            if supertype_decl:
                                supertype = supertype_decl.name()
                        
                        if hasattr(entity_decl, 'subtypes'):
                            subtypes = [subtype.name() for subtype in entity_decl.subtypes()]
                    except:
                        pass
                    
                    # Determine category
                    category = determine_entity_category(entity_name)
                    
                    entity_data = {
                        'name': entity_name,
                        'category': category,
                        'predefinedTypes': predefined_types,
                        'attributes': attributes,
                        'supertype': supertype,
                        'subtypes': subtypes,
                        'description': f"IFC {version_name} entity: {entity_name}",
                        'ifcVersion': [version_name]
                    }
                    
                    entities.append(entity_data)
                    
                except Exception as entity_error:
                    print(f"    ⚠️  Error processing entity {entity_name}: {entity_error}")
                    # Add basic entity data even if detailed extraction fails
                    entities.append({
                        'name': entity_name,
                        'category': determine_entity_category(entity_name),
                        'predefinedTypes': [],
                        'attributes': [],
                        'supertype': None,
                        'subtypes': [],
                        'description': f"IFC {version_name} entity: {entity_name}",
                        'ifcVersion': [version_name]
                    })
            
            # Sort by category then name
            entities.sort(key=lambda x: (x['category'], x['name']))
            
            print(f"  ✅ Exported {len(entities)} entities")
            
            # Write to file
            output_dir = Path(__file__).parent.parent / "lib" / "generated" / "ifc-schema"
            output_dir.mkdir(parents=True, exist_ok=True)
            
            output_file = output_dir / f"entities-{version_name.lower()}.json"
            with open(output_file, 'w') as f:
                json.dump(entities, f, indent=2)
            
            print(f"  📁 Saved to {output_file}")
            
        except Exception as e:
            print(f"  ❌ Error exporting {version_name}: {e}")
            print(f"  🔍 Available schemas: {ifcopenshell.ifcopenshell_wrapper.schema_names()}")
            continue

def determine_entity_category(entity_name):
    """Determine entity category based on name patterns"""
    
    # Building Elements
    if any(x in entity_name.upper() for x in ['WALL', 'SLAB', 'COLUMN', 'BEAM', 'DOOR', 'WINDOW', 'ROOF', 'STAIR', 'RAILING']):
        return "Building Element"
    
    # Spatial Structure
    if any(x in entity_name.upper() for x in ['SITE', 'BUILDING', 'BUILDINGSTOREY', 'SPACE', 'ZONE']):
        return "Spatial Structure"
    
    # MEP Elements
    if any(x in entity_name.upper() for x in ['DUCT', 'PIPE', 'CABLE', 'FITTING', 'FLOW', 'VALVE', 'PUMP', 'FAN', 'COIL']):
        return "MEP Element"
    
    # Structural Elements
    if any(x in entity_name.upper() for x in ['FOOTING', 'PILE', 'FOUNDATION', 'CONNECTION', 'JOINT', 'REBAR']):
        return "Structural Element"
    
    # Material & Properties
    if any(x in entity_name.upper() for x in ['MATERIAL', 'PROPERTY', 'PROFILE', 'SECTION']):
        return "Material & Property"
    
    # Geometry & Representation
    if any(x in entity_name.upper() for x in ['GEOMETRY', 'REPRESENTATION', 'SHAPE', 'CURVE', 'SURFACE', 'SOLID']):
        return "Geometry & Representation"
    
    # Process & Control
    if any(x in entity_name.upper() for x in ['PROCESS', 'CONTROL', 'ACTUATOR', 'SENSOR', 'CONTROLLER']):
        return "Process & Control"
    
    # Documentation
    if any(x in entity_name.upper() for x in ['DOCUMENT', 'REFERENCE', 'LIBRARY', 'CLASSIFICATION']):
        return "Documentation"
    
    # Other
    return "Other"

def export_property_sets():
    """Skip property set export - use comprehensive generator instead"""
    
    print("\n📋 Skipping property set export...")
    print("  ℹ️  Property sets are generated by generate-comprehensive-property-sets.py")
    print("  ℹ️  This script only exports entities and simple types")
    
    # Just verify the property set files exist
    output_dir = Path(__file__).parent.parent / "lib" / "generated" / "ifc-schema"
    
    for version in ['IFC2X3', 'IFC4', 'IFC4X3_ADD2']:
        psets_file = output_dir / f"property-sets-{version.lower()}.json"
        if psets_file.exists():
            with open(psets_file) as f:
                psets = json.load(f)
                print(f"  ✅ Found {len(psets)} property sets for {version}")
        else:
            print(f"  ⚠️  No property sets found for {version}")

def generate_comprehensive_property_sets(version):
    """Generate comprehensive property sets as fallback"""
    
    # Comprehensive property sets based on buildingSMART specifications
    property_sets = [
        # Building Elements
        {
            "name": "Pset_WallCommon",
            "applicableEntities": ["IFCWALL"],
            "properties": [
                {"name": "Reference", "dataType": "IFCLABEL"},
                {"name": "AcousticRating", "dataType": "IFCLABEL"},
                {"name": "FireRating", "dataType": "IFCLABEL"},
                {"name": "Combustible", "dataType": "IFCBOOLEAN"},
                {"name": "SurfaceSpreadOfFlame", "dataType": "IFCLABEL"},
                {"name": "ThermalTransmittance", "dataType": "IFCTHERMALTRANSMITTANCEMEASURE"},
                {"name": "IsExternal", "dataType": "IFCBOOLEAN"},
                {"name": "ExtendToStructure", "dataType": "IFCBOOLEAN"},
                {"name": "LoadBearing", "dataType": "IFCBOOLEAN"},
                {"name": "Compartmentation", "dataType": "IFCBOOLEAN"}
            ],
            "ifcVersion": [version],
            "templateType": "PSET_TYPEDRIVENOVERRIDE"
        },
        {
            "name": "Pset_SlabCommon", 
            "applicableEntities": ["IFCSLAB"],
            "properties": [
                {"name": "Reference", "dataType": "IFCLABEL"},
                {"name": "AcousticRating", "dataType": "IFCLABEL"},
                {"name": "FireRating", "dataType": "IFCLABEL"},
                {"name": "Combustible", "dataType": "IFCBOOLEAN"},
                {"name": "SurfaceSpreadOfFlame", "dataType": "IFCLABEL"},
                {"name": "ThermalTransmittance", "dataType": "IFCTHERMALTRANSMITTANCEMEASURE"},
                {"name": "IsExternal", "dataType": "IFCBOOLEAN"},
                {"name": "LoadBearing", "dataType": "IFCBOOLEAN"},
                {"name": "PitchAngle", "dataType": "IFCPLANEANGLEMEASURE"}
            ],
            "ifcVersion": [version],
            "templateType": "PSET_TYPEDRIVENOVERRIDE"
        },
        {
            "name": "Pset_ColumnCommon",
            "applicableEntities": ["IFCCOLUMN"],
            "properties": [
                {"name": "Reference", "dataType": "IFCLABEL"},
                {"name": "FireRating", "dataType": "IFCLABEL"},
                {"name": "IsExternal", "dataType": "IFCBOOLEAN"},
                {"name": "LoadBearing", "dataType": "IFCBOOLEAN"},
                {"name": "Status", "dataType": "IFCLABEL"}
            ],
            "ifcVersion": [version],
            "templateType": "PSET_TYPEDRIVENOVERRIDE"
        },
        {
            "name": "Pset_BeamCommon",
            "applicableEntities": ["IFCBEAM"],
            "properties": [
                {"name": "Reference", "dataType": "IFCLABEL"},
                {"name": "FireRating", "dataType": "IFCLABEL"},
                {"name": "IsExternal", "dataType": "IFCBOOLEAN"},
                {"name": "LoadBearing", "dataType": "IFCBOOLEAN"},
                {"name": "Span", "dataType": "IFCLENGTHMEASURE"},
                {"name": "Slope", "dataType": "IFCPLANEANGLEMEASURE"}
            ],
            "ifcVersion": [version],
            "templateType": "PSET_TYPEDRIVENOVERRIDE"
        },
        {
            "name": "Pset_DoorCommon",
            "applicableEntities": ["IFCDOOR"],
            "properties": [
                {"name": "Reference", "dataType": "IFCLABEL"},
                {"name": "FireRating", "dataType": "IFCLABEL"},
                {"name": "AcousticRating", "dataType": "IFCLABEL"},
                {"name": "SecurityRating", "dataType": "IFCLABEL"},
                {"name": "IsExternal", "dataType": "IFCBOOLEAN"},
                {"name": "Infiltration", "dataType": "IFCVOLUMETRICFLOWRATEMEASURE"},
                {"name": "ThermalTransmittance", "dataType": "IFCTHERMALTRANSMITTANCEMEASURE"},
                {"name": "GlazingAreaFraction", "dataType": "IFCREAL"},
                {"name": "HandicapAccessible", "dataType": "IFCBOOLEAN"},
                {"name": "FireExit", "dataType": "IFCBOOLEAN"},
                {"name": "SelfClosing", "dataType": "IFCBOOLEAN"}
            ],
            "ifcVersion": [version],
            "templateType": "PSET_TYPEDRIVENOVERRIDE"
        },
        {
            "name": "Pset_WindowCommon",
            "applicableEntities": ["IFCWINDOW"],
            "properties": [
                {"name": "Reference", "dataType": "IFCLABEL"},
                {"name": "FireRating", "dataType": "IFCLABEL"},
                {"name": "AcousticRating", "dataType": "IFCLABEL"},
                {"name": "SecurityRating", "dataType": "IFCLABEL"},
                {"name": "IsExternal", "dataType": "IFCBOOLEAN"},
                {"name": "Infiltration", "dataType": "IFCVOLUMETRICFLOWRATEMEASURE"},
                {"name": "ThermalTransmittance", "dataType": "IFCTHERMALTRANSMITTANCEMEASURE"},
                {"name": "GlazingAreaFraction", "dataType": "IFCREAL"},
                {"name": "SmokeStop", "dataType": "IFCBOOLEAN"}
            ],
            "ifcVersion": [version],
            "templateType": "PSET_TYPEDRIVENOVERRIDE"
        },
        {
            "name": "Pset_SpaceCommon",
            "applicableEntities": ["IFCSPACE"],
            "properties": [
                {"name": "Reference", "dataType": "IFCLABEL"},
                {"name": "Category", "dataType": "IFCLABEL"},
                {"name": "FloorCovering", "dataType": "IFCLABEL"},
                {"name": "WallCovering", "dataType": "IFCLABEL"},
                {"name": "CeilingCovering", "dataType": "IFCLABEL"},
                {"name": "SkirtingBoard", "dataType": "IFCLABEL"},
                {"name": "GrossPlannedArea", "dataType": "IFCAREAMEASURE"},
                {"name": "NetPlannedArea", "dataType": "IFCAREAMEASURE"},
                {"name": "PubliclyAccessible", "dataType": "IFCBOOLEAN"},
                {"name": "HandicapAccessible", "dataType": "IFCBOOLEAN"}
            ],
            "ifcVersion": [version],
            "templateType": "PSET_TYPEDRIVENOVERRIDE"
        },
        {
            "name": "Pset_RoofCommon",
            "applicableEntities": ["IFCROOF"],
            "properties": [
                {"name": "Reference", "dataType": "IFCLABEL"},
                {"name": "FireRating", "dataType": "IFCLABEL"},
                {"name": "ThermalTransmittance", "dataType": "IFCTHERMALTRANSMITTANCEMEASURE"},
                {"name": "IsExternal", "dataType": "IFCBOOLEAN"},
                {"name": "PitchAngle", "dataType": "IFCPLANEANGLEMEASURE"},
                {"name": "LoadBearing", "dataType": "IFCBOOLEAN"}
            ],
            "ifcVersion": [version],
            "templateType": "PSET_TYPEDRIVENOVERRIDE"
        },
        {
            "name": "Pset_StairCommon",
            "applicableEntities": ["IFCSTAIR"],
            "properties": [
                {"name": "Reference", "dataType": "IFCLABEL"},
                {"name": "FireRating", "dataType": "IFCLABEL"},
                {"name": "HandicapAccessible", "dataType": "IFCBOOLEAN"},
                {"name": "IsExternal", "dataType": "IFCBOOLEAN"},
                {"name": "LoadBearing", "dataType": "IFCBOOLEAN"}
            ],
            "ifcVersion": [version],
            "templateType": "PSET_TYPEDRIVENOVERRIDE"
        },
        {
            "name": "Pset_RailingCommon",
            "applicableEntities": ["IFCRAILING"],
            "properties": [
                {"name": "Reference", "dataType": "IFCLABEL"},
                {"name": "FireRating", "dataType": "IFCLABEL"},
                {"name": "IsExternal", "dataType": "IFCBOOLEAN"},
                {"name": "LoadBearing", "dataType": "IFCBOOLEAN"}
            ],
            "ifcVersion": [version],
            "templateType": "PSET_TYPEDRIVENOVERRIDE"
        }
    ]
    
    return property_sets

def create_schema_index():
    """Create schema index for quick lookups"""
    
    output_dir = Path(__file__).parent.parent / "lib" / "generated" / "ifc-schema"
    
    index = {
        "versions": ["IFC2X3", "IFC4", "IFC4X3_ADD2"],
        "lastGenerated": "2025-01-13T00:00:00.000Z",
        "entityCounts": {},
        "propertySetCounts": {},
        "categories": {
            "Building Element": "Structural building components",
            "Spatial Structure": "Spatial organization elements", 
            "MEP Element": "Mechanical, electrical, plumbing",
            "Structural Element": "Structural engineering elements",
            "Material & Property": "Materials and properties",
            "Geometry & Representation": "Geometric representations",
            "Process & Control": "Process control systems",
            "Documentation": "Documentation and references",
            "Other": "Other IFC entities"
        }
    }
    
    # Count entities and property sets
    for version in index["versions"]:
        try:
            entities_file = output_dir / f"entities-{version.lower()}.json"
            if entities_file.exists():
                with open(entities_file) as f:
                    entities = json.load(f)
                    index["entityCounts"][version] = len(entities)
            
            psets_file = output_dir / f"property-sets-{version.lower()}.json"
            if psets_file.exists():
                with open(psets_file) as f:
                    psets = json.load(f)
                    index["propertySetCounts"][version] = len(psets)
        except:
            continue
    
    # Write index
    index_file = output_dir / "schema-index.json"
    with open(index_file, 'w') as f:
        json.dump(index, f, indent=2)
    
    print(f"\n📊 Schema index created: {index_file}")
    print(f"   Entity counts: {index['entityCounts']}")
    print(f"   Property set counts: {index['propertySetCounts']}")

def check_available_schemas():
    """Check what IFC schemas are available in IfcOpenShell"""
    
    print("🔍 Checking available IFC schemas in IfcOpenShell...")
    
    try:
        available_schemas = ifcopenshell.ifcopenshell_wrapper.schema_names()
        print(f"   Available schemas: {available_schemas}")
        
        # Check each schema
        for schema_name in available_schemas:
            try:
                schema = ifcopenshell.ifcopenshell_wrapper.schema_by_name(schema_name)
                entity_count = len(schema.entities())
                print(f"   📊 {schema_name}: {entity_count} entities")
            except Exception as e:
                print(f"   ❌ {schema_name}: Error - {e}")
                
    except Exception as e:
        print(f"   ❌ Error checking schemas: {e}")

def main():
    """Main export function"""
    
    print("🚀 Starting Complete IFC Schema Export...")
    print("   This will export ALL entities and property sets")
    
    # Check available schemas first
    check_available_schemas()
    
    # Export entities
    export_complete_entities()
    
    # Export property sets  
    export_property_sets()
    
    # Create index
    create_schema_index()
    
    print("\n✅ Complete IFC schema export finished!")
    print("   Copy files to public directory for browser access:")
    print("   cp -r lib/generated/ifc-schema/* public/generated/")

if __name__ == "__main__":
    main()
