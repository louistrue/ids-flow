A lot of real IDS checks aren't "this property must equal *X*" — they're "this element must **have** this property at all, whatever the value." The IDS schema supports both: every value-bearing facet (`property`, `attribute`, `classification`, `material`) makes the `<value>` element **optional**, and the classification's `<system>` element accepts a pattern restriction. An omitted or wildcarded value is a match-anything check.

In the editor, this is just **leave the value field empty**. The canvas and inspector make the wildcard state obvious — italic *"Any …"* labels and a clear `×` affordance in the input — so you can tell wildcard from in-progress at a glance.

## The pattern, four ways

Each value-bearing facet renders its empty-value state slightly differently — but always italicised and muted, with no concrete value present:

![Four facets on one canvas — three in their "Any" state, one Material showing a concrete "concrete" value for contrast](/docs/screenshots/18-any-facets-overview.png)

| Facet | When the value is empty | Maps to IDS XML |
|---|---|---|
| **Material** | Node title becomes italic *"Any material"* | `<material/>` (no `<value>`) |
| **Classification** (value only) | *"Any code"* under the system name | `<classification><system>…</system></classification>` |
| **Classification** (system + value) | Node title becomes italic *"Any classification"* | `<classification><system><xs:restriction base="xs:string"><xs:pattern value=".+"/></xs:restriction></system></classification>` |
| **Attribute** | *"Any value"* under the attribute name | `<attribute><name>…</name></attribute>` |
| **Property** | *"= any value"* after the data type | `<property><propertySet>…</propertySet><baseName>…</baseName></property>` |

If a Restriction node is connected to the facet, the editor shows *"restricted"* instead of *"Any …"* — the facet is still constrained, just via the restriction node rather than a fixed value.

## How to leave a value empty

Property, attribute, and classification-code use plain text inputs — clear them with `Backspace`. **Material** and the **classification system** use a searchable dropdown, so they have an explicit `×` clear button inside the trigger (`Backspace` / `Delete` on the focused trigger does the same thing):

![Material inspector with the X clear button visible inside the value selector](/docs/screenshots/13-material-inspector-clearable.png)

After clearing, the node title switches to italic *"Any material"* and the inspector's placeholder reads *"Any material (leave empty) — or pick / type a name"*:

![Material node titled "Any material" in italics after clearing](/docs/screenshots/14-material-node-any.png)

Classification works the same way: clear the system to mean "any classification (any system)". When emitted, the editor writes an XSD pattern restriction (`.+`) on `<system>` to make "any non-empty string" explicit — the IDS schema requires `<system>` to be present, so an empty simpleValue would semantically mean "match the empty string" rather than "any system".

![Classification inspector — Classification System cleared, helper line: "Leave empty to match any classification (any system)"](/docs/screenshots/17c-classification-inspector-empty.png)

Property and attribute use a plain text input — the helper line tells you the leave-empty trick:

![Property inspector — empty Value field with the "Leave empty to match any value" helper line](/docs/screenshots/15-property-inspector-empty.png)

## When to use it

- **Applicability**: "applies to anything that has a material assigned" (regardless of which one). Useful when you care about *whether* the model carries a piece of information, not the specific value.
- **Requirements**: combined with cardinality, you can express "this property must be present" (`cardinality="required"`) or "must not be present" (`cardinality="prohibited"`) without committing to a value.
- **Classification with no system**: "every element in this applicability must have *some* classification — system doesn't matter, value doesn't matter." Useful for early-stage IDS that just checks the team did the classification work at all.

## When NOT to use it

If you actually want to constrain the value to a finite set (`["R60", "R90", "R120"]`), don't leave the field empty — use the [bracketed-list shortcut](/docs/quick-start) to convert your typed values into a Restriction node. A wildcard facet means *any value passes*, including values you'd rather not.
