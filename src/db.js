import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Coloca tu contraseña de MySQL
  database: "CEAA_EXP",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
