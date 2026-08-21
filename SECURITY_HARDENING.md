# LibraTech security hardening applied

This package hardens the current local Express/SQLite build without changing the existing UI workflow.

- Fixed the Client borrowing notification SQL placeholder bug that caused confirmed borrowing to roll back.
- Removed the accidental server-side session/user object exposure from `/api/auth/me`.
- Added secure HTTP response headers and disables Express fingerprinting.
- Added same-origin protection for state-changing API requests when browsers send an Origin header.
- Added authentication endpoint rate limiting.
- Added stronger registration validation and 8-character minimum Client passwords.
- Added transactional Client registration so user/borrower/notification records cannot be left half-created.
- Added secure cookies in production (`HttpOnly`, `SameSite=Lax`, `Secure`).
- Added expired-session cleanup.
- Added API 404 handling instead of returning the SPA for unknown API endpoints.
- Added an environment-controlled default Owner password for production initialization.
- Kept parameterized SQL for database values and server-side password hashing.
- Added a stock-update change check so a borrow cannot succeed without actually decrementing inventory.

## Important production note

No code audit can honestly guarantee zero bugs or absolute security. This package is a hardened local build. The SQLite file is appropriate for local/single-server use; it should not be used as the persistence layer for a multi-instance Netlify deployment. The online version should use Netlify Functions with Netlify Database (Postgres) and a proper production secret configuration.
