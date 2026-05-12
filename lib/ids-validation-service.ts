export interface ValidationResult {
    status: number
    message: string
    timestamp: string
    error?: string
    details?: string
}

export interface ValidationError {
    error: string
}

type IdsModule = typeof import('@ifc-lite/ids')

/**
 * Validate IDS XML using @ifc-lite/ids (fully client-side).
 *
 * Status mapping is kept compatible with the previous IfcTester-Service contract
 * so downstream UI (badges, overlay) doesn't need to special-case either backend:
 *   0 → valid
 *   5 → XML structure error (parse failure)
 *   8 → unhandled error
 *
 * @ifc-lite/ids is loaded via dynamic import so its top-level-await module body
 * never runs during Next.js SSR / prerender.
 */
export class IdsValidationService {
    private static instance: IdsValidationService
    private cache = new Map<string, ValidationResult>()
    private modulePromise: Promise<IdsModule> | null = null

    static getInstance(): IdsValidationService {
        if (!IdsValidationService.instance) {
            IdsValidationService.instance = new IdsValidationService()
        }
        return IdsValidationService.instance
    }

    async validateIdsXml(xml: string): Promise<ValidationResult> {
        if (!xml || xml.trim().length === 0) {
            throw new Error('No IDS XML provided')
        }

        const cacheKey = this.getCacheKey(xml)
        const cached = this.cache.get(cacheKey)
        if (cached) return cached

        const result = await this.runParse(xml)
        this.cache.set(cacheKey, result)
        return result
    }

    private async loadModule(): Promise<IdsModule> {
        if (!this.modulePromise) {
            // Clear the cached rejection on failure so a later validateIdsXml()
            // call can retry — without this, a single transient import error
            // (e.g. flaky chunk fetch) would permanently break validation for
            // the session.
            this.modulePromise = import('@ifc-lite/ids').catch((err) => {
                this.modulePromise = null
                throw err
            })
        }
        return this.modulePromise
    }

    private async runParse(xml: string): Promise<ValidationResult> {
        const timestamp = new Date().toISOString()
        try {
            const mod = await this.loadModule()
            mod.parseIDS(xml)
            return {
                status: 0,
                message: 'Valid IDS - No errors',
                timestamp,
            }
        } catch (err) {
            const mod = await this.loadModule().catch(() => null)
            if (mod && err instanceof mod.IDSParseError) {
                return {
                    status: 5,
                    message: err.message || 'XML structure errors',
                    details: err.details,
                    timestamp,
                }
            }
            // Some bundlers may produce a distinct error class per import — fall
            // back to a name check so we still surface parser failures as 5.
            if (err instanceof Error && err.name === 'IDSParseError') {
                return {
                    status: 5,
                    message: err.message || 'XML structure errors',
                    details: (err as Error & { details?: string }).details,
                    timestamp,
                }
            }
            return {
                status: 8,
                message: err instanceof Error ? err.message : 'Unhandled error occurred',
                timestamp,
            }
        }
    }

    private getCacheKey(xml: string): string {
        let hash = 0
        for (let i = 0; i < xml.length; i++) {
            const char = xml.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }
        return hash.toString()
    }

    clearCache(): void {
        this.cache.clear()
    }
}
