## 2024-05-15 - Input Length Validation (DoS Prevention)
**Vulnerability:** Zod schemas for user authentication and form data lacked maximum length limits on input fields.
**Learning:** Without `.max()` limits, extremely long input strings could be processed by the server or client, leading to a potential Denial of Service (DoS) attack via resource exhaustion.
**Prevention:** Always implement `.max()` bounds on user input schemas (e.g., using `z.string().max(255)`) alongside minimum constraints.
