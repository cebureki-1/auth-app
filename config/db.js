const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://ims:EgsP9xwJlDytZJYafJnYmx7Dga4UAd7W@dpg-d2a6s3ur433s73a5m9og-a.oregon-postgres.render.com/finalproject_db_sl55',
  ssl: {rejectUnauthorized: false}
});
console.log(process.env.DATABASE_URL);


module.exports = pool;