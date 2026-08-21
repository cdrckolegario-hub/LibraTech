# LibraTech — Database Design

## Core entities

### users
Stores Owner and Client accounts.

Important fields:
- id
- full_name
- student_id
- email
- username
- password_hash
- role
- course_id
- year_level
- section_id
- account_status
- created_at
- last_login

### courses
Academic programs/fields supported by the general college library.

### sections
Sections linked to courses.

### books
Complete book inventory.

Fields include Book ID, ISBN, title, author, subject area, category, publisher,
publication year, quantity, available copies, status derived from availability, and description.

### book_courses
Many-to-many relationship so one book can be relevant to multiple courses.

### borrowers
Borrower profile linked to a Client account when applicable.

### borrowing_transactions
Stores every borrowing/return event with snapshots of Client and Book information so
historical reports remain understandable even if a profile or book record is later edited.

### activity_logs
Audit trail for important actions such as login, book changes, borrowing, returning,
profile changes, settings changes, and report generation.

### notifications
Database-backed user notifications.

### sessions
Authenticated sessions using random tokens stored as hashes. The browser receives only
an HttpOnly session cookie.

### system_settings
Borrowing period, borrowing limit, and Owner failed-login lock state.

## Relationships

- users -> courses
- users -> sections
- borrowers -> users
- borrowers -> courses
- borrowers -> sections
- books <-> courses through book_courses
- borrowing_transactions -> borrowers
- borrowing_transactions -> books
- activity_logs -> users
- notifications -> users
- sessions -> users

## Borrowing consistency

Borrowing validates:
- authenticated Client
- active Client
- existing book
- available copies > 0
- borrowing limit
- duplicate active borrowing prevention

Then it creates the transaction and decrements available copies in a database transaction.

Returning updates the transaction, records the return time, increments available copies, and
logs the action.
