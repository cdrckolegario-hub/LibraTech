IMPORTANT:
This local SQLite Express build is not the production Netlify backend.
Do not put the SQLite database behind Netlify Functions and expect it to persist across instances.
For the real online deployment, migrate the API/database layer to Netlify Functions + Netlify Database (Postgres).
