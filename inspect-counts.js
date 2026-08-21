const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(
    './database/libratech.db',
    sqlite3.OPEN_READONLY,
    (err) => {
        if (err) {
            console.error('SQLite connection error:', err.message);
            process.exit(1);
        }

        console.log('SQLITE CONNECTION: OK');
    }
);

db.all(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    [],
    (err, tables) => {
        if (err) {
            console.error('Error:', err.message);
            db.close();
            return;
        }

        let remaining = tables.length;

        if (remaining === 0) {
            console.log('No tables found.');
            db.close();
            return;
        }

        tables.forEach((table) => {
            const tableName = table.name.replace(/"/g, '""');

            db.get(
                `SELECT COUNT(*) AS count FROM "${tableName}"`,
                [],
                (err, row) => {
                    if (err) {
                        console.log(`${table.name}: ERROR - ${err.message}`);
                    } else {
                        console.log(`${table.name}: ${row.count}`);
                    }

                    remaining--;

                    if (remaining === 0) {
                        console.log('COUNT INSPECTION COMPLETE.');
                        db.close();
                    }
                }
            );
        });
    }
);