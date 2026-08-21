require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function check() {
    try {
        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log('NEON CONNECTION: OK');
        console.log('\nTABLES FOUND:');

        if (result.rows.length === 0) {
            console.log('NO TABLES FOUND');
        } else {
            result.rows.forEach(row => {
                console.log(row.table_name);
            });
        }
    } catch (error) {
        console.error('NEON CHECK FAILED');
        console.error(error.message);
    } finally {
        await pool.end();
    }
}

check();