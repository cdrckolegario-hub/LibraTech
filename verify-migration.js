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

function sqliteCount(table) {
    return new Promise((resolve, reject) => {
        sqlite.get(
            `SELECT COUNT(*) AS count FROM "${table}"`,
            [],
            (err, row) => {
                if (err) reject(err);
                else resolve(Number(row.count));
            }
        );
    });
}

async function main() {
    const client = await pool.connect();

    try {
        console.log('VERIFYING SQLITE VS NEON...\n');

        let allMatch = true;

        for (const table of tables) {
            const sqliteCountValue = await sqliteCount(table);

            const result = await client.query(
                `SELECT COUNT(*) AS count FROM "${table}"`
            );

            const postgresCount = Number(result.rows[0].count);

            const match = sqliteCountValue === postgresCount;

            if (!match) {
                allMatch = false;
            }

            console.log(
                `${table}: SQLite=${sqliteCountValue} | Neon=${postgresCount} | ${match ? 'MATCH' : 'MISMATCH'}`
            );
        }

        console.log('');

        if (allMatch) {
            console.log('VERIFICATION SUCCESSFUL.');
            console.log('All table record counts match.');
        } else {
            console.log('VERIFICATION FAILED.');
            console.log('Some table record counts do not match.');
        }
    } catch (error) {
        console.error('VERIFICATION ERROR:');
        console.error(error.message);
    } finally {
        client.release();
        await pool.end();

        sqlite.close();
    }
}

main();