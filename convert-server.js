const fs = require('fs');

const source = fs.readFileSync('./server-source.txt', 'utf8');

const oldDbBlock = `const sqlite3 = require('sqlite3').verbose();
`;

const newDbBlock = `require('dotenv').config();
const { Pool } = require('pg');
`;

let output = source;

// Remove SQLite import
output = output.replace(oldDbBlock, newDbBlock);

// Replace SQLite database initialization + helper functions
const startMarker = `const ROOT = __dirname;
const DB_DIR = path.join(ROOT, 'database');
const DB_FILE = path.join(DB_DIR, 'libratech.db');
fs.mkdirSync(DB_DIR, { recursive: true });

const db = new sqlite3.Database(DB_FILE);
db.serialize(() => db.run('PRAGMA foreign_keys = ON'));

const run = (sql, params=[]) => new Promise((resolve,reject)=>db.run(sql,params,function(err){ if(err) reject(err); else resolve({id:this.lastID,changes:this.changes}); }));
const exec = (sql) => new Promise((resolve,reject)=>db.exec(sql, err=>err?reject(err):resolve()));
const get = (sql, params=[]) => new Promise((resolve,reject)=>db.get(sql,params,(err,row)=>err?reject(err):resolve(row)));
const all = (sql, params=[]) => new Promise((resolve,reject)=>db.all(sql,params,(err,rows)=>err?reject(err):resolve(rows)));
`;

const newDbBlock2 = `const ROOT = __dirname;
const DB_DIR = path.join(ROOT, 'database');
const SCHEMA_FILE = path.join(DB_DIR, 'schema.sql');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured.');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

function convertSql(sql) {
  let index = 0;

  sql = sql.replace(/\\?/g, () => {
    index++;
    return '$' + index;
  });

  sql = sql.replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');

  sql = sql.replace(
    /VALUES\\(([^;]+)\\)/gi,
    (match, values) => match
  );

  sql = sql.replace(
    /datetime\\(([^)]+)\\)/gi,
    '($1)::timestamptz'
  );

  return sql;
}

async function run(sql, params = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(convertSql(sql), params);

    return {
      id: result.rows[0]?.id ?? null,
      changes: result.rowCount
    };
  } finally {
    client.release();
  }
}

async function exec(sql) {
  const client = await pool.connect();

  try {
    await client.query(sql);
  } finally {
    client.release();
  }
}

async function get(sql, params = []) {
  const result = await pool.query(convertSql(sql), params);
  return result.rows[0];
}

async function all(sql, params = []) {
  const result = await pool.query(convertSql(sql), params);
  return result.rows;
}

let txChain = Promise.resolve();

const tx = (fn) => {
  const next = txChain.then(async () => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const originalRun = run;
      const originalGet = get;
      const originalAll = all;

      run = async (sql, params = []) => {
        const result = await client.query(convertSql(sql), params);

        return {
          id: result.rows[0]?.id ?? null,
          changes: result.rowCount
        };
      };

      get = async (sql, params = []) => {
        const result = await client.query(convertSql(sql), params);
        return result.rows[0];
      };

      all = async (sql, params = []) => {
        const result = await client.query(convertSql(sql), params);
        return result.rows;
      };

      try {
        const value = await fn();
        await client.query('COMMIT');
        return value;
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        run = originalRun;
        get = originalGet;
        all = originalAll;
      }
    } finally {
      client.release();
    }
  });

  txChain = next.catch(() => {});
  return next;
};
`;

if (!output.includes(startMarker)) {
    throw new Error('SQLite database block was not found.');
}

output = output.replace(startMarker, newDbBlock2);

// PostgreSQL-compatible INSERT OR IGNORE handling.
// The initialization uses these statements repeatedly.
output = output.replace(
    /INSERT OR IGNORE INTO courses\\(code,name,field_group\\) VALUES\\(\\?,\\?,\\?\\)/g,
    `INSERT INTO courses(code,name,field_group) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`
);

output = output.replace(
    /INSERT OR IGNORE INTO sections\\(course_id,name\\) VALUES\\(\\?,\\?\\)/g,
    `INSERT INTO sections(course_id,name) VALUES($1,$2) ON CONFLICT DO NOTHING`
);

output = output.replace(
    /INSERT OR IGNORE INTO book_courses\\(book_id,course_id\\) VALUES\\(\\?,\\?\\)/g,
    `INSERT INTO book_courses(book_id,course_id) VALUES($1,$2) ON CONFLICT DO NOTHING`
);

// Remove SQLite-specific PRAGMA if it survived.
output = output.replace(
    /db\\.serialize\\(\\(\\) => db\\.run\\('PRAGMA foreign_keys = ON'\\)\\);/g,
    ''
);

// SQLite CURRENT SQLite datetime comparison → PostgreSQL-safe comparison.
output = output.replace(
    /datetime\\(expires_at\\)>datetime\\('now'\\)/g,
    `expires_at > CURRENT_TIMESTAMP`
);

output = output.replace(
    /datetime\\(s\\.expires_at\\)>datetime\\('now'\\)/g,
    `s.expires_at > CURRENT_TIMESTAMP`
);

output = output.replace(
    /datetime\\(due_date\\)<datetime\\('now'\\)/g,
    `due_date < CURRENT_TIMESTAMP`
);

output = output.replace(
    /datetime\\(t\\.due_date\\)<datetime\\('now'\\)/g,
    `t.due_date < CURRENT_TIMESTAMP`
);

output = output.replace(
    /datetime\\(expires_at\\)<=datetime\\('now'\\)/g,
    `expires_at <= CURRENT_TIMESTAMP`
);

// Fix transaction ID retrieval.
// PostgreSQL needs RETURNING id for inserts where the ID is required.
output = output.replace(
    /INSERT INTO users\\(([^)]+)\\) VALUES\\(([^)]+)\\)`/g,
    `INSERT INTO users($1) VALUES($2) RETURNING id`
);

// PostgreSQL does not support SQLite's MIN scalar syntax in exactly
// the same form for this update, so use LEAST.
output = output.replace(
    /available_copies=MIN\\(quantity,available_copies\\+1\\)/g,
    `available_copies=LEAST(quantity,available_copies+1)`
);

// Use PostgreSQL schema file.
output = output.replace(
    `const schema=fs.readFileSync(path.join(DB_DIR,'schema.sql'),'utf8');`,
    `const schema=fs.readFileSync(SCHEMA_FILE,'utf8');`
);

// Vercel/serverless compatibility.
// Only start a local listener when executed directly.
output = output.replace(
    `  app.listen(PORT,()=>console.log(\`LibraTech running at http://localhost:\${PORT}\`));`,
    `  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(\`LibraTech running at http://localhost:\${PORT}\`);
    });
  }`
);

// Export Express app for Vercel.
output += `

module.exports = app;
`;

// Remove accidental duplicate sqlite require if present.
output = output.replace(
    /const sqlite3 = require\\('sqlite3'\\)\\.verbose\\(\\);\\s*/g,
    ''
);

fs.writeFileSync('./server.postgres.js', output);

console.log('Created server.postgres.js successfully.');
