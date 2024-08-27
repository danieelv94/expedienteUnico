import { pool } from './db.js'; // Asegúrate de que la ruta sea correcta

(async () => {
  try {
    console.log('Intentando conectar a la base de datos...');
    const connection = await pool.getConnection();
    console.log('Conexión exitosa a la base de datos.');
    connection.release(); // Libera la conexión una vez que hayas terminado
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
  } finally {
    pool.end(); // Cierra todas las conexiones de la pool
  }
})();
