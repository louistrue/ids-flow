export type FacetType =
    | "spec"
    | "entity"
    | "property"
    | "attribute"
    | "classification"
    | "material"
    | "partOf"
    | "restriction"

export interface FacetClasses {
    text: string
    iconBg: string
    border: string
    ring: string
    handle: string
    minimap: string
}

export const FACET_COLORS: Record<FacetType, FacetClasses> = {
    spec: {
        text: "text-primary",
        iconBg: "bg-primary/10",
        border: "border-primary",
        ring: "ring-primary/40",
        handle: "bg-primary",
        minimap: "oklch(0.80 0.08 292)",
    },
    entity: {
        text: "text-accent",
        iconBg: "bg-accent/10",
        border: "border-accent",
        ring: "ring-accent/40",
        handle: "bg-accent",
        minimap: "oklch(0.77 0.08 233)",
    },
    property: {
        text: "text-chart-3",
        iconBg: "bg-chart-3/10",
        border: "border-chart-3",
        ring: "ring-chart-3/40",
        handle: "bg-chart-3",
        minimap: "oklch(0.80 0.09 142)",
    },
    attribute: {
        text: "text-chart-4",
        iconBg: "bg-chart-4/10",
        border: "border-chart-4",
        ring: "ring-chart-4/40",
        handle: "bg-chart-4",
        minimap: "oklch(0.80 0.08 35)",
    },
    classification: {
        text: "text-chart-5",
        iconBg: "bg-chart-5/10",
        border: "border-chart-5",
        ring: "ring-chart-5/40",
        handle: "bg-chart-5",
        minimap: "oklch(0.80 0.10 342)",
    },
    material: {
        text: "text-chart-2",
        iconBg: "bg-chart-2/10",
        border: "border-chart-2",
        ring: "ring-chart-2/40",
        handle: "bg-chart-2",
        minimap: "oklch(0.77 0.08 186)",
    },
    partOf: {
        text: "text-chart-1",
        iconBg: "bg-chart-1/10",
        border: "border-chart-1",
        ring: "ring-chart-1/40",
        handle: "bg-chart-1",
        minimap: "oklch(0.80 0.07 273)",
    },
    restriction: {
        text: "text-muted-foreground",
        iconBg: "bg-muted-foreground/10",
        border: "border-muted-foreground",
        ring: "ring-muted-foreground/40",
        handle: "bg-muted-foreground",
        minimap: "oklch(0.70 0.04 264)",
    },
}

export function getFacet(type: FacetType): FacetClasses {
    return FACET_COLORS[type]
}


