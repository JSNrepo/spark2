## 2024-05-15 - Interactive Icon Accessibility
**Learning:** Icon-only interactive elements (like password visibility toggles and mobile hamburger menus) in this application lack basic accessibility attributes and keyboard focus states out-of-the-box.
**Action:** Always ensure icon-only buttons include `aria-label`, `title`, and specific focus-visible styles (`focus:outline-none focus-visible:ring-2`) for keyboard navigation users.

## 2026-05-17 - Mobile Menu Toggle Accessibility Pattern
**Learning:** When using Lucide React icons for stateful toggles (like Menu/X for mobile navigation), the state must be communicated via both `aria-expanded` on the button and dynamic `aria-label`s, while the SVG icons themselves should be hidden from screen readers.
**Action:** For all stateful icon toggles: 1. Add `aria-expanded={isOpen}` to the button. 2. Use a dynamic `aria-label` (e.g., "Open menu"/"Close menu"). 3. Add `aria-hidden="true"` directly to the SVG icons to prevent redundant or confusing screen reader announcements.
