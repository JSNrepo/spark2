## 2024-05-15 - Input Length Validation (DoS Prevention)
**Vulnerability:** Zod schemas for user authentication and form data lacked maximum length limits on input fields.
**Learning:** Without `.max()` limits, extremely long input strings could be processed by the server or client, leading to a potential Denial of Service (DoS) attack via resource exhaustion.
**Prevention:** Always implement `.max()` bounds on user input schemas (e.g., using `z.string().max(255)`) alongside minimum constraints.
## 2026-05-16 - [Strong Password Validation]
**Vulnerability:** Weak passwords could be set during user registration and profile updates.
**Learning:** Relied only on minimum string length without enforcing password complexity rules using a regex constraint in the Zod schemas.
**Prevention:** Always enforce complex password policies (uppercase, lowercase, number, special character) using `.regex()` with Zod or equivalent validation libraries across all password fields.
## 2024-05-18 - Auth Error Message Leakage
**Vulnerability:** Raw backend error messages (from Supabase auth) were being exposed directly to the user via toast notifications during sign-in and sign-up.
**Learning:** Exposing raw error messages can leak sensitive backend details (like stack traces, database constraints, or specific validation rules) or facilitate user enumeration.
**Prevention:** Always use safe, generic error messages for user-facing UI (e.g., "Invalid email or password", "Registration failed") and log the raw error objects internally for debugging.

## 2024-05-24 - Missing Input Length Limits in Zod Schemas
**Vulnerability:** Found missing `.max()` constraints on string fields in Zod schemas (ContactUs, BookingPage, CreateParkingLot).
**Learning:** Without explicit maximum length limits on user inputs (even seemingly innocuous ones like dates or times), the application is vulnerable to Denial of Service (DoS) attacks where maliciously large inputs consume server resources during validation or processing.
**Prevention:** Always add a `.max()` constraint to `z.string()` definitions in all validation schemas, appropriate to the expected data size.
## 2026-05-22 - Input Length Limits\n**Vulnerability:** Unbounded input fields in search components.\n**Learning:** Long string inputs can be passed to APIs or cause client-side performance issues if not constrained by the browser.\n**Prevention:** Always add a `maxLength` attribute to `<input>` or `<Input>` tags, especially for search queries.
## 2024-05-24 - Insecure File Upload Vulnerability
**Vulnerability:** The Supabase storage upload function (`uploadParkingLotImage`) relied solely on frontend file pickers for validation, leaving the API vulnerable to arbitrary file uploads (e.g., `.html`, `.svg` containing XSS, or malware).
**Learning:** Depending entirely on HTML `<input type="file" accept="...">` or bucket policies (which might be misconfigured) is insufficient. The backend/API integration layer must strictly validate both the MIME type and the file extension before executing the upload.
**Prevention:** Always implement explicit checks for `file.type` and `file.name` extensions against a strict allowlist of expected formats before uploading files to storage.
## 2024-05-24 - Content Security Policy missing in Vite App
**Vulnerability:** The application was not using any CSP headers or meta tags, leaving it vulnerable to XSS and clickjacking.
**Learning:** For SPAs and static sites (like those built with Vite/React that don't have a backend node server running), a CSP must be implemented via the `<meta http-equiv="Content-Security-Policy">` tag in `index.html`.
**Prevention:** Always implement a strict Content Security Policy meta tag early in development for frontend projects, explicitly allowing only necessary external domains (like APIs and map providers).

## 2026-06-14 - PII Console Leakage
**Vulnerability:** User email addresses were being logged in plain text via `console.log` statements in the authentication context during the sign-in and profile-fetching processes.
**Learning:** Client-side logs are often exposed to end-users or retained in browser developer tools, making the logging of Personally Identifiable Information (PII) a privacy violation and security risk.
**Prevention:** Avoid logging sensitive data (such as emails or passwords) in `console.log` statements. Instead, use opaque identifiers, such as user IDs, for client-side debugging logs.
