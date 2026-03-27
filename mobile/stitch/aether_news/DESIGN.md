# Design System Document: The Neural Pulse

## 1. Overview & Creative North Star
**Creative North Star: "The Living Archive"**

This design system moves away from the static, boxy nature of traditional news aggregates and toward a fluid, sentient interface. We are building a "Living Archive"—an experience that feels like a futuristic, AI-driven HUD (Heads-Up Display) fused with the refined editorial elegance of a high-end magazine.

To achieve this, we reject the "template" look. We favor **intentional asymmetry**, where content isn't just stacked but orchestrated. We use **overlapping elements** to create a sense of physical space and **Glassmorphism** to ensure the interface feels lightweight and light-emissive. The goal is a "Tesla-meets-Notion" aesthetic: hyper-functional, yet breathably minimal.

---

## 2. Colors & Light Emissivity
We leverage the deep blacks of OLED screens to make our neon accents and glass surfaces vibrate with energy.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Content boundaries must be created through:
1.  **Background Shifts:** Using `surface_container_low` against `surface`.
2.  **Tonal Transitions:** Subtle radial gradients that "pool" light in active areas.
3.  **Negative Space:** Using the `Spacing Scale` (specifically `6` and `8`) to let the OLED black act as a natural separator.

### Surface Hierarchy & Glassmorphism
We treat the UI as a series of floating, translucent panes.
*   **Base:** `surface` (#0e0e0e) or `surface_container_lowest` (#000000) for true OLED immersion.
*   **Floating Panes (Glass):** Use `surface_variant` at 40-60% opacity with a `24px` backdrop blur. This creates the "frosted" look where background glows can bleed through.
*   **Active Neon Accents:** Use `primary` (#b6a0ff) and `secondary` (#00cffc) as gradients for highlights. Never use them as flat backgrounds for large areas; use them as "light sources" behind glass cards.

---

## 3. Typography: Editorial Precision
The typography balances the technical precision of `inter` with the geometric authority of `manrope`.

*   **The Display Scale:** Use `display-lg` (Manrope) for gamified milestones or breaking "Flash" news. These should be tracked-out slightly (-2%) for a premium, cinematic feel.
*   **The Editorial Scale:** `headline-md` is your workhorse for news titles. It must feel substantial. Use `on_surface` (White) to ensure maximum contrast against the dark background.
*   **The Utility Scale:** `label-md` and `body-sm` (Inter) are for the "AI Metadata"—reading time, source credibility scores, and gamification stats. Use `on_surface_variant` (Grey) to push these into the background hierarchy.

---

## 4. Elevation & Depth
Depth in this system is not about "shadows," it is about **Light and Layering**.

*   **The Layering Principle:** Stacking determines importance.
    *   *Level 0:* `surface_container_lowest` (Background/OLED)
    *   *Level 1:* `surface_container` (Persistent navigation/Feed containers)
    *   *Level 2:* `surface_bright` (Active cards/Interaction states)
*   **Ambient Shadows:** When a card must "float" (e.g., a news summary pop-up), use a diffused shadow: `Blur: 40px`, `Spread: -10px`, `Color: primary` at 8% opacity. This creates a "glow" rather than a "shadow."
*   **The Ghost Border:** If a button or card feels lost, apply a `1px` stroke using `outline_variant` at **15% opacity**. It should feel like a catch-light on the edge of glass, not a cage.

---

## 5. Components

### The "Glass" News Card
*   **Background:** `surface_variant` @ 50% opacity.
*   **Blur:** `20px` Backdrop Blur.
*   **Corner Radius:** `md` (1.5rem / 24px) to match the "high-end" aesthetic.
*   **Content:** No dividers. Use `3 (1rem)` spacing between headline and metadata.

### Interactive Buttons
*   **Primary CTA:** Gradient from `primary_dim` to `secondary_dim`. Rounded `full`. No border. High-contrast `on_primary_fixed` (Black) text.
*   **Secondary (Ghost):** 15% `outline` stroke, `full` roundness, white text.
*   **States:** On press, the "glow" (shadow) should increase in intensity, not the background color brightness.

### Gamified Progress Traps
*   **The Pulse Bar:** Instead of a flat loading bar, use a `secondary` to `primary` gradient with a `surface_tint` outer glow.
*   **Chips:** Selection chips should use `surface_container_highest` with a `24px` radius. When selected, they gain a "Neon Underglow" (a 2px gradient line at the bottom).

### Input Fields
*   **Style:** Minimalist underline or "Glass Inset." Use `surface_container_low` as the field background.
*   **Focus State:** The border doesn't change color; instead, the `primary` glow appears *behind* the field, making it look like the AI is "powering up" the input.

---

## 6. Do's and Don'ts

### Do
*   **DO** use wide margins. Let the content breathe like a luxury fashion lookbook.
*   **DO** use `secondary` (Blue) for "Fact" based data and `primary` (Purple) for "AI Insights."
*   **DO** use `24px` (md) as your standard radius for cards to maintain a friendly, Duolingo-inspired playfulness within the high-end dark theme.

### Don't
*   **DON'T** use pure white (#FFFFFF) for long-form body text; use `on_surface_variant` to reduce eye strain on OLED.
*   **DON'T** use 100% opaque cards. If it isn't translucent, it isn't part of this system.
*   **DON'T** use "Drop Shadows." If you need depth, use "Ambient Glows" or "Tonal Layering."
*   **DON'T** use standard list dividers. Use a `1.4rem (4)` vertical gap instead.

---

## 7. Signature Interaction Component: The "Neural Feed"
The feed should not be a flat list. Implement **Staggered Card Heights** (asymmetric layout). One card might be full width, while the next two are half-width "Intelligence Bites." This breaks the scrolling fatigue and creates an editorial rhythm seen in Apple News and high-end portfolios.