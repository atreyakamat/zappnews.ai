```markdown
# Design System Document

## 1. Overview & Creative North Star: "The Ethereal Intelligence"

This design system is engineered to move beyond the utilitarian "SaaS" look. Our Creative North Star is **The Ethereal Intelligence**. It imagines a UI that doesn't just sit on a screen, but floats within an infinite, dark void—much like the instrumentation of a high-end electric vehicle or a premium editorial magazine.

By blending the structural logic of **Notion** with the high-contrast elegance of **Apple News**, we create a space that feels both hyper-productive and deeply luxurious. We reject the "flat" web; instead, we utilize depth, refraction, and tonal layering to guide the user’s eye. The interface should feel like a living, breathing glass sculpture: heavy enough to feel premium, but light enough to feel futuristic.

---

## 2. Colors & Surface Logic

The palette is anchored in absolute darkness to leverage OLED technology, punctuated by vibrant, neon light-leaks that signify intelligence and action.

### The Palette
*   **Background (OLED Black):** `#0e0e0e` (Surface) and `#000000` (Surface Container Lowest).
*   **Primary (Intelligence Purple):** `#ca98ff` to `#8523dd`.
*   **Secondary (Electric Cyan):** `#00bdfd` to `#00668a`.
*   **Accents:** Use a linear gradient of `#8A2BE2` to `#00BFFF` only for high-signal moments (AI processing, primary CTAs, or active states).

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. We define boundaries through **Tonal Transitions**. To separate content, transition from `surface-container-low` to `surface-container-high`. If a boundary feels invisible, increase the vertical spacing using the **Spacing Scale (8 or 10)** rather than adding a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers:
1.  **Base Layer:** `surface` (#0e0e0e) — The infinite floor.
2.  **Structural Sections:** `surface-container-low` (#131313) — Defines large content areas.
3.  **Interactive Cards:** `surface-container-highest` (#262626) — The "Top" layer for actionable items.

### The "Glass & Gradient" Rule
For floating modals, navigation bars, and highlight cards, use **Glassmorphism**.
*   **Fill:** `surface-variant` at 40-60% opacity.
*   **Effect:** Backdrop Blur (20px - 40px).
*   **Soul:** Apply a subtle 10% opacity gradient stroke (Primary to Secondary) to the top-left edge to simulate light hitting the glass rim.

---

## 3. Typography: Editorial Precision

Our typography pairs the technical clarity of **Inter** with the sophisticated, wide-stance architecture of **Manrope**.

*   **Display & Headlines (Manrope):** These are our "Editorial" anchors. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero moments. This mimics the authoritative feel of a premium news app.
*   **Body & Titles (Inter):** These are our "Functional" anchors. `body-md` (0.875rem) provides the Notion-like clarity required for complex AI data.
*   **The Hierarchy of Truth:**
    *   **Headline-lg:** Use for primary page titles. Always white (`on-surface`).
    *   **Title-sm:** Use for card headings. Use `primary` (#ca98ff) for a "futuristic" highlight.
    *   **Label-md:** Use `on-surface-variant` (#ababab) for metadata. This keeps the secondary information from competing with the core content.

---

## 4. Elevation & Depth

We achieve hierarchy through **Tonal Layering**, not shadows alone. 

### The Layering Principle
Never place a card directly on the background without a tonal shift. A card using `surface-container-highest` should sit on a section using `surface-container-low`. This creates a natural "lift" that feels organic.

### Ambient Shadows
When an element must "float" (e.g., a FAB or a detached navigation bar):
*   **Blur:** 40px - 60px.
*   **Opacity:** 8%.
*   **Color:** Use a tinted shadow (`primary-dim` or `secondary-dim`) rather than black. This simulates the glow of the neon accents hitting the dark surface.

### The "Ghost Border" Fallback
If accessibility requires a container boundary, use a **Ghost Border**:
*   **Token:** `outline-variant` (#484848).
*   **Opacity:** 15%.
*   **Weight:** 1px.
*   **Note:** This is an exception, not the rule.

---

## 5. Components

### Buttons
*   **Primary:** A vibrant gradient of `primary` to `secondary`. Text is `on-primary-fixed` (Black) for maximum contrast. Radius: `full`.
*   **Secondary (Glass):** Backdrop blur (12px), 20% opacity `surface-bright` fill. Radius: `xl` (1.5rem).

### Input Fields
*   **Style:** No background fill. Only a `Ghost Border` bottom-line or a subtle `surface-container-high` rounded box (`md`).
*   **Focus State:** The border glows with a `secondary` (#00bdfd) outer shadow (blur 10px, opacity 20%).

### Cards (The "Glass Plate")
*   **Corner Radius:** Always `xl` (1.5rem) or `24px` for large containers.
*   **Padding:** Use `spacing-6` (2rem) for internal breathing room. 
*   **Rule:** Forbid divider lines within cards. Use `spacing-3` to `spacing-5` to create logical groupings.

### AI Processing State (Custom Component)
*   **The Aura:** A mesh gradient blur behind the text using `primary` and `secondary` tokens at 30% opacity, slowly pulsating.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Place a large `display-sm` headline off-center to create an editorial, high-end feel.
*   **Embrace Negative Space:** If you think there’s enough room, add another `spacing-4` unit.
*   **Leverage OLED:** Ensure the true `#000000` background is visible in at least 30% of the screen to save battery and provide "infinite" depth.

### Don't:
*   **Don't use pure grey shadows:** It muddies the premium dark theme.
*   **Don't use 1px solid dividers:** This is the quickest way to make a premium app look like a generic template.
*   **Don't use high-contrast borders:** They trap the user’s eye and break the "Ethereal" flow.
*   **Don't crowd the Glass:** If a card has backdrop-blur, ensure the background it sits on has enough visual variety (gradients or shapes) to make the blur noticeable.

---
**Director's Note:** Every pixel must feel intentional. If an element exists, it must either be light (content) or the glass that holds it (container). Nothing else.```