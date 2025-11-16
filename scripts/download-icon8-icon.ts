#!/usr/bin/env tsx

/**
 * Download the icon8 stacked organizational chart icon
 * Usage: tsx scripts/download-icon8-icon.ts
 * 
 * This script attempts to download the icon from icon8.com
 * If it fails, you can manually download from:
 * https://icons8.com/icons/set/stacked-organizational-chart-highlighted-first-node
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import https from 'https'

const publicDir = join(process.cwd(), 'public')
const outputPath = join(publicDir, 'icon-source.png')

// Icon8 icon IDs - try different possible IDs
const possibleIconIds = [
  'stacked-organizational-chart-highlighted-first-node',
  'organizational-chart',
  'org-chart',
]

function downloadImage(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = require('fs').createWriteStream(outputPath)
        response.pipe(fileStream)
        fileStream.on('finish', () => {
          fileStream.close()
          resolve()
        })
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`))
      }
    }).on('error', reject)
  })
}

async function tryDownloadIcon() {
  console.log('Attempting to download icon8 icon...\n')

  // Try different icon8 URL patterns
  const urls = [
    `https://img.icons8.com/color/512/stacked-organizational-chart-highlighted-first-node.png`,
    `https://img.icons8.com/ios-filled/512/stacked-organizational-chart-highlighted-first-node.png`,
    `https://img.icons8.com/material-rounded/512/stacked-organizational-chart-highlighted-first-node.png`,
    `https://img.icons8.com/fluency/512/stacked-organizational-chart-highlighted-first-node.png`,
  ]

  for (const url of urls) {
    try {
      console.log(`Trying: ${url}...`)
      await downloadImage(url, outputPath)
      if (existsSync(outputPath)) {
        console.log(`✓ Successfully downloaded icon to: ${outputPath}`)
        console.log('\nNow run: tsx scripts/generate-favicons.ts public/icon-source.png')
        return
      }
    } catch (error) {
      console.log(`✗ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  console.log('\n✗ Could not automatically download the icon.')
  console.log('\nPlease download manually:')
  console.log('1. Visit: https://icons8.com/icons/set/stacked-organizational-chart-highlighted-first-node')
  console.log('2. Download as PNG (512x512 or larger recommended)')
  console.log('3. Save it as: public/icon-source.png')
  console.log('4. Run: tsx scripts/generate-favicons.ts public/icon-source.png')
}

tryDownloadIcon().catch(console.error)

