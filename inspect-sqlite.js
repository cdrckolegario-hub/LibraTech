const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/libratech.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('SQLite connection error:', err.message);
        process.exit(1);
    }

    console.log('SQLITE CONNECTION: OK');
});

db.all(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    [],
    (err, tables) => {
        if (err) {
            console.error('Error reading tables:', err.message);
            db.close();
            process.exit(1);
        }

        console.log('\nTABLES FOUND:');

        if (tables.length === 0) {
            console.log('No tables found.');
            db.close();
            return;
        }

        let remaining = tables.length;

        tables.forEach((table) => {
            console.log(`\n=== ${table.name} ===`);

            db.all(`PRAGMA table_info("${table.name}")`, [], (err, columns) => {
                if (err) {
                    console.error(`Error reading ${table.name}:`, err.message);
                } else {
                    columns.forEach((column) => {
                        console.log(
                            `${column.name} | ${column.type} | NOT NULL: ${column.notnull} | PK: ${column.pk}`
                        );
                    });
                }

                remaining--;

                if (remaining === 0) {
                    console.log('\nINSPECTION COMPLETE.');
                    db.close();
                }
            });
        });
    }
);