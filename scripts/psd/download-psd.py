#!/usr/bin/env python3
"""
Download official buildingSMART Property Set Definition (PSD) files
for all IFC versions to get ALL property sets (300+)
"""

import os
import requests
import zipfile
import json
from pathlib import Path
from urllib.parse import urljoin
import time

# buildingSMART official PSD download URLs
PSD_URLS = {
    'IFC2X3': 'https://standards.buildingsmart.org/IFC/RELEASE/IFC2x3/FINAL/IFC2X3_PropertySets.zip',
    'IFC4': 'https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/IFC4_PropertySets.zip',
    'IFC4X3_ADD2': 'https://standards.buildingsmart.org/IFC/RELEASE/IFC4x3_ADD2/IFC4X3_ADD2_PropertySets.zip'
}

# Alternative bSDD API endpoints for property sets
BSDD_URLS = {
    'IFC2X3': 'https://identifier.buildingsmart.org/uri/ifc/ifc2x3/property-sets',
    'IFC4': 'https://identifier.buildingsmart.org/uri/ifc/ifc4/property-sets', 
    'IFC4X3_ADD2': 'https://identifier.buildingsmart.org/uri/ifc/ifc4x3_add2/property-sets'
}

def download_psd_zip(version, url, output_dir):
    """Download and extract PSD ZIP file"""
    print(f"📥 Downloading PSD for {version} from {url}")
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        zip_path = output_dir / f"{version}_PropertySets.zip"
        with open(zip_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Downloaded {len(response.content)} bytes to {zip_path}")
        
        # Extract ZIP
        extract_dir = output_dir / f"{version}_extracted"
        extract_dir.mkdir(exist_ok=True)
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        print(f"✅ Extracted to {extract_dir}")
        return extract_dir
        
    except Exception as e:
        print(f"❌ Failed to download PSD for {version}: {e}")
        return None

def crawl_bsdd_api(version, url):
    """Crawl bSDD API for property sets"""
    print(f"🔍 Crawling bSDD API for {version}: {url}")
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        property_sets = data.get('propertySets', [])
        
        print(f"✅ Found {len(property_sets)} property sets from bSDD")
        return property_sets
        
    except Exception as e:
        print(f"❌ Failed to crawl bSDD for {version}: {e}")
        return []

def find_xml_files(extract_dir):
    """Find all XML files in extracted directory"""
    xml_files = []
    
    if extract_dir and extract_dir.exists():
        for xml_file in extract_dir.rglob("*.xml"):
            xml_files.append(xml_file)
    
    print(f"📄 Found {len(xml_files)} XML files")
    return xml_files

def main():
    """Main download function"""
    print("🚀 Starting PSD Download for ALL IFC Versions")
    
    # Create output directory
    output_dir = Path(__file__).parent / "downloaded"
    output_dir.mkdir(exist_ok=True)
    
    results = {}
    
    for version in ['IFC2X3', 'IFC4', 'IFC4X3_ADD2']:
        print(f"\n📋 Processing {version}...")
        
        # Try official PSD download first
        psd_url = PSD_URLS.get(version)
        if psd_url:
            extract_dir = download_psd_zip(version, psd_url, output_dir)
            xml_files = find_xml_files(extract_dir)
            results[version] = {
                'source': 'official_psd',
                'xml_files': [str(f) for f in xml_files],
                'extract_dir': str(extract_dir) if extract_dir else None
            }
        else:
            print(f"⚠️  No official PSD URL for {version}")
            results[version] = {
                'source': 'none',
                'xml_files': [],
                'extract_dir': None
            }
        
        # Also try bSDD API as backup
        bsdd_url = BSDD_URLS.get(version)
        if bsdd_url:
            bsdd_property_sets = crawl_bsdd_api(version, bsdd_url)
            results[version]['bsdd_property_sets'] = bsdd_property_sets
        
        # Rate limiting
        time.sleep(1)
    
    # Save results
    results_file = output_dir / "download_results.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📊 Download Summary:")
    for version, result in results.items():
        xml_count = len(result.get('xml_files', []))
        bsdd_count = len(result.get('bsdd_property_sets', []))
        print(f"  {version}: {xml_count} XML files, {bsdd_count} bSDD property sets")
    
    print(f"\n✅ Download complete! Results saved to {results_file}")
    return results

if __name__ == "__main__":
    main()
