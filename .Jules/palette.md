## 2024-05-15 - Interactive Icon Accessibility
**Learning:** Icon-only interactive elements (like password visibility toggles and mobile hamburger menus) in this application lack basic accessibility attributes and keyboard focus states out-of-the-box.
**Action:** Always ensure icon-only buttons include `aria-label`, `title`, and specific focus-visible styles (`focus:outline-none focus-visible:ring-2`) for keyboard navigation users.

## 2026-05-17 - Mobile Menu Toggle Accessibility Pattern
**Learning:** When using Lucide React icons for stateful toggles (like Menu/X for mobile navigation), the state must be communicated via both `aria-expanded` on the button and dynamic `aria-label`s, while the SVG icons themselves should be hidden from screen readers.
**Action:** For all stateful icon toggles: 1. Add `aria-expanded={isOpen}` to the button. 2. Use a dynamic `aria-label` (e.g., "Open menu"/"Close menu"). 3. Add `aria-hidden="true"` directly to the SVG icons to prevent redundant or confusing screen reader announcements.

## 2026-05-18 - View Mode Toggle Accessibility
**Learning:** Icon-only toggle buttons (like List/Grid/Map view switchers) require both stateful ARIA attributes (aria-pressed) and explicit focus indicators to be usable by screen readers and keyboard users.
**Action:** Always add aria-label, aria-pressed={isActive}, aria-hidden="true" to the inner icon, and focus-visible:ring utility classes to icon-only toggle controls.

## 2024-05-19 - File Input Accessibility Pattern
**Learning:** Using `hidden` on a file input within a custom dropzone label prevents the input from receiving keyboard focus. Also, action buttons inside hover groups (`opacity-0 group-hover:opacity-100`) become invisible to keyboard-only users who navigate to them via Tab.
**Action:** Always use `sr-only` instead of `hidden` for custom file inputs to maintain keyboard focusability, and add `focus-within` styles to the parent label. For buttons with hover-only visibility, ensure they become visible on focus (`focus:opacity-100`).

## 2024-05-20 - Image Carousel Accessibility
**Learning:** Custom image carousels with dot indicators and interactive thumbnails lack keyboard focus and screen reader context out-of-the-box.
**Action:** Always add `aria-label` (e.g., "Select image 1"), `aria-current="true"` for the active item, explicit `focus-visible` styles (`focus-visible:ring-2`), and `aria-hidden="true"` to any decorative internal elements (like the thumbnail `<img>`) to custom carousel controls.
## 2025-05-22 - LocationSearch Accessibility Fixes
**Learning:** Icon-only buttons (like "Clear search" and "Use current location") need explicit `aria-label` attributes and keyboard focus states (`focus-visible:ring-2`) to be usable for keyboard and screen reader users. Also, decorative elements like `lucide-react` icons should have `aria-hidden="true"` to prevent redundant screen reader announcements.
**Action:** Always include `aria-label`, `aria-hidden`, and explicit focus styles (`focus:outline-none focus-visible:ring-2`) when implementing icon-only interactive elements in components.
## 2024-05-25 - Profile Photo Camera Button Accessibility
**Learning:** Found an icon-only button (Camera icon) in the ProfilePage that lacked any ARIA labels or keyboard focus indicators. The standard a11y pattern for icon-only interactive elements needs to be strictly applied here.
**Action:** Always use dynamic `aria-label` and `title` properties, add `aria-hidden="true"` to the decorative icon, and apply `focus:outline-none focus-visible:ring-2` for clear keyboard focus indicators.

## 2024-05-27 - Accordion Accessibility Pattern
**Learning:** For custom collapsible content like accordions in React applications (such as in Help Center or FAQs), using plain buttons with simple `onClick` handlers creates an accessibility trap for screen readers and keyboard users.
**Action:** Always implement the `aria-expanded` and `aria-controls` properties on the toggle button (linked via ID to the content container), add `role="region"` to the content block, and ensure explicit focus indicators (`focus-visible:ring-2`) are present so keyboard users know where their focus lies.

## 2024-11-20 - Grouped Input Form Labels
**Learning:** Found unassociated `label` elements used as visual headings for grouped input blocks (Price Range, Features), which causes screen reader confusion as they lack a `for` attribute. Furthermore, explicitly mapping focus outlines is essential for accessibility but often omitted on inputs wrapped in generic containers.
**Action:** Replace pseudo-labels with semantic `div` elements, assign explicit accessible names directly to inner inputs via `aria-label`, and always apply `focus-visible:ring-2` to nested interactive elements in custom filter components.
## 2026-05-30 - Custom Radio Card Focus Accessibility
**Learning:** When using custom card-style radio inputs where the native input is visually hidden (`sr-only`), the elements lose their visible focus state for keyboard users, making the form inaccessible.
**Action:** Always wrap custom radio inputs in a `<fieldset>` with a `<legend>` for screen readers, and add `focus-within:ring-2` (or similar) to the parent `<label>` wrapper so the custom UI card correctly displays the focus indicator when the hidden input receives focus.

## 2025-06-02 - Missing Password Visibility Toggles in Registration Form
**Learning:** Inconsistent implementation of UX patterns across different authentication forms. While `Login.tsx` and `Register.tsx` correctly included password visibility toggles with proper aria labels, the specialized `SpaceProviderRegister.tsx` form lacked this critical accessibility feature, forcing users to type complex passwords (requiring upper, lower, numbers, and special characters) blindly.
**Action:** Always verify that newly created specialized variants of standard forms inherit the same accessibility features (like show/hide password toggles) as their standard counterparts.

## 2026-06-03 - Custom Radio Card Focus Accessibility
**Learning:** Custom card-style radio buttons using `sr-only` hidden inputs drop visible focus styles unless specifically configured. Also, standard `<div>` containers with pseudo-labels lack screen reader semantics for groupings.
**Action:** Always wrap custom radio button groups in a `<fieldset>` with a `<legend>`, and apply `focus-within:ring-2` (or similar utilities) to the visual card parent elements to correctly trigger focus outlines from the hidden inputs.
## 2026-06-05 - Semantic Grouping in React Filters
**Learning:** React components often use `div` elements for styling group headings (like "Price Range" or "Features") next to their respective inputs, which breaks the semantic association for screen readers. Grouped interactive elements must use `<fieldset>` and `<legend>` for proper accessibility.
**Action:** When reviewing custom forms or filter panels in this app, check for visually grouped inputs and replace the parent `div` containers and pseudo-labels with `<fieldset className="mb-4">` and `<legend className="block text-sm font-medium text-gray-700 mb-2">`.
