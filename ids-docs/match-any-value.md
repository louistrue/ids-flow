A lot of real IDS checks aren't "this property must equal *X*" — they're "this element must **have** this property at all, whatever the value." The IDS schema supports both: every value-bearing facet (`property`, `attribute`, `classification`, `material`) makes the `<value>` element **optional**, and an omitted `<value>` is a wildcard.

In the editor, this is just **leave the value field empty** — the canvas and inspector make the wildcard state obvious so you don't have to wonder whether the field is empty by accident.

## The pattern, four ways

The "Any" hint shows up across all four value-bearing facet nodes:

![Material, classification, attribute, and property facets all showing the wildcard state on the canvas](/docs/screenshots/18-any-facets-overview.png)

| Facet | Empty-value display | Maps to IDS XML |
|---|---|---|
| **Material** | Node title is italic *"Any material"* | `<material/>` (no `<value>`) |
| **Classification** | Below the system name: *"Any code"* | `<classification><system>…</system></classification>` |
| **Attribute** | Below the attribute name: *"Any value"* | `<attribute><name>…</name></attribute>` |
| **Property** | After the data type: *"= any value"* | `<property><propertySet>…</propertySet><baseName>…</baseName></property>` |

If a Restriction node is connected to the facet, the editor shows *"restricted"* instead of *"Any …"* — because the facet still constrains the value, just via the restriction node rather than a fixed value.

## How to leave a value empty

Three of the four facets use a plain text input — you just clear it. **Material** uses a searchable dropdown, so it has an explicit `×` clear button inside the trigger (and `Backspace` / `Delete` while the trigger is focused does the same thing):

![Material inspector with the X clear button visible inside the value selector](/docs/screenshots/13-material-inspector-clearable.png)

After clearing, the node header switches to italic *"Any material"* and the inspector's placeholder reads *"Any material (leave empty) — or pick / type a name"*:

![Material node titled "Any material" in italics after clearing](/docs/screenshots/14-material-node-any.png)

The other three inspectors are the same pattern, no clear button needed:

![Property inspector — empty Value field with the "Leave empty to match any value" helper line](/docs/screenshots/15-property-inspector-empty.png)

## When to use it

- **Applicability**: "applies to anything that has a material assigned" (regardless of which one). Useful when you care about *whether* the model carries a piece of information, not the specific value.
- **Requirements**: combined with cardinality, you can express "this property must be present" (`cardinality="required"`) or "must not be present" (`cardinality="prohibited"`) without committing to a value.

## When NOT to use it

If you actually want to constrain the value to a finite set (`["R60", "R90", "R120"]`), don't leave the field empty — use the [bracketed-list shortcut](/docs/quick-start) to convert your typed values into a Restriction node. A wildcard facet means *any value passes*, including values you'd rather not.
