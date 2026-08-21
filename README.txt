LIBRATECH — LIBRARY MANAGEMENT SYSTEM
FINAL DATABASE EDITION

This version implements the latest database + redesigned UI requirements.

IMPORTANT
---------
This is now a real client-server application. Do NOT open public/index.html directly.
Start the server first, then open the local address shown by the server.

TECHNOLOGY
----------
Frontend: HTML5, CSS3, Vanilla JavaScript
Backend/API: Node.js + Express
Database: SQLite (persistent file: database/libratech.db)
Authentication: server-side password hashing + HttpOnly session cookie

WINDOWS QUICK START
-------------------
1. Install Node.js 18 or newer.
2. Open this folder in Command Prompt / PowerShell.
3. Run:
   npm install
   npm start
4. Open the address printed by the server (normally http://localhost:3000).

DEFAULT OWNER LOGIN
-------------------
Username: owner
Password: 12345

The default Owner password is stored as a password hash in the database. It is NOT stored
as plaintext in frontend JavaScript.

CLIENT ACCOUNTS
---------------
There are ZERO fake/demo Client accounts in the final database.
Clients must register through the system, then manually sign in.

OWNER SECURITY
--------------
After 3 incorrect Owner login attempts, Owner sign-in is temporarily locked for 30 seconds.
The lock is stored in the database and cannot be bypassed by changing LocalStorage.

DATABASE
--------
The database contains Users/Accounts, Books, Courses, Sections, Borrowers,
Borrowing Transactions, Activity Logs, Notifications, Sessions, Book/Course relationships,
and System Settings.

IMPORTANT DATABASE RULES
------------------------
- Client and Owner accounts persist in the database.
- Books and transactions persist in the database.
- Borrowing and returning update book availability in database transactions.
- Owner-only API routes require an authenticated Owner session.
- Client API routes only expose the logged-in Client's own profile and transactions.
- LocalStorage is NOT used as the source of truth for accounts or library records.

DESIGN
------
The new UI uses a friendly dark professional college-library theme, consistent LibraTech
branding, practical tables, moderate cards, subtle transitions, readable contrast, and
responsive layouts for desktop/tablet/mobile.

SEE ALSO
--------
SETUP.md
DATABASE_DESIGN.md
TEST_CHECKLIST.md


DEFAULT OWNER LOGIN
Username: owner
Password: 12345

Important: Start the backend with npm start and open http://localhost:3000. Do not open public/index.html directly.
