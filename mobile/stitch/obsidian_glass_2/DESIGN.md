# Design System Documentation: The Cinematic Interface

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**

This design system is not a utility; it is an atmosphere. By blending the structured minimalism of Notion with the high-performance aesthetic of Tesla and the editorial elegance of Apple News, we move away from "app-like" interfaces toward a **Cinematic Experience**.

The goal is to eliminate the "boxed-in" feeling of traditional mobile UI. We achieve this through **Atmospheric Depth**: using true OLED blacks to let high-end typography and glass-morphic layers float in an infinite void. We break the grid through intentional asymmetry—allowing imagery to bleed to the edges while text remains anchored in strict, sophisticated columns.

---

## 2. Colors & Surface Architecture

The palette is rooted in absolute darkness to maximize the contrast of our neon accents and the ethereal quality of our glass components.

### The Palette (Material Design 3 Logic)
*   **Background (`#000000`):** The "Infinite Canvas." Always use True Black for the base layer to ensure perfect OLED integration.
*   **Primary (`#8ff5ff`):** "Electric Cyan." Use sparingly for high-action triggers.
*   **Secondary (`#a68cff`):** "Deep Lavender." Used for glass border glows and soft secondary actions.
*   **Tertiary (`#ff59e3`):** "Neon Magenta." Reserved for status highlights and premium "Easter egg" moments.

### The "No-Line" Rule
**Explicit Instruction:** Prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts or tonal transitions. To separate a section, shift from `surface` (`#0e0e0e`) to `surface-container-low` (`#131313`). 

### The Glass & Gradient Rule
Interactive containers must feel like "frozen light." 
*   **Fill:** Use `surface-variant` (`#262626`) at 40-60% opacity.
*   **Effect:** Apply a `backdrop-filter: blur(20px)`.
*   **Glow:** Apply a 1.5px linear-gradient border from `secondary` (`#a68cff`) to `primary` (`#8ff5ff`) at 30% opacity. This creates a "Ghost Glow" rather than a hard line.

---

## 3. Typography: Editorial Authority

We use **Inter** to achieve a technical yet humanistic feel. The hierarchy is extreme: oversized displays contrasted with ultra-compact labels.

*   **Display-LG (3.5rem / Tracking -0.02em):** Use for hero moments. Tighten tracking to feel like a high-end magazine.
*   **Headline-SM (1.5rem / Medium):** The workhorse for section titles. Always paired with generous top-padding (`spacing-12`).
*   **Body-MD (0.875rem / Regular):** Optimized for readability against dark backgrounds. Use `on-surface-variant` (`#ababab`) for secondary body text to reduce eye strain.
*   **Label-SM (0.6875rem / All Caps / Spacing 0.05em):** Used for micro-data. The wide letter spacing adds a "Tesla-dashboard" technical feel.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are forbidden. We use **Ambient Luminance** to define depth.

### The Layering Principle
1.  **Base (Level 0):** `surface-container-lowest` (#000000).
2.  **Section (Level 1):** `surface-container-low` (#131313).
3.  **Card (Level 2):** Glassmorphism Fill (20% Opacity) + Backdrop Blur.
4.  **Floating Action (Level 3):** `surface-bright` (#2c2c2c) with a tinted shadow.

### Ambient Shadows
When an element must "float" (e.g., a modal), use a shadow with a 40px blur, 0px offset, and 8% opacity. The shadow color must be a tint of `primary` (`#8ff5ff`) or `secondary` (`#a68cff`), never pure black. This mimics the way neon light reflects off a dark surface.

---

## 5. Components

### Buttons
*   **Primary:** A vibrant gradient from `primary` to `primary-dim`. Roundedness: `full`. No border. Text is `on-primary` (dark).
*   **Secondary (The Glass Button):** Glassmorphic fill with the "Ghost Glow" border. Text is `primary`.
*   **Tertiary:** Plain text using `title-sm` with a `primary` chevron icon.

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Implementation:** Separate list items using `spacing-4` (1rem) of vertical whitespace. 
*   **The "Editorial Bleed":** In cards, imagery should have a `md` (1.5rem) corner radius but can occasionally bleed to the top/left edges to break the container’s rigidity.

### Input Fields
*   **Default State:** `surface-container-highest` background. No border.
*   **Active State:** "Ghost Glow" border (20% opacity `primary`) and the label slides into a `label-sm` position using `tertiary` color.
*   **Error:** Background remains dark; a subtle `error-dim` (`#d73357`) outer glow appears.

### Signature Component: The "Luminescence Slider"
A custom slider where the track is `surface-container-high` and the active portion is a glowing gradient of `primary` to `secondary`. The thumb is a high-gloss glass circle.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use "Negative Space" as a structural element. If a screen feels cluttered, increase the spacing from `8` to `12`.
*   **DO** use `rounded-md` (24px) for large containers and `rounded-sm` (8px) for internal elements like chips.
*   **DO** use subtle haptic feedback triggers for all glass-morphic components to reinforce the "physicality" of the light.

### Don't
*   **DON’T** use `#ffffff` for secondary text. It creates "haloing" on OLED screens. Use `on-surface-variant` (`#ababab`).
*   **DON’T** use 1px solid white or grey borders. They break the cinematic immersion. If a container isn't visible, adjust the `surface` tier, don't add a line.
*   **DON’T** use standard eases. Use a "Power4.out" (Cubic) transition for all glass reveals to mimic high-end automotive UI.