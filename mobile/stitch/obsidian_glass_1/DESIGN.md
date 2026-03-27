# Design System Specification: The Obsidian Editorial

## 1. Overview & Creative North Star
**The Creative North Star: "The Neon Nocturne"**
This design system rejects the "flat web" in favor of a high-fidelity, cinematic interface. It is inspired by the precision of a Tesla cockpit, the editorial weight of Apple News, and the functional clarity of Notion. We move beyond standard dark mode by treating the screen not as a flat surface, but as a deep, infinite void where information floats on layers of "Obsidian Glass."

The system breaks the template look through **intentional atmospheric depth**. Instead of rigid grids, we use sprawling whitespace and "light-leaks" (subtle neon glows) to guide the eye. It is an experience that feels carved out of light and shadow, designed specifically for OLED displays where `#000000` is the ultimate canvas.

---

## 2. Colors & Atmospheric Tones
The palette is anchored in a true-black void, punctuated by "Electric Ion" accents.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. We define boundaries through **Tonal Thresholds**. A section change is signaled by moving from `surface` (#0e0e0e) to `surface_container_low` (#131313). If a boundary must be felt, use a soft gradient transition rather than a hard stroke.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of glass.
*   **Base Layer:** `surface_container_lowest` (#000000) — Reserved for the deep background.
*   **Primary Work Surface:** `surface` (#0e0e0e) — The main content area.
*   **Elevated Components:** `surface_container` (#191919) through `highest` (#262626).
*   **The Glass Rule:** For floating modals or navigation bars, use `surface_variant` at 40% opacity with a `backdrop-filter: blur(40px)`. This creates the "Frosted Obsidian" look.

### Signature Glows
Main CTAs and high-priority highlights should utilize a linear gradient:
*   **Primary Glow:** `primary` (#d095ff) to `secondary` (#40cef3) at a 135° angle. This evokes a futuristic, neon-lithography feel.

---

### 3. Typography: Editorial Authority
We pair the geometric precision of **Manrope** for high-impact displays with the functional legibility of **Inter** for utility.

*   **Display & Headlines (Manrope):** Use `display-lg` (3.5rem) with tight letter-spacing (-0.04em) to create an "Editorial" weight. Headlines should feel like title cards in a film.
*   **Body & Labels (Inter):** Use `body-md` (0.875rem) for the majority of text. Increase the line-height to 1.6 to maintain the "Notion-esque" breathing room.
*   **Tonal Contrast:** Never use `on_background` (#ffffff) at 100% for everything. Use `on_surface_variant` (#ababab) for secondary descriptions to create a hierarchy of "light intensity."

---

### 4. Elevation & Depth
Depth in this system is an atmospheric effect, not a structural one.

*   **The Layering Principle:** To lift a card, place a `surface_container_high` (#1f1f1f) element onto a `surface` (#0e0e0e) floor. The `DEFAULT` radius (1rem / 20px) must be consistent to maintain the "molded" look.
*   **Ambient Shadows:** We do not use black shadows. Use a diffused glow. A "floating" active state should have a shadow of `0px 20px 40px rgba(208, 149, 255, 0.08)`—a faint purple orchid tint that mimics light reflecting off a neon surface.
*   **The "Ghost Border":** For interactive inputs, use a 1px stroke of `outline_variant` at 20% opacity. It should be barely visible, felt only when the eye seeks a boundary.
*   **Neon Edge Light:** For featured cards, apply a "top-down" inner border (0.5px) using the `primary_fixed` token to simulate a glass edge catching a distant light source.

---

### 5. Components

#### Buttons
*   **Primary:** A vibrant gradient from `primary` to `secondary`. Text is `on_primary_fixed` (#000000). Use `md` (1.5rem) corner radius.
*   **Secondary (Glass):** `surface_variant` at 20% opacity with `backdrop-filter: blur(10px)`. 
*   **Tertiary:** Ghost style, no background, `on_surface` text, transforms to 10% opacity on hover.

#### Cards & Lists
*   **The Divider Ban:** Lists must never use horizontal lines. Use a `3` (1rem) vertical spacing gap or a subtle shift to `surface_container_low` on hover to separate items.
*   **Glass Cards:** Use `surface_container` with 60% opacity. Apply a 1px stroke using a gradient of `primary` to `secondary` at 10% opacity to create a "shimmer" edge.

#### Input Fields
*   Background: `surface_container_lowest` (#000000).
*   Border: `outline_variant` at 15%.
*   Active State: Border glows with `secondary` (#40cef3) and a 2px outer blur.

#### Signature Component: "The Pulse Chip"
Used for live status or notifications. A `secondary` colored dot with a repeating CSS scale animation (0% to 150%) at 10% opacity, creating a sonar-like "ping" on the dark OLED background.

---

### 6. Do’s and Don’ts

**Do:**
*   **Do** embrace the void. Use `20` (7rem) or `24` (8.5rem) spacing to separate major sections.
*   **Do** use `9999px` (full) roundedness for small tags and chips, but stick to `DEFAULT` (20px) for containers.
*   **Do** ensure all "glass" layers have at least `20px` of backdrop blur to prevent text legibility issues with background content.

**Don’t:**
*   **Don’t** use pure grey for shadows. Always tint them with a hint of `primary_dim` or `secondary_dim`.
*   **Don’t** use 100% white text for long-form body copy; it causes "halation" (eye strain) on OLED. Use `on_surface_variant`.
*   **Don’t** add borders to buttons. Let the gradient or the glass-blur define the shape.
*   **Don’t** use "Card-in-Card" layouts without increasing the `surface_container` tier. Each nest must be visually lighter than its parent.