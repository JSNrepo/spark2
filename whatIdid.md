# What I Did

- Checked for existing `whatIdid.md` file (none existed, so created it).
- Implemented image upload for parking lot creation.
- Created Supabase storage bucket migration for `parking-lot-images`.
- Updated `src/lib/supabase.ts` with `uploadParkingLotImage` method to handle image uploads to Supabase Storage.
- Created a new `ImageUpload.tsx` UI component to handle file selection and preview generation.
- Integrated the `ImageUpload` component into `src/pages/Provider/CreateParkingLot.tsx`, replacing the `TODO` with fully working file upload code that saves URLs to the database upon submission.
- Fixed a minor linter issue from unused `ImageIcon` in the new component.

## What we are going to do next in this project

Fix all the typescript errors and lint issues scattered throughout the project (especially in `AuthContext.tsx`, `BookingPage.tsx`, and others) so the project successfully passes lint and build steps.
