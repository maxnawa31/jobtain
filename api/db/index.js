const {
  Client
} = require('pg');
const db = process.env.NODE_ENV === 'test' ? "users-test" : "jobtain"
client = new Client({
  connectionString: `postgresql://localhost/${db}`
})
client.connect();

module.exports = client;