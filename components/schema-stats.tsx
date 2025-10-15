"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSchemaStats, type IFCVersion } from "@/lib/ifc-schema"
import { Database, Layers, Package } from "lucide-react"

interface SchemaStatsProps {
    ifcVersion: IFCVersion
}

export function SchemaStats({ ifcVersion }: SchemaStatsProps) {
    const [stats, setStats] = useState<{ version: string; entityCount: number; propertySetCount: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            try {
                const schemaStats = await getSchemaStats()
                setStats(schemaStats)
            } catch (error) {
                console.warn('Failed to load schema stats:', error)
                // Fallback stats
                setStats([
                    { version: 'IFC2X3', entityCount: 653, propertySetCount: 66 },
                    { version: 'IFC4', entityCount: 776, propertySetCount: 66 },
                    { version: 'IFC4X3_ADD2', entityCount: 876, propertySetCount: 76 }
                ])
            } finally {
                setLoading(false)
            }
        }

        loadStats()
    }, [])

    const currentStats = stats.find(s => s.version === ifcVersion)

    if (loading) {
        return (
            <Card className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-accent" />
                    <span className="text-xs text-muted-foreground">Loading schema stats...</span>
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-start gap-2">
                <Database className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-foreground">IFC Schema Coverage</p>
                        <Badge variant="outline" className="text-xs">
                            {ifcVersion}
                        </Badge>
                    </div>
                    {currentStats && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Layers className="h-3 w-3 text-chart-1" />
                                <span className="text-xs text-muted-foreground">
                                    {currentStats.entityCount} Entities
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Package className="h-3 w-3 text-chart-2" />
                                <span className="text-xs text-muted-foreground">
                                    {currentStats.propertySetCount} Property Sets
                                </span>
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Full IFC schema integration with comprehensive entity and property coverage.
                    </p>
                </div>
            </div>
        </Card>
    )
}
