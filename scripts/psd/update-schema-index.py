#!/usr/bin/env python3
"""
Update schema index with correct property set counts
"""

import json
from pathlib import Path

def update_schema_index():
    """Update schema index with correct counts"""
    
    output_dir = Path(__file__).parent.parent.parent / "lib" / "generated" / "ifc-schema"
    
    # Load existing index
    index_file = output_dir / "schema-index.json"
    with open(index_file) as f:
        index = json.load(f)
    
    # Update property set counts
    versions = ["IFC2X3", "IFC4", "IFC4X3_ADD2"]
    
    for version in versions:
        psets_file = output_dir / f"property-sets-{version.lower()}.json"
        if psets_file.exists():
            with open(psets_file) as f:
                psets = json.load(f)
                index["propertySetCounts"][version] = len(psets)
                print(f"📊 {version}: {len(psets)} property sets")
    
    # Write updated index
    with open(index_file, 'w') as f:
        json.dump(index, f, indent=2)
    
    print(f"\n✅ Schema index updated: {index_file}")
    print(f"   Property set counts: {index['propertySetCounts']}")

if __name__ == "__main__":
    update_schema_index()
