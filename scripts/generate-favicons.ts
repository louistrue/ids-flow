#!/usr/bin/env tsx

/**
 * Generate favicons from a source image
 * Usage: tsx scripts/generate-favicons.ts <source-image-path>
 * 
 * The source image should be at least 512x512 pixels for best results.
 * You can download the icon8 icon from:
 * https://icons8.com/icons/set/stacked-organizational-chart-highlighted-first-node
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'mstile-150x150.png', size: 150 },
]

const publicDir = join(process.cwd(), 'public')

function generateFavicons(sourceImage: string) {
  if (!existsSync(sourceImage)) {
    console.error(`Error: Source image not found: ${sourceImage}`)
    process.exit(1)
  }

  console.log(`Generating favicons from: ${sourceImage}`)
  console.log(`Output directory: ${publicDir}\n`)

  // Generate PNG favicons using sips (macOS built-in)
  sizes.forEach(({ name, size }) => {
    const outputPath = join(publicDir, name)
    try {
      execSync(`sips -z ${size} ${size} "${sourceImage}" --out "${outputPath}"`, {
        stdio: 'inherit',
      })
      console.log(`✓ Generated ${name} (${size}x${size})`)
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error)
    }
  })

  // Generate favicon.ico (multi-size ICO file)
  // Note: sips doesn't create ICO files, so we'll copy the 32x32 PNG as favicon.ico
  // For a proper ICO file, you might want to use an online converter or ImageMagick
  const favicon32Path = join(publicDir, 'favicon-32x32.png')
  const faviconIcoPath = join(publicDir, 'favicon.ico')
  if (existsSync(favicon32Path)) {
    try {
      execSync(`cp "${favicon32Path}" "${faviconIcoPath}"`, { stdio: 'inherit' })
      console.log(`✓ Generated favicon.ico (copied from 32x32)`)
    } catch (error) {
      console.error(`✗ Failed to generate favicon.ico:`, error)
    }
  }

  // Generate SVG favicon (copy source if it's SVG, otherwise create a simple one)
  const svgPath = join(publicDir, 'favicon.svg')
  if (sourceImage.endsWith('.svg')) {
    try {
      execSync(`cp "${sourceImage}" "${svgPath}"`, { stdio: 'inherit' })
      console.log(`✓ Generated favicon.svg`)
    } catch (error) {
      console.error(`✗ Failed to generate favicon.svg:`, error)
    }
  } else {
    // Create a simple SVG that references the PNG
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <image href="/android-chrome-512x512.png" width="512" height="512"/>
</svg>`
    require('fs').writeFileSync(svgPath, svgContent)
    console.log(`✓ Generated favicon.svg (references PNG)`)
  }

  console.log('\n✓ Favicon generation complete!')
  console.log('\nNote: For a proper favicon.ico file with multiple sizes,')
  console.log('consider using an online tool like https://realfavicongenerator.net/')
}

// Main execution
const sourceImage = process.argv[2]

if (!sourceImage) {
  console.error('Usage: tsx scripts/generate-favicons.ts <source-image-path>')
  console.error('\nExample:')
  console.error('  tsx scripts/generate-favicons.ts ./icon-source.png')
  console.error('\nTo download the icon8 icon:')
  console.error('  1. Visit: https://icons8.com/icons/set/stacked-organizational-chart-highlighted-first-node')
  console.error('  2. Download as PNG (512x512 or larger)')
  console.error('  3. Run this script with the downloaded file path')
  process.exit(1)
}

generateFavicons(sourceImage)

