# LibraTech Final Test Checklist

## Authentication
- [ ] Owner correct credentials
- [ ] Owner wrong credentials
- [ ] Owner lock after 3 failed attempts
- [ ] Owner lock countdown is 30 seconds
- [ ] Refresh cannot bypass Owner lock
- [ ] Client registration
- [ ] Duplicate username
- [ ] Duplicate email
- [ ] Duplicate Student ID
- [ ] Password confirmation
- [ ] Client login
- [ ] Client wrong password
- [ ] Logout
- [ ] Client cannot access Owner API/routes

## Owner
- [ ] Dashboard cards navigate/filter correctly
- [ ] Add book
- [ ] Edit book
- [ ] Delete book with active-transaction protection
- [ ] Search/filter books
- [ ] View book details
- [ ] View borrowers
- [ ] Filter borrowers by course/status
- [ ] View Client accounts
- [ ] Activate/deactivate Client
- [ ] View transactions
- [ ] Filter transactions
- [ ] Transaction details
- [ ] Return book
- [ ] Reports
- [ ] Print
- [ ] CSV download
- [ ] HTML report download
- [ ] Settings
- [ ] Activity log

## Client
- [ ] Register account
- [ ] Manual sign-in after registration
- [ ] Dashboard
- [ ] Course recommendations
- [ ] Browse all books
- [ ] Search/filter
- [ ] Book details
- [ ] Borrow confirmation
- [ ] Borrow unavailable book blocked
- [ ] 3-book limit
- [ ] Duplicate active borrow blocked
- [ ] Due date calculated from setting
- [ ] My Borrowings only shows logged-in Client
- [ ] Overdue status updates
- [ ] Profile update
- [ ] Print profile
- [ ] Download borrowings

## Database
- [ ] Account survives browser close/reopen
- [ ] Book survives restart
- [ ] Borrow transaction survives restart
- [ ] Return survives restart
- [ ] Available copies update correctly
- [ ] No negative available copies
- [ ] Foreign-key integrity
- [ ] No password shown in UI

## UI
- [ ] Desktop
- [ ] Laptop
- [ ] Tablet
- [ ] Mobile
- [ ] Sidebar collapse
- [ ] Modal close button
- [ ] Modal outside-click close
- [ ] Escape closes modal
- [ ] Hover/active/disabled states
- [ ] Toast success/error messages
- [ ] Live date/time
- [ ] Print layout hides navigation
- [ ] Reduced-motion support
