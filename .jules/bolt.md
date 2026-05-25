## 2024-05-15 - [React-Leaflet Custom Icon Reference Thrashing]
**Learning:** React-Leaflet heavily relies on referential equality to manage updates for Leaflet primitives. In the `MapView` component, custom icons (like `L.divIcon`) were being newly instantiated on every single render. Since the icon object reference was new every time, React-Leaflet believed the icon had changed and commanded Leaflet to do a full DOM teardown and replacement for the marker, creating significant main-thread latency and possible stuttering when panning/zooming.
**Action:** Always memoize or cache Leaflet primitives (like Icons) when passing them as props to React-Leaflet components. A simple module-level dictionary caching the instances based on dynamic properties (e.g., parking type, availability) effectively stops the unnecessary DOM churn.

## 2026-05-17 - [Range Sliders Triggering API Spam]
**Learning:** In React applications, range sliders (like `<input type="range">`) emit continuous `onChange` events while being dragged. If these events update state that triggers a `useEffect` with network requests (like a database query), it can cause significant API spam and performance degradation.
**Action:** Always debounce network requests triggered by rapid state changes, such as those from range sliders or text inputs. Wrapping the function call inside a `setTimeout` within the `useEffect` (and clearing it on cleanup) is an effective and simple way to mitigate this issue.

## 2024-05-18 - [List View O(N) Re-renders from Parent Input State]
**Learning:** In a list view architecture (like `SearchPage.tsx` rendering multiple `ParkingLotCard` components), if a child input component updates state in the parent on every keystroke, the entire parent re-renders. This forces all list items to re-render, creating an O(N) bottleneck and significant input lag.
**Action:** When mapping over large lists of complex components, always consider wrapping the individual item components in `React.memo()`. This ensures that parent-level state updates (like search queries or filters) do not unnecessarily re-render list items whose specific props haven't changed.

## 2024-05-19 - [Multiple O(N) Array Iterations for Derived State]
**Learning:** In dashboard components that calculate derived statistics (like `totalBookings`, `activeLots`, `totalSpent`) from large lists of data, chaining multiple `.filter()` and `.reduce()` operations causes redundant O(N) iterations on every render.
**Action:** Always combine these multiple operations into a single-pass loop using `.reduce()`, and wrap the calculation in `useMemo()` so it only recomputes when the source array dependency changes. This prevents unnecessary and expensive computations during React component re-renders.
## 2024-05-21 - Component Static Array Allocation
**Learning:** React components that define static arrays or objects inside their function body suffer from unnecessary memory re-allocation on every render. This was discovered in `Home.tsx` and `HowItWorks.tsx` where arrays of features, steps, and testimonials were being recreated each time the components rendered.
**Action:** Always extract static configurations, arrays, and objects that do not depend on component state or props outside of the component body to the module level scope.
## 2024-05-24 - Large Main Bundle Bottleneck
**Learning:** The Vite application bundled all React router pages into a single `index.js` file, resulting in an initial load size of over 800kB, which triggers Vite's chunk size warning limit. Since the application has many discrete pages, loading them all upfront is unnecessary for first paint.
**Action:** Use `React.lazy` combined with `Suspense` wrapping the React Router `<Routes>` component to enable route-level code splitting. This breaks the large main bundle into smaller, dynamically loaded chunks (reducing main bundle size to ~350kB) and improves Time to Interactive.
## 2024-05-25 - [O(N) Reallocation in Render]
**Learning:** Derived state (like a `filter` over an array) computed directly in the component body runs on every single render, allocating a new array reference and unnecessarily spending CPU cycles.
**Action:** Always wrap derived array operations (`filter`, `map`, etc.) in `useMemo` hooks so they are only recomputed when their dependencies change. This improves render speed and maintains referential equality.
## 2026-05-25 - AdvancedFilters Optimization
**Learning:** Found an inline object being created and having `Object.entries` called on it within a component's render body, which creates unnecessary allocations on every render.
**Action:** Extract static arrays and objects (and evaluated forms like `Object.entries(myObj)`) completely outside the React component scope to prevent unnecessary memory allocations during re-renders.
