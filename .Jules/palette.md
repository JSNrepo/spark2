## 2024-05-15 - Interactive Icon Accessibility
**Learning:** Icon-only interactive elements (like password visibility toggles and mobile hamburger menus) in this application lack basic accessibility attributes and keyboard focus states out-of-the-box.
**Action:** Always ensure icon-only buttons include `aria-label`, `title`, and specific focus-visible styles (`focus:outline-none focus-visible:ring-2`) for keyboard navigation users.
