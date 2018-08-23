const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://localhost/jobtain"
})
client.connect();

module.exports = client;