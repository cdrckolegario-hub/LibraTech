require('dotenv').config();

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const sqlite = new sqlite3.Database(
    './database/libratech.db',
    sqlite3.OPEN_READONLY
);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

function sqliteAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        sqlite.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function closeSqlite() {
    return new Promise((resolve) => {
        sqlite.close(() => resolve());
    });
}

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is missing from .env');
    }

    console.log('Connecting to Neon PostgreSQL...');

    const client = await pool.connect();

    try {
        await client.query('SELECT 1');
        console.log('POSTGRESQL CONNECTION: OK');

        console.log('\nStarting migration...');

        await client.query('BEGIN');

        const tables = [
            'users',
            'courses',
            'sections',
            'books',
            'book_courses',
            'borrowers',
            'borrowing_transactions',
            'activity_logs',
            'notifications',
            'sessions',
            'system_settings'
        ];

        /*
         * We intentionally do NOT delete existing PostgreSQL data.
         * Existing PostgreSQL rows will be preserved.
         */

        // 1. Courses
        const courses = await sqliteAll('SELECT * FROM courses');

        for (const row of courses) {
            await client.query(
                `
                INSERT INTO courses
                (id, code, name, field_group, active, created_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO NOTHING
                `,
                [
                    row.id,
                    row.code,
                    row.name,
                    row.field_group ?? 'Other',
                    row.active ?? 1,
                    row.created_at
                ]
            );
        }

        console.log(`courses migrated: ${courses.length}`);

        // 2. Sections
        const sections = await sqliteAll('SELECT * FROM sections');

        for (const row of sections) {
            await client.query(
                `
                INSERT INTO sections
                (id, course_id, name, active)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO NOTHING
                `,
                [
                    row.id,
                    row.course_id,
                    row.name,
                    row.active ?? 1
                ]
            );
        }

        console.log(`sections migrated: ${sections.length}`);

        // 3. Users
        const users = await sqliteAll('SELECT * FROM users');

        for (const row of users) {
            await client.query(
                `
                INSERT INTO users
                (
                    id,
                    full_name,
                    student_id,
                    email,
                    username,
                    password_hash,
                    role,
                    course_id,
                    year_level,
                    section_id,
                    account_status,
                    created_at,
                    last_login
                )
                VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
                ON CONFLICT (id) DO NOTHING
                `,
                [
                    row.id,
                    row.full_name,
                    row.student_id,
                    row.email,
                    row.username,
                    row.password_hash,
                    row.role,
                    row.course_id,
                    row.year_level,
                    row.section_id,
                    row.account_status ?? 'active',
                    row.created_at,
                    row.last_login
                ]
            );
        }

        console.log(`users migrated: ${users.length}`);

        // 4. Books
        const books = await sqliteAll('SELECT * FROM books');

        for (const row of books) {
            await client.query(
                `
                INSERT INTO books
                (
                    id,
                    book_code,
                    isbn,
                    title,
                    author,
                    subject_area,
                    category,
                    publisher,
                    publication_year,
                    quantity,
                    available_copies,
                    description,
                    created_at,
                    updated_at
                )
                VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
                ON CONFLICT (id) DO NOTHING
                `,
                [
                    row.id,
                    row.book_code,
                    row.isbn,
                    row.title,
                    row.author,
                    row.subject_area,
                    row.category,
                    row.publisher,
                    row.publication_year,
                    row.quantity,
                    row.available_copies,
                    row.description,
                    row.created_at,
                    row.updated_at
                ]
            );
        }

        console.log(`books migrated: ${books.length}`);

        // 5. Book-Course relationships
        const bookCourses = await sqliteAll('SELECT * FROM book_courses');

        for (const row of bookCourses) {
            await client.query(
                `
                INSERT INTO book_courses
                (book_id, course_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
                `,
                [
                    row.book_id,
                    row.course_id
                ]
            );
        }

        console.log(`book_courses migrated: ${bookCourses.length}`);

        // 6. Borrowers
        const borrowers = await sqliteAll('SELECT * FROM borrowers');

        for (const row of borrowers) {
            await client.query(
                `
                INSERT INTO borrowers
                (
                    id,
                    client_user_id,
                    full_name,
                    student_id,
                    email,
                    course_id,
                    year_level,
                    section_id,
                    status,
                    created_at
                )
                VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                ON CONFLICT (id) DO NOTHING
                `,
                [
                    row.id,
                    row.client_user_id,
                    row.full_name,
                    row.student_id,
                    row.email,
                    row.course_id,
                    row.year_level,
                    row.section_id,
                    row.status ?? 'active',
                    row.created_at
                ]
            );
        }

        console.log(`borrowers migrated: ${borrowers.length}`);

        // 7. Borrowing transactions
        const transactions = await sqliteAll(
            'SELECT * FROM borrowing_transactions'
        );

        for (const row of transactions) {
            await client.query(
                `
                INSERT INTO borrowing_transactions
                (
                    id,
                    transaction_code,
                    borrower_id,
                    book_id,
                    client_name_snapshot,
                    student_id_snapshot,
                    course_name_snapshot,
                    year_level_snapshot,
                    section_name_snapshot,
                    book_title_snapshot,
                    book_category_snapshot,
                    borrow_date,
                    due_date,
                    return_date,
                    status,
                    created_at
                )
                VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
                ON CONFLICT (id) DO NOTHING
                `,
                [
                    row.id,
                    row.transaction_code,
                    row.borrower_id,
                    row.book_id,
                    row.client_name_snapshot,
                    row.student_id_snapshot,
                    row.course_name_snapshot,
                    row.year_level_snapshot,
                    row.section_name_snapshot,
                    row.book_title_snapshot,
                    row.book_category_snapshot,
                    row.borrow_date,
                    row.due_date,
                    row.return_date,
                    row.status,
                    row.created_at
                ]
            );
        }

        console.log(
            `borrowing_transactions migrated: ${transactions.length}`
        );

        // 8. Activity logs
        const activityLogs = await sqliteAll(
            'SELECT * FROM activity_logs'
        );

        for (const row of activityLogs) {
            await client.query(
                `
                INSERT INTO activity_logs
                (
                    id,
                    actor_user_id,
                    action,
                    entity_type,
                    entity_id,
                    details,
                    created_at
                )
                VALUES
                ($1,$2,$3,$4,$5,$6,$7)
                ON CONFLICT (id) DO NOTHING
                `,
                [
                    row.id,
                    row.actor_user_id,
                    row.action,
                    row.entity_type,
                    row.entity_id,
                    row.details,
                    row.created_at
                ]
            );
        }

        console.log(`activity_logs migrated: ${activityLogs.length}`);

        // 9. Notifications
        const notifications = await sqliteAll(
            'SELECT * FROM notifications'
        );

        for (const row of notifications) {
            await client.query(
                `
                INSERT INTO notifications
                (
                    id,
                    user_id,
                    title,
                    message,
                    type,
                    is_read,
                    created_at
                )
                VALUES
                ($1,$2,$3,$4,$5,$6,$7)
                ON CONFLICT (id) DO NOTHING
                `,
                [
                    row.id,
                    row.user_id,
                    row.title,
                    row.message,
                    row.type ?? 'info',
                    row.is_read ?? 0,
                    row.created_at
                ]
            );
        }

        console.log(`notifications migrated: ${notifications.length}`);

        // 10. Sessions
        const sessions = await sqliteAll('SELECT * FROM sessions');

        for (const row of sessions) {
            await client.query(
                `
                INSERT INTO sessions
                (
                    id,
                    user_id,
                    token_hash,
                    expires_at,
                    created_at
                )
                VALUES
                ($1,$2,$3,$4,$5)
                ON CONFLICT (id) DO NOTHING
                `,
                [
                    row.id,
                    row.user_id,
                    row.token_hash,
                    row.expires_at,
                    row.created_at
                ]
            );
        }

        console.log(`sessions migrated: ${sessions.length}`);

        // 11. System settings
        const settings = await sqliteAll(
            'SELECT * FROM system_settings'
        );

        for (const row of settings) {
            await client.query(
                `
                INSERT INTO system_settings
                (key, value)
                VALUES ($1, $2)
                ON CONFLICT (key) DO NOTHING
                `,
                [
                    row.key,
                    row.value
                ]
            );
        }

        console.log(`system_settings migrated: ${settings.length}`);

        await client.query('COMMIT');

        console.log('\nMIGRATION COMPLETE.');
        console.log('SQLite database was NOT modified.');
    } catch (error) {
        await client.query('ROLLBACK');

        console.error('\nMIGRATION FAILED.');
        console.error(error.message);

        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
        await closeSqlite();
    }
}

main().catch(async (error) => {
    console.error('\nFATAL ERROR:');
    console.error(error.message);

    await pool.end();
    await closeSqlite();

    process.exitCode = 1;
});