# Design System Strategy: The Neon Nocturne

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Curator."** 

We are moving away from the static, "boxy" feel of traditional news aggregators. Instead, we are building a fluid, immersive environment where information feels like it is floating in a pressurized, high-end void. By leveraging the pure #000000 of OLED displays, we eliminate the physical boundaries of the device, making the content—and the AI driving it—the only reality. 

This system breaks the "template" look through **Intentional Asymmetry**. We favor overlapping elements, off-center focal points, and a high-contrast typography scale that feels more like a luxury fashion editorial than a standard news feed. The goal is "Addictive Elegance": a UI so tactile and responsive that the user feels a physical pull to interact with it.

---

## 2. Colors & Surface Philosophy
Our palette is rooted in the deep void, punctuated by "Bioluminescent" accents that guide the user’s eye through the AI-driven information architecture.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders for sectioning are strictly prohibited. 
Structural boundaries must be defined solely through background tonal shifts. To separate a news category from a feed, transition from `surface` (#0e0e0e) to `surface_container_low` (#131313). If you feel the need for a line, use whitespace (Spacing 6 or 8) instead.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, frosted obsidian sheets.
*   **Base:** `surface_container_lowest` (#000000) for the main background to maximize OLED power savings and depth.
*   **Primary Content Area:** `surface` (#0e0e0e).
*   **Embedded Cards:** `surface_container` (#191919).
*   **Floating/Active Elements:** `surface_container_highest` (#262626).

### The "Glass & Gradient" Rule
To achieve the "Tesla-meets-Apple" futuristic vibe, all primary CTAs and high-priority AI insights must use a linear gradient: `primary` (#c59aff) to `secondary` (#00cffc) at a 135-degree angle. 
*   **Glassmorphism:** For overlays (modals, navigation bars), use `surface_variant` at 60% opacity with a `backdrop-filter: blur(20px)`. This allows the "neon glow" of underlying elements to bleed through, creating a sense of physical depth.

---

## 3. Typography: The Editorial Voice
We utilize a dual-typeface system to balance technical precision with high-end readability.

*   **Display & Headlines:** `spaceGrotesk`. This is our "Futuristic" anchor. Use `display-lg` (3.5rem) for major AI-generated summaries. The tight tracking and geometric forms convey authority.
*   **Body & Titles:** `inter`. For long-form reading, `inter` provides the "Apple News" clarity. Use `body-lg` (1rem) for news snippets to ensure maximum legibility against the dark background.
*   **Hierarchy as Brand:** Use extreme scale contrast. A `display-sm` headline paired immediately with a `label-sm` metadata tag creates a sophisticated, non-linear layout that feels custom-tailored.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "web 2.0" for this system. We use light and transparency to define space.

*   **The Layering Principle:** Instead of a shadow, place a `surface_container_high` card inside a `surface_dim` section. The subtle contrast (approx 3-5%) is enough for the human eye to perceive a "lift" without visual clutter.
*   **Ambient Shadows:** For floating action buttons or high-priority alerts, use an "Ambient Glow." The shadow color should be `primary_dim` at 10% opacity with a 40px blur. It should look like the component is emitting light onto the black surface beneath it.
*   **Ghost Border Fallback:** If a container sits on an image and needs definition, use `outline_variant` (#484848) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Fluid Primitives

### Buttons (The "Glass" Interaction)
*   **Primary:** Gradient (`primary` to `secondary`), `rounded-md` (1.5rem). Text: `on_primary_fixed` (Black).
*   **Secondary/Glass:** `surface_variant` at 40% opacity, `backdrop-filter: blur(10px)`, `outline_variant` at 20% opacity.
*   **States:** On press, scale the button down to 0.96 and increase the `surface_bright` inner glow.

### Cards (The "Editorial" Unit)
*   **Rule:** Forbid divider lines. Use `surface_container_low` for the card body. 
*   **Structure:** Image at top-left, `headline-sm` title, and `label-md` category chip in the bottom-right. This asymmetrical layout breaks the standard "grid" feel.
*   **Radius:** Always `rounded-md` (1.5rem) or `rounded-lg` (2rem) for hero cards.

### AI "Pulse" Chips
*   Used for AI-generated tags. These should have a subtle 1px "Ghost Border" of `secondary` and a repeating pulse animation (opacity 0.4 to 0.8) to indicate the "live" nature of the news feed.

### Input Fields
*   Never use a box. Use a bottom-weighted `surface_container_high` background with `rounded-sm` corners. The cursor should be the `secondary` (#00cffc) color to act as a "neon" beacon.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use "Negative Space" as a functional element. Give headlines 2x the standard padding (Spacing 12 or 16) to create a premium, gallery-like feel.
*   **DO** use `secondary` (#00cffc) for all interactive "active" states (toggles, sliders). It is our most "electric" color.
*   **DO** allow images to bleed to the edge of the screen when using `surface_container_lowest` (#000000) to create an infinite canvas effect.

### Don’t
*   **DON'T** use pure white (#ffffff) for long body text. Use `on_surface_variant` (#ababab) to reduce eye strain in OLED dark mode.
*   **DON'T** use 90-degree corners. Everything must feel "molded" and organic, adhering to the `1.5rem` to `2rem` radius scale.
*   **DON'T** use standard "Slide-in" transitions. Use "Scale-and-Fade" glass overlays to maintain the feeling of stacked layers of light.