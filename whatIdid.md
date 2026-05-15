# What I Did

* Identified a significant performance bottleneck in `src/components/Map/MapView.tsx` related to React-Leaflet marker re-rendering.
* Discovered that `createCustomIcon` and `createUserLocationIcon` were instantiating new `L.divIcon` objects on every render, causing React-Leaflet to needlessly update the DOM because of reference inequality.
* Implemented caching mechanisms (`iconCache` dictionary and `userLocationIconCache` singleton) to reuse the same `L.divIcon` instances for identical marker properties.
* Verified the solution through `pnpm build` to ensure the project compiles successfully.
* Documented the learning about React-Leaflet object references in `.jules/bolt.md`.

## what we are going to do next in this project
* Monitor map performance when rendering large amounts of parking lots (e.g. hundreds of markers).
* Consider adding marker clustering (like `react-leaflet-markercluster`) if marker counts become too high to render efficiently even with cached icons.
* Profile the backend search query latency to ensure fetching parking lots scales with large datasets.
