import pool from "./db.js";

async function testConnection() {
  try {
    // Intentar conectar y ejecutar una consulta simple
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log('Conexión exitosa. Resultado de la prueba:', rows[0].solution); // Debería imprimir '2'
  } catch (error) {
    console.error('Error al conectarse a la base de datos:', error);
  } finally {
    // Cerrar la conexión
    pool.end();
  }
}

testConnection();
