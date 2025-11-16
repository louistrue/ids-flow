/**
 * Custom Schema Store
 * 
 * Manages user-defined property sets and properties using localStorage.
 * Custom property sets are entity-agnostic and available across all contexts.
 */

export interface CustomPropertySet {
  name: string
  properties: string[]
  createdAt: string
}

interface CustomSchemaData {
  propertySets: CustomPropertySet[]
}

const STORAGE_KEY = 'idsedit-custom-schema'

function getStorageData(): CustomSchemaData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('Failed to load custom schema from localStorage:', error)
  }
  
  return { propertySets: [] }
}

function saveStorageData(data: CustomSchemaData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save custom schema to localStorage:', error)
  }
}

/**
 * Get all custom property sets
 */
export function getCustomPropertySets(): CustomPropertySet[] {
  return getStorageData().propertySets
}

/**
 * Add a new custom property set
 */
export function addCustomPropertySet(name: string): void {
  const data = getStorageData()
  const existingNames = data.propertySets.map(pset => pset.name)
  
  // Handle name conflicts by appending a number
  let finalName = name
  let counter = 1
  while (existingNames.includes(finalName)) {
    finalName = `${name}_${counter}`
    counter++
  }
  
  const newPropertySet: CustomPropertySet = {
    name: finalName,
    properties: [],
    createdAt: new Date().toISOString()
  }
  
  data.propertySets.push(newPropertySet)
  saveStorageData(data)
}

/**
 * Add a custom property to a property set
 */
export function addCustomProperty(psetName: string, propertyName: string): void {
  const data = getStorageData()
  const pset = data.propertySets.find(pset => pset.name === psetName)
  
  if (pset) {
    // Handle property name conflicts
    let finalPropertyName = propertyName
    let counter = 1
    while (pset.properties.includes(finalPropertyName)) {
      finalPropertyName = `${propertyName}_${counter}`
      counter++
    }
    
    pset.properties.push(finalPropertyName)
    saveStorageData(data)
  }
}

/**
 * Get custom properties for a specific property set
 */
export function getCustomProperties(psetName: string): string[] {
  const data = getStorageData()
  const pset = data.propertySets.find(pset => pset.name === psetName)
  return pset ? pset.properties : []
}

/**
 * Check if a property set name is custom (not IFC)
 */
export function isCustomPropertySet(name: string): boolean {
  const data = getStorageData()
  return data.propertySets.some(pset => pset.name === name)
}

/**
 * Delete a custom property set
 */
export function deleteCustomPropertySet(name: string): void {
  const data = getStorageData()
  data.propertySets = data.propertySets.filter(pset => pset.name !== name)
  saveStorageData(data)
}

/**
 * Delete a custom property from a property set
 */
export function deleteCustomProperty(psetName: string, propertyName: string): void {
  const data = getStorageData()
  const pset = data.propertySets.find(pset => pset.name === psetName)
  
  if (pset) {
    pset.properties = pset.properties.filter(prop => prop !== propertyName)
    saveStorageData(data)
  }
}

/**
 * Clear all custom data (for testing/reset)
 */
export function clearCustomSchema(): void {
  localStorage.removeItem(STORAGE_KEY)
}
