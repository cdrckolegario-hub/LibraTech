# LibraTech — Setup and Deployment Notes

## 1. Requirements

- Node.js 18+
- npm
- A modern browser

## 2. Local installation

Open a terminal in the project root:

```text
npm install
npm start
```

Then open the local URL printed by the server (normally `http://localhost:3000`).

Do not use VS Code Live Server for this database edition. Live Server can serve the frontend,
but the real API/database must be running as well.

## 3. Database

SQLite is stored at:

`database/libratech.db`

The schema is also included at:

`database/schema.sql`

The server automatically creates missing tables/settings and ensures the default Owner exists.
The included database is already initialized with:

- 1 Owner account
- 0 Client accounts
- 25 balanced sample books
- 26 academic programs/fields
- course sections
- borrowing settings

No fake Client profiles or sample student credentials are included.

## 4. Owner account

Username: `owner`
Password: `12345`

Change the password implementation before production deployment if the school requires a
custom Owner account. Passwords are hashed server-side.

## 5. Cross-device persistence

The database is the source of truth. If this server is deployed to a shared server/host,
accounts, books, transactions, and returns are available from other browsers/devices that
connect to the same deployed server and database.

For production, use a persistent database volume and HTTPS. Do not expose the SQLite file
publicly.

## 6. Environment variables

Optional variables:

- `PORT` — server port, default `3000`
- `SESSION_DAYS` — session lifetime in days, default `7`

A `.env.example` file is included. The server intentionally does not require a dotenv
package for the basic setup; environment variables can be supplied directly by the host.

## 7. Backup

Back up `database/libratech.db` while the application is stopped or using a proper SQLite
backup procedure in production.


DEFAULT OWNER LOGIN
Username: owner
Password: 12345

Important: Start the backend with npm start and open http://localhost:3000. Do not open public/index.html directly.
