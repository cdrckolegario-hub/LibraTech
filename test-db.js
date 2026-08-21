require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => {
    console.log('POSTGRESQL CONNECTION: OK');
    return client.end();
  })
  .catch((err) => {
    console.error('POSTGRESQL CONNECTION: FAILED');
    console.error(err.message);
    process.exit(1);
  });