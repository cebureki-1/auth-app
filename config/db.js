const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});

client
  .connect()
  .then(() => console.log("Database Connected Successfully."))
  .catch((error) => console.error("Database connection error:", error));

module.exports = client;
