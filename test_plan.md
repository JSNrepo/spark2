1. Add `abortControllerRef.current?.abort();` to the cleanup function inside `src/components/Map/LocationSearch.tsx`. This avoids memory leak and in-flight requests on unmount.
2. Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
3. Commit the change via gh pr create.
