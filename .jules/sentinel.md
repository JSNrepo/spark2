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
